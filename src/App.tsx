import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { useUrlUser } from "./useUrlUser";

export default function App() {
  const [login, navigate] = useUrlUser();
  return (
    <div className={login ? "q-app q-app--wide" : "q-app"}>
      {login ? (
        // Keyed by user so filters and fetch state start fresh for each one.
        <Dashboard key={login.toLowerCase()} login={login} onBack={() => navigate("")} />
      ) : (
        <Home onOpen={navigate} />
      )}
    </div>
  );
}
