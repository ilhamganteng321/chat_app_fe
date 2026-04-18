import { useEffect } from "react";
import { useTheme } from "reactive-switcher";

function ThemeSync() {
  const { themeName } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeName);
  }, [themeName]);

  return null;
}

export default ThemeSync;
