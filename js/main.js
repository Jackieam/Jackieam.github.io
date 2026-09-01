/* Theme (always follows the OS; the ◐ toggle overrides it for the current
   view only) + footer year + a tiny console hello. */

(function () {
  "use strict";

  /*  Two states, and only one of them survives a reload:
        no data-theme  -> prefers-color-scheme decides. Every load starts here.
        data-theme set -> the toggle's override, for this view only.

      The override is deliberately NOT remembered, exactly like the language
      picker: reloading returns to whatever the OS asks for, so the page can
      never sit in a theme the machine is not using. Older builds did persist
      it, so that key is cleared here -- a browser still carrying one would
      otherwise stay pinned to a stale choice. To make it sticky again, read
      the key back into dataset.theme and write it in the click handler.

      The toggle flips whatever is on screen *now*, which is why it asks the
      media query rather than only reading the attribute: with no attribute on
      a light OS the rendered page is light, so one click must go dark. While
      no attribute is set the OS can change under the page and the CSS follows
      on its own -- nothing here has to listen for that. */
  var root = document.documentElement;
  try { localStorage.removeItem("theme"); } catch (e) { /* private mode */ }

  var sysLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)");

  function showingLight() {
    if (root.dataset.theme === "light") return true;
    if (root.dataset.theme === "dark") return false;
    return !!(sysLight && sysLight.matches);
  }

  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      root.dataset.theme = showingLight() ? "dark" : "light";
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  try {
    console.log("%c▞ jackieam.github.io %c— power level readable. Thanks for stopping by.",
      "color:#3fd8e8;font-weight:bold", "color:inherit");
  } catch (e) { /* no console */ }
})();
