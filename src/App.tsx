import { useCallback, lazy, Suspense } from "react";
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
          <Suspense fallback={null}>
            <DashboardPage username={username} />
          </Suspense>
        ) : (
          <LandingPage onSubmit={navigate} />
        )}
      </main>
    </div>
  );
}
