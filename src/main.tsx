import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./quiet.css";
import "./app.css";
import App from "./App";
import { LangProvider } from "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
);
