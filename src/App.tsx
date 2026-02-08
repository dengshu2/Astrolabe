import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LandingPage } from "@/features/dashboard/LandingPage";

export default function App() {
  const [username, setUsername] = useState("");

  const handleNavigate = useCallback((name: string) => {
    setUsername(name);
  }, []);

  const handleGoHome = useCallback(() => {
    setUsername("");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        username={username || undefined}
        onNavigate={handleNavigate}
        onGoHome={handleGoHome}
      />
      <main className="flex-1">
        {username ? (
          <DashboardPage username={username} />
        ) : (
          <LandingPage onSubmit={handleNavigate} />
        )}
      </main>
    </div>
  );
}
