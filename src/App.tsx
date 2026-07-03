import { useCallback, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { LandingPage } from "@/features/dashboard/LandingPage";
import { useUrlUsername } from "@/hooks/useUrlUsername";

// Lazily load the dashboard (and its chart library) so it isn't part of the
// initial bundle shown on the landing page.
const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);

export default function App() {
  const [username, navigate] = useUrlUsername();

  const handleGoHome = useCallback(() => {
    navigate("");
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        username={username || undefined}
        onNavigate={navigate}
        onGoHome={handleGoHome}
      />
      <main className="flex-1">
        {username ? (
          // Shown while the lazy dashboard chunk downloads — avoid a blank page
          <Suspense
            fallback={
              <div className="flex justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-(--color-text-muted)" />
              </div>
            }
          >
            {/* Keyed by username so per-user UI state (filters, scroll)
                resets when navigating to a different user */}
            <DashboardPage key={username} username={username} />
          </Suspense>
        ) : (
          <LandingPage onSubmit={navigate} />
        )}
      </main>
    </div>
  );
}
