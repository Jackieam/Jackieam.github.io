/* ------------------------------------------------------------------ */
/*  Site telemetry — a small sci-fi HUD in front of the footer.        */
/*                                                                      */
/*  Collapsed it is one line: a 26px wireframe globe and the number of  */
/*  page loads. Click it and it opens a panel with a bigger globe and   */
/*  the breakdown of which countries those visits came from.           */
/*                                                                      */
/*  WHAT IS READ. The country of the network a visit came from, from    */
/*  api.country.is, which answers {"ip": "…", "country": "JP"} — only   */
/*  the country field is used, the ip field is never touched. That      */
/*  country increments one counter and nothing else is recorded: no     */
/*  city, no IP, no fingerprint, no per-visit row, no cookie. All that  */
/*  exists anywhere afterwards is one plain integer per country, which  */
/*  is exactly what the panel shows back. Do Not Track / Global Privacy */
/*  Control skips the lookup entirely — those visits count towards the  */
/*  total and towards no country.                                      */
/*                                                                      */
/*  STORAGE is abacus.jasoncameron.dev — free, no signup, no key, and   */
/*  CORS-open, which is all a static page on GitHub Pages can use.      */
/*  /hit/… increments and returns; /get/… reads without incrementing.   */
/*  Keys are "visits" for the total and "c-JP", "c-US", … per country   */
/*  (abacus wants ≥3 characters, hence the prefix). Change NAMESPACE    */
/*  to reset everything or move it elsewhere; if the service is         */
/*  unreachable the row degrades to "—" and the panel to a dash.        */
/*                                                                      */
/*  WHY THE PANEL FILLS IN IN WAVES. Abacus has no endpoint that lists  */
/*  the keys in a namespace — a counter is only readable if you already */
/*  know its name. So the panel discovers countries by asking for each  */
/*  code in ROSTER. Abacus allows 30 requests per IP per 10s, so the    */
/*  asking goes out 24 at a time, 10.5s apart, most-likely country      */
/*  first, and rows appear as each wave lands. A visitor from a country */
/*  outside ROSTER is still counted, and still sees their own row (its  */
/*  value comes back with the /hit at load) — they just do not show up  */
/*  for everybody else until the code is added below. To find those,    */
/*  run tools/country-scan.py, which sweeps all 249 ISO codes from a    */
/*  shell where the rate limit does not matter.                         */
/*                                                                      */
/*  Keys expire six months after they are last touched, and a read      */
/*  counts as touching, so every country in ROSTER stays alive as long  */
/*  as somebody opens this panel twice a year. A country that drops out */
/*  of ROSTER will quietly expire, which is the intended way to forget. */
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
  var CPREFIX = "c-";                           // per-country key prefix
  var API = "https://abacus.jasoncameron.dev";
  var GEO = "https://api.country.is/";

  var WAVE = 24;                                // codes asked for at once
  var WAVE_GAP = 10500;                         // ms between waves (limit: 30/10s)

  var HOME = { lat: 34.6937, lon: 135.5023 };   // Osaka, Japan

  /* Countries the panel looks for, most likely first — see the note on
     waves above. "code lat lon English name"; the English name is only a
     fallback for browsers without Intl.DisplayNames, which supplies the
     name in whichever language the page is set to. */
  var ROSTER = [
    /* wave 1 — east asia, the anglosphere, western europe */
    "JP 36.2 138.3 Japan", "CN 35.9 104.2 China", "US 39.8 -98.6 United States",
    "GB 54.0 -2.4 United Kingdom", "DE 51.2 10.4 Germany", "KR 36.5 127.9 South Korea",
    "IN 22.0 79.0 India", "FR 46.6 2.4 France", "CA 56.1 -106.3 Canada",
    "TW 23.7 121.0 Taiwan", "HK 22.4 114.1 Hong Kong", "SG 1.4 103.8 Singapore",
    "AU -25.3 133.8 Australia", "IT 42.8 12.6 Italy", "ES 40.2 -3.7 Spain",
    "NL 52.2 5.3 Netherlands", "CH 46.8 8.2 Switzerland", "SE 62.0 15.0 Sweden",
    "BR -10.8 -52.9 Brazil", "RU 61.5 96.0 Russia", "PL 52.0 19.4 Poland",
    "VN 16.0 106.3 Vietnam", "TH 15.1 101.0 Thailand", "ID -2.5 118.0 Indonesia",

    /* wave 2 — the rest of europe, south-east asia, the middle east */
    "MY 4.2 102.0 Malaysia", "PH 12.8 122.9 Philippines", "TR 39.0 35.2 Türkiye",
    "IL 31.4 35.0 Israel", "BE 50.6 4.6 Belgium", "AT 47.6 14.1 Austria",
    "DK 56.0 9.5 Denmark", "NO 64.6 12.0 Norway", "FI 64.5 26.0 Finland",
    "IE 53.2 -8.1 Ireland", "PT 39.6 -8.0 Portugal", "GR 39.1 22.0 Greece",
    "CZ 49.7 15.3 Czechia", "HU 47.2 19.4 Hungary", "RO 45.8 25.0 Romania",
    "UA 48.9 31.3 Ukraine", "MX 23.9 -102.5 Mexico", "AR -35.4 -65.2 Argentina",
    "CL -37.7 -71.4 Chile", "CO 3.9 -73.1 Colombia", "ZA -29.0 25.1 South Africa",
    "EG 26.5 29.9 Egypt", "SA 24.1 44.5 Saudi Arabia", "AE 24.0 54.0 United Arab Emirates",

    /* wave 3 — south and central asia, the balkans, the baltics, africa */
    "NZ -41.5 172.8 New Zealand", "PK 29.9 69.3 Pakistan", "BD 23.9 90.2 Bangladesh",
    "LK 7.6 80.7 Sri Lanka", "NP 28.3 83.9 Nepal", "IR 32.6 54.3 Iran",
    "KZ 48.2 67.3 Kazakhstan", "UZ 41.7 63.1 Uzbekistan", "MN 46.8 103.1 Mongolia",
    "MM 21.2 96.5 Myanmar", "KH 12.7 104.9 Cambodia", "LA 18.5 103.7 Laos",
    "BG 42.8 25.2 Bulgaria", "RS 44.2 20.8 Serbia", "HR 45.1 16.4 Croatia",
    "SK 48.7 19.5 Slovakia", "SI 46.1 14.8 Slovenia", "LT 55.3 23.9 Lithuania",
    "LV 56.9 24.9 Latvia", "EE 58.7 25.5 Estonia", "NG 9.6 8.1 Nigeria",
    "KE 0.5 37.9 Kenya", "MA 31.9 -6.9 Morocco", "PE -9.2 -75.0 Peru"
  ];

  var PLACE = {};                                // code -> {lat, lon, name}
  var CODES = ROSTER.map(function (row) {
    var f = row.split(" ");
    PLACE[f[0]] = { lat: +f[1], lon: +f[2], name: f.slice(3).join(" ") };
    return f[0];
  });

  var panel = document.getElementById("tele-panel");
  var toggle = document.getElementById("tele-toggle");
  var smallCanvas = document.getElementById("tele-globe");
  var bigCanvas = document.getElementById("tele-map");
  var countEl = document.getElementById("tele-count");
  var listEl = document.getElementById("tele-list");
  var ncEl = document.getElementById("tele-nc");
  var scanEl = document.getElementById("tele-scan");
  var wrap = document.getElementById("telemetry");
  if (!wrap || !panel || !toggle || !smallCanvas || !bigCanvas || !countEl || !listEl) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /*  Do Not Track and Global Privacy Control both mean "do not build a
      profile of me". A country tally is about as far from a profile as a
      counter gets, but the honest reading of the signal is to not ask
      where this person is at all, so the lookup is skipped outright. */
  var tracked = !(navigator.doNotTrack === "1" || window.doNotTrack === "1" ||
                  navigator.msDoNotTrack === "1" || navigator.globalPrivacyControl === true);

  /* Countries with a known count, filled in by the load hit and the waves. */
  var counts = {};
  var mine = null;                               // this visitor's country code
  var scanned = false;                           // waves already run this session

  function t(key, fallback) {
    if (window.siteI18n && window.siteI18n.t) {
      var s = window.siteI18n.t(key);
      if (s && s !== key) return s;
    }
    return fallback;
  }

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
  var verb = counted ? "/get" : "/hit";

  function ask(key) {
    return fetch(API + verb + "/" + NAMESPACE + "/" + key)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return (j && typeof j.value === "number") ? j.value : null; });
  }

  ask(KEY)
    .then(function (n) {
      if (n === null) throw new Error("no count");
      try { sessionStorage.setItem("visit-counted", "1"); } catch (e) { /* private mode */ }
      countUp(n);
    })
    .catch(function () { countEl.textContent = "—"; });

  /* ------------------------ this visit's country -------------------- */

  /*  One /hit on this country's key is the entire write path. It runs
      before anyone opens the panel so that the number a visitor sees
      already includes them — and because the response is that country's
      total, a visitor from outside ROSTER still gets their own row. */
  if (tracked) {
    fetch(GEO)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var cc = j && typeof j.country === "string" && /^[A-Z]{2}$/.test(j.country) ? j.country : null;
        if (!cc) return;
        mine = cc;
        return ask(CPREFIX + cc).then(function (n) {
          if (n !== null) { counts[cc] = n; refresh(); }
        });
      })
      .catch(function () { /* offline, blocked, or the lookup is down */ });
  }

  /* --------------------- country roster discovery ------------------- */

  function readCountry(code) {
    return fetch(API + "/get/" + NAMESPACE + "/" + CPREFIX + code)
      .then(function (r) {
        if (r.status === 429) return { retry: true };          // rate limited
        if (!r.ok) return null;                                // 404 = nobody yet
        return r.json().then(function (j) {
          return (j && typeof j.value === "number" && j.value > 0) ? { n: j.value } : null;
        });
      })
      .catch(function () { return null; });
  }

  function scan() {
    if (scanned) return;
    scanned = true;

    var queue = CODES.filter(function (c) { return c !== mine; });
    var attempts = {};

    (function wave() {
      if (!queue.length) { done(); return; }
      var batch = queue.splice(0, WAVE);
      if (scanEl) scanEl.hidden = false;

      Promise.all(batch.map(function (code) {
        return readCountry(code).then(function (res) {
          if (!res) return;
          if (res.retry) {
            attempts[code] = (attempts[code] || 0) + 1;
            if (attempts[code] < 3) queue.push(code);          // try again next wave
            return;
          }
          counts[code] = res.n;
        });
      })).then(function () {
        refresh();
        if (!queue.length) { done(); return; }
        setTimeout(wave, WAVE_GAP);
      });
    })();

    function done() {
      if (scanEl) scanEl.hidden = true;
      refresh();
    }
  }

  /* ---------------------------- the list ---------------------------- */

  var display = null;                            // cached Intl.DisplayNames
  function nameOf(code) {
    var lang = document.documentElement.lang || "en";
    try {
      if (!display || display.lang !== lang) {
        display = { lang: lang, of: new Intl.DisplayNames([lang], { type: "region" }) };
      }
      var n = display.of.of(code);
      if (n && n !== code) return n;
    } catch (e) { /* no Intl.DisplayNames — fall through */ }
    return (PLACE[code] && PLACE[code].name) || code;
  }

  /*  Regional indicator symbols: "JP" -> 🇯🇵. Windows draws the two
      letters instead of a flag, which still reads fine next to the name. */
  function flagOf(code) {
    return String.fromCodePoint(
      0x1F1E6 + code.charCodeAt(0) - 65,
      0x1F1E6 + code.charCodeAt(1) - 65
    );
  }

  function rows() {
    return Object.keys(counts)
      .filter(function (c) { return counts[c] > 0; })
      .sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });
  }

  function refresh() {
    var order = rows();
    if (ncEl) ncEl.textContent = order.length ? order.length.toLocaleString() : "—";

    listEl.textContent = "";
    if (!order.length) {
      var empty = document.createElement("li");
      empty.className = "tele-empty";
      empty.textContent = scanned ? t("tele.none", "no country/region data yet") : "…";
      listEl.appendChild(empty);
    } else {
      var max = counts[order[0]];
      order.forEach(function (code) {
        var li = document.createElement("li");
        li.className = "tele-item" + (code === mine ? " you" : "");

        var flag = document.createElement("span");
        flag.className = "tele-flag";
        flag.textContent = flagOf(code);

        var name = document.createElement("span");
        name.className = "tele-name";
        name.textContent = nameOf(code);
        if (code === mine) {
          var you = document.createElement("span");
          you.className = "tele-you";
          you.textContent = t("tele.you", "you");
          name.appendChild(you);
        }

        var bar = document.createElement("span");
        bar.className = "tele-bar";
        var fill = document.createElement("i");
        fill.style.width = Math.max(4, Math.round(counts[code] / max * 100)) + "%";
        bar.appendChild(fill);

        var n = document.createElement("span");
        n.className = "tele-n";
        n.textContent = counts[code].toLocaleString();

        li.appendChild(flag); li.appendChild(name); li.appendChild(bar); li.appendChild(n);
        listEl.appendChild(li);
      });
    }

    marks = order.map(function (code) {
      return {
        lat: PLACE[code] ? PLACE[code].lat : 0,
        lon: PLACE[code] ? PLACE[code].lon : 0,
        weight: counts[code] / counts[order[0]],
        you: code === mine,
        known: !!PLACE[code]
      };
    }).filter(function (m) { return m.known; });

    if (reduced) paint();
  }

  document.addEventListener("sitelang", function () { if (rows().length) refresh(); });

  /* --------------------------- open/close --------------------------- */

  function open(yes) {
    panel.hidden = !yes;
    wrap.classList.toggle("open", yes);
    toggle.setAttribute("aria-expanded", yes ? "true" : "false");
    if (yes) { scan(); if (reduced) paint(); }
  }

  toggle.addEventListener("click", function () { open(panel.hidden); });

  document.addEventListener("click", function (e) {
    if (!panel.hidden && !wrap.contains(e.target)) open(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { open(false); toggle.focus(); }
  });

  /* --------------------------- the globes --------------------------- */
  /*  Two canvases, one render pass: the 26px one in the footer row only
      ever shows the home marker, the 120px one inside the panel also
      carries a dot per country, brighter the more visits it stands for. */

  var marks = [];
  var TILT = 0.35;
  var home = { phi: HOME.lat * Math.PI / 180, lam: -HOME.lon * Math.PI / 180 };

  var accent = "#3fd8e8", accent2 = "#9d8cff";
  function refreshAccent() {
    var cs = getComputedStyle(document.documentElement);
    var a = cs.getPropertyValue("--accent").trim();
    var b = cs.getPropertyValue("--accent-2").trim();
    if (a) accent = a;
    if (b) accent2 = b;
  }
  refreshAccent();
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", function () { setTimeout(function () { refreshAccent(); if (reduced) paint(); }, 0); });

  function makeGlobe(canvas, css, r, dots) {
    var DPR = window.devicePixelRatio || 1;
    canvas.width = Math.round(css * DPR);
    canvas.height = Math.round(css * DPR);
    canvas.style.width = css + "px";
    canvas.style.height = css + "px";
    var ctx = canvas.getContext("2d");
    ctx.scale(DPR, DPR);

    var CX = css / 2, CY = css / 2, R = r;

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

    /*  The 26px globe keeps the sparse wireframe it has always had — three
        rings and four meridians is all that reads at that size. The 120px
        one in the panel gets a denser mesh and finer sampling, which only
        looks like mush when it is shrunk back down. */
    var big = R > 20;
    var LATS = big ? [-60, -40, -20, 0, 20, 40, 60] : [-40, 0, 40];
    var LONS = big ? [0, 30, 60, 90, 120, 150] : [0, 45, 90, 135];
    var STEP = big ? 4 : 8;

    return function draw(theta, now) {
      ctx.clearRect(0, 0, css, css);
      ctx.strokeStyle = accent;
      ctx.fillStyle = accent;
      ctx.lineWidth = 0.8;

      // outline
      ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.stroke();

      var i, a, pts;
      for (i = 0; i < LATS.length; i++) {                 // latitude rings
        pts = [];
        for (a = 0; a <= 360; a += STEP) pts.push(project(LATS[i] * Math.PI / 180, a * Math.PI / 180, theta));
        polyline(pts);
      }
      for (i = 0; i < LONS.length; i++) {                 // meridians
        pts = [];
        for (a = -90; a <= 90; a += STEP) pts.push(project(a * Math.PI / 180, LONS[i] * Math.PI / 180, theta));
        polyline(pts);
      }

      // visitor countries
      if (dots) {
        ctx.fillStyle = accent2;
        for (i = 0; i < marks.length; i++) {
          var m = marks[i];
          var q = project(m.lat * Math.PI / 180, -m.lon * Math.PI / 180, theta);
          if (q.z <= 0) continue;
          ctx.fillStyle = m.you ? accent : accent2;
          ctx.globalAlpha = 0.35 + 0.6 * m.weight;
          ctx.beginPath(); ctx.arc(q.x, q.y, 1.4 + 1.6 * m.weight, 0, 7); ctx.fill();
          if (m.you) {
            ctx.globalAlpha = 0.7;
            ctx.strokeStyle = accent;
            ctx.beginPath(); ctx.arc(q.x, q.y, 4.5, 0, 7); ctx.stroke();
          }
        }
        ctx.strokeStyle = accent;
        ctx.fillStyle = accent;
      }

      // home marker
      var p = project(home.phi, home.lam, theta);
      if (p.z > 0) {
        var pulse = (now / 1600) % 1;
        ctx.globalAlpha = 0.45 * (1 - pulse);
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 + pulse * 4, 0, 7); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
  }

  var drawSmall = makeGlobe(smallCanvas, 26, 11, false);
  var drawBig = makeGlobe(bigCanvas, 120, 52, true);

  function paint() {
    drawSmall(0.8, 0);
    if (!panel.hidden) drawBig(0.8, 0);
  }

  if (reduced) {
    paint();
  } else {
    (function loop(now) {
      drawSmall(now * 0.00025, now);
      if (!panel.hidden) drawBig(now * 0.00025, now);
      requestAnimationFrame(loop);
    })(0);
  }
})();
