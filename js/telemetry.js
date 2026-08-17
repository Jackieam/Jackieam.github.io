/* ------------------------------------------------------------------ */
/*  Site telemetry — a small sci-fi HUD in front of the footer.        */
/*                                                                      */
/*  Shows the site's own visit history, NOT anything about the person   */
/*  reading the page: no geolocation, no IP readout, no fingerprinting. */
/*  The wireframe globe is decoration; its marker sits on Osaka (where  */
/*  this site is from), not on the visitor.                             */
/*                                                                      */
/*  The counter is abacus.jasoncameron.dev — free, no signup, no key,   */
/*  and CORS-open, which is all a static page on GitHub Pages can use.  */
/*  /hit/… increments and returns; /get/… reads without incrementing.   */
/*  Change NAMESPACE/KEY to reset the count or move it elsewhere; if    */
/*  the service is unreachable the row degrades to "—".                 */
/*                                                                      */
/*  These free counters do disappear — this page previously used        */
/*  counterapi.dev v1, which was retired and started answering 410.     */
/*  If the number goes quiet, that is the first thing to check: any     */
/*  host returning {"value": n} over CORS is a drop-in replacement.     */
/* ------------------------------------------------------------------ */

(function () {
  "use strict";

  var NAMESPACE = "jackieam-github-io";
  var KEY = "visits";
  var API = "https://abacus.jasoncameron.dev";
  var PATH = "/" + NAMESPACE + "/" + KEY;

  var HOME = { lat: 34.6937, lon: 135.5023 };   // Osaka, Japan

  var panel = document.getElementById("telemetry");
  var canvas = document.getElementById("tele-globe");
  var countEl = document.getElementById("tele-count");
  if (!panel || !canvas || !countEl) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------- visit count --------------------------- */

  function render(n) {
    countEl.textContent = n.toLocaleString();
  }

  function countUp(target) {
    if (reduced || target <= 0) { render(target); return; }
    var start = performance.now(), DUR = 900;
    (function step(now) {
      var p = Math.min(1, (now - start) / DUR);
      var eased = 1 - Math.pow(1 - p, 3);
      render(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  var counted = false;
  try { counted = sessionStorage.getItem("visit-counted") === "1"; } catch (e) { /* private mode */ }

  fetch(API + (counted ? "/get" : "/hit") + PATH)
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j || typeof j.value !== "number") throw new Error("no count");
      try { sessionStorage.setItem("visit-counted", "1"); } catch (e) { /* private mode */ }
      countUp(j.value);
    })
    .catch(function () { countEl.textContent = "—"; });

  /* --------------------------- globe ------------------------------- */

  var CSS = 26, DPR = window.devicePixelRatio || 1;
  canvas.width = CSS * DPR; canvas.height = CSS * DPR;
  canvas.style.width = CSS + "px"; canvas.style.height = CSS + "px";
  var ctx = canvas.getContext("2d");
  ctx.scale(DPR, DPR);

  var R = 11, CX = CSS / 2, CY = CSS / 2, TILT = 0.35;
  var mark = { phi: HOME.lat * Math.PI / 180, lam: -HOME.lon * Math.PI / 180 };

  var accent = "#3fd8e8";
  function refreshAccent() {
    var c = getComputedStyle(canvas).color;
    if (c) accent = c;
  }
  refreshAccent();
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", function () { setTimeout(refreshAccent, 0); });

  function project(phi, lam, theta) {
    var x = Math.cos(phi) * Math.cos(lam + theta);
    var y = Math.sin(phi);
    var z = Math.cos(phi) * Math.sin(lam + theta);
    var y2 = y * Math.cos(TILT) - z * Math.sin(TILT);
    var z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
    return { x: CX + R * x, y: CY - R * y2, z: z2 };
  }

  function polyline(pts) {
    for (var pass = 0; pass < 2; pass++) {           // 0 = back, 1 = front
      ctx.globalAlpha = pass ? 0.55 : 0.13;
      ctx.beginPath();
      var pen = false;
      for (var i = 0; i < pts.length; i++) {
        var front = pts[i].z > 0;
        if (front === !!pass) {
          if (pen) ctx.lineTo(pts[i].x, pts[i].y);
          else { ctx.moveTo(pts[i].x, pts[i].y); pen = true; }
        } else pen = false;
      }
      ctx.stroke();
    }
  }

  function draw(theta, now) {
    ctx.clearRect(0, 0, CSS, CSS);
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    ctx.lineWidth = 0.8;

    // outline
    ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.stroke();

    // latitude rings
    var i, a, pts;
    for (i = -40; i <= 40; i += 40) {
      pts = [];
      for (a = 0; a <= 360; a += 10) pts.push(project(i * Math.PI / 180, a * Math.PI / 180, theta));
      polyline(pts);
    }
    // meridians
    for (i = 0; i < 180; i += 45) {
      pts = [];
      for (a = -90; a <= 90; a += 8) pts.push(project(a * Math.PI / 180, i * Math.PI / 180, theta));
      polyline(pts);
    }

    // home marker
    var p = project(mark.phi, mark.lam, theta);
    if (p.z > 0) {
      var pulse = (now / 1600) % 1;
      ctx.globalAlpha = 0.45 * (1 - pulse);
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 + pulse * 4, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (reduced) {
    draw(0.8, 0);
  } else {
    (function loop(now) {
      draw(now * 0.00025, now);
      requestAnimationFrame(loop);
    })(0);
  }
})();
