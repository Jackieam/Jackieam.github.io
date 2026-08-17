/* Theme toggle (dark by default, light via toggle, remembered in
   localStorage) + footer year + a tiny console hello. */

(function () {
  "use strict";

  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) { /* private mode */ }
  if (stored === "light") root.dataset.theme = "light";

  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var light = root.dataset.theme === "light";
      if (light) delete root.dataset.theme;
      else root.dataset.theme = "light";
      try { localStorage.setItem("theme", light ? "dark" : "light"); } catch (e) { /* private mode */ }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  try {
    console.log("%c▞ jackieam.github.io %c— power level readable. Thanks for stopping by.",
      "color:#3fd8e8;font-weight:bold", "color:inherit");
  } catch (e) { /* no console */ }
})();
