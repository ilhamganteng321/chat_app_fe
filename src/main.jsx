import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { useThemeStore } from "./store/themeStore.js";
import React from "react";

function InitTheme() {
  const theme = useThemeStore((s) => s.theme);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <InitTheme />
    <App />
  </StrictMode>,
);
