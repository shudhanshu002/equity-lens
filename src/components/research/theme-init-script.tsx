export function ThemeInitScript() {
    const code = `
    (function () {
      try {
        var savedTheme = localStorage.getItem("equitylens-theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

        if (shouldUseDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (error) {
        document.documentElement.classList.add("dark");
      }
    })();
  `;

    return <script dangerouslySetInnerHTML={{ __html: code }} />;
}