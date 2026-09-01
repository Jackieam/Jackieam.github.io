/* Theme (follows the OS until the ◐ toggle is used, then remembers that
   choice) + footer year + a tiny console hello. */

(function () {
  "use strict";

  /*  Three states, matching the CSS:
        no stored value  -> no data-theme, and prefers-color-scheme decides
        "light" / "dark" -> stamped on <html>, beating the OS either way

      Older builds were dark-by-default and stored "dark" to mean "drop the
      attribute". Read as an explicit dark choice that is still faithful --
      the visitor did click their way to dark -- so no migration is needed.

      The toggle flips whatever is on screen *now*, which is why it asks the
      media query rather than just reading the attribute: with no attribute
      and a light OS the rendered page is light, so one click must go dark.
      While no attribute is set the OS can change under the page and the CSS
      follows on its own -- nothing here has to listen for that. */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) { /* private mode */ }
  if (stored === "light" || stored === "dark") root.dataset.theme = stored;

  var sysLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)");

  function showingLight() {
    if (root.dataset.theme === "light") return true;
    if (root.dataset.theme === "dark") return false;
    return !!(sysLight && sysLight.matches);
  }

  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var next = showingLight() ? "dark" : "light";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  try {
    console.log("%c▞ jackieam.github.io %c— power level readable. Thanks for stopping by.",
      "color:#3fd8e8;font-weight:bold", "color:inherit");
  } catch (e) { /* no console */ }
})();
