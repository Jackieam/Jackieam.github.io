/* ------------------------------------------------------------------ */
/*  Site mascot — Majin Vegeta, Super Saiyan.                           */
/*                                                                      */
/*  He holds the bottom-right corner, arms crossed, gold aura crackling */
/*  with Super Saiyan 2 lightning, and blasts whatever you click. The   */
/*  Prince does not fetch; he fires. Move rotation, in escalating       */
/*  order of how much he cares:                                         */
/*                                                                      */
/*    default   BIG BANG ATTACK   — palm out, ki sphere flies and       */
/*                                  detonates on the spot               */
/*    every 3rd GALICK GUN        — his original technique, purple beam */
/*                                  fired from the hip                  */
/*    every 6th FINAL FLASH       — arms spread to charge, then both    */
/*                                  palms forward, blue-white lance     */
/*    every 9th FINAL EXPLOSION   — the Majin Vegeta move: he converts  */
/*                                  everything he has into one blast,   */
/*                                  crumbles to dust, and reforms       */
/*                                                                      */
/*  Sprite: images/vegeta.png — 48px frames, 5 cols x 2 rows.           */
/*  Aura, lightning, orb, beams and detonations are DOM/CSS. Pose frames  */
/*  switch on a slow retro tick while position, body lean and the turn    */
/*  squash are eased at 60fps, so attacks wind up and recoil instead of   */
/*  snapping between frames.                                              */
/*  prefers-reduced-motion holds him still rather than removing him; the     */
/*  footer link switches him off entirely (localStorage "site-pet").         */
/* ------------------------------------------------------------------ */

(function () {
  "use strict";

  // The ?v= must be bumped together with the sheet, otherwise browsers keep
  // serving the previously cached PNG (that is what hid his legs).
  var SPRITE_VERSION = "25";
  var SPRITE_URL = "images/vegeta.png?v=" + SPRITE_VERSION;
  // Keep SCALE a whole number. At 1.5 the sheet was drawn at 48 and shown at
  // 72, so every other source pixel came out twice as wide as its neighbour
  // and the pixel grid was visibly uneven. 2 is both bigger and cleaner.
  var SCALE = 2;
  var FRAME_PX = 48;              // source frame size in the sheet
  var SIZE = FRAME_PX * SCALE;    // 96px on screen
  // Sheet geometry is measured from the image itself once it loads, so a
  // stale cached script can never slice a re-laid-out sheet wrongly (that
  // bug showed up as a second Vegeta bleeding in from the next frame).
  var SHEET_COLS = 5;
  var SHEET_ROWS = 2;
  var TICK_MS = 70;
  var HOME_MARGIN = 18;
  var MEDITATE_AFTER = 220;

  var FRAME = {
    idle: 0, point: 1, galick: 2, galickfire: 3, charge: 4,
    flash: 5, boom: 6, meditate: 7, smirk: 8
  };

  /* prefers-reduced-motion does not hide him — it makes him hold still.
     Removing him entirely meant anyone whose OS has animation effects off
     (the default on plenty of Windows machines) saw nothing at all. What that
     setting actually asks for is no *movement*, so in STATIC mode he stands in
     the corner, still changes pose, and his shots land without travelling. */
  var STATIC = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function storeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private */ } }
  function enabled() { return storeGet("site-pet") !== "off"; }

  function t(key, fallback) {
    if (window.siteI18n) {
      var v = window.siteI18n.t(key);
      if (v !== key) return v;
    }
    return fallback;
  }

  var wrap = null, sprite = null, aura = null, bolts = null, bubble = null, timer = null;
  var x = 0, y = 0, facing = -1;
  var pose = "idle";
  var busy = false;
  var blasts = 0;
  var frameNo = 0, idleTicks = 0, shake = 0;
  var bubbleTimer = null;

  // --- motion state, eased every animation frame so nothing snaps ---
  var lean = 0, leanTarget = 0;     // px along the facing direction
  var prevLean = 0;                 // used to derive squash & stretch
  var tilt = 0, tiltTarget = 0;     // degrees of body lean
  var vibrate = 0;                  // rhythmic tremor while charging
  var turnFrom = -1, turnTo = -1, turnStart = 0;
  var TURN_MS = 190;
  var raf = null;

  function faceTowards(f) {
    if (STATIC) { facing = f; return; }
    if (f === facing || (turnStart && turnTo === f)) return;
    turnFrom = facing;
    turnTo = f;
    turnStart = performance.now();
  }

  function setMotion(l, t) {
    if (STATIC) return;                 // he braces and recoils only if motion is wanted
    leanTarget = l; tiltTarget = t;
  }

  /** brief white-hot flash on the sprite as a blast leaves his hands */
  function muzzle() {
    if (!sprite) return;
    sprite.classList.add("vg-fire");
    setTimeout(function () { if (sprite) sprite.classList.remove("vg-fire"); }, 150);
  }

  function homeX() { return window.innerWidth - SIZE / 2 - HOME_MARGIN; }
  function homeY() { return window.innerHeight - SIZE / 2 - HOME_MARGIN; }

  function applySheet() {
    if (!sprite) return;
    sprite.style.backgroundSize =
      (SHEET_COLS * SIZE) + "px " + (SHEET_ROWS * SIZE) + "px";
    setPose(pose);
  }

  // measure the real sheet so the constants above are only a fallback
  (function measure() {
    var probe = new Image();
    probe.onload = function () {
      var c = Math.round(probe.naturalWidth / FRAME_PX);
      var r = Math.round(probe.naturalHeight / FRAME_PX);
      if (c > 0 && r > 0) { SHEET_COLS = c; SHEET_ROWS = r; applySheet(); }
    };
    probe.src = SPRITE_URL;
  })();

  function setPose(name) {
    pose = name;
    var i = FRAME[name];
    sprite.style.backgroundPosition =
      (-(i % SHEET_COLS) * SIZE) + "px " + (-Math.floor(i / SHEET_COLS) * SIZE) + "px";
  }

  /** 60fps render: float bob, eased lean/tilt, the turn squash, and shake.
      Pose switching stays on the slow retro tick; only motion runs smooth. */
  function render(now) {
    if (!wrap) { raf = null; return; }

    if (STATIC) {
      // one placement, no rAF loop: no bob, no tremor, no squash, no turn
      wrap.style.transform =
        "translate(" + (x - SIZE / 2) + "px," + (y - SIZE / 2) + "px)";
      sprite.style.transform = "scaleX(" + facing + ")";
      raf = null;
      return;
    }

    raf = requestAnimationFrame(render);

    lean += (leanTarget - lean) * 0.22;
    tilt += (tiltTarget - tilt) * 0.22;

    // turning: squash horizontally through zero, swapping facing at the middle
    var sx = facing;
    if (turnStart) {
      var k = Math.min(1, (now - turnStart) / TURN_MS);
      if (k < 0.5) {
        sx = turnFrom * (1 - k * 2);
      } else {
        facing = turnTo;
        sx = turnTo * ((k - 0.5) * 2);
      }
      if (k >= 1) { turnStart = 0; sx = facing; }
    }
    if (Math.abs(sx) < 0.06) sx = sx < 0 ? -0.06 : 0.06;   // never fully flat

    var amp = pose === "meditate" ? 4 : 2;
    var bob = busy ? 0
      : Math.round(Math.sin(now / 620) * amp) - (pose === "meditate" ? 5 : 0);

    // tremor: a fast sine carries the motion, a little noise keeps it organic
    var jx = 0, jy = 0;
    if (shake) {
      jx = Math.sin(now / 22) * shake * 0.7 + (Math.random() - 0.5) * shake * 0.5;
      jy = Math.cos(now / 17) * shake * 0.5 + (Math.random() - 0.5) * shake * 0.4;
    }
    if (vibrate) jy += Math.sin(now / 11) * vibrate;

    // squash & stretch straight out of how fast he is moving: he elongates
    // into a thrust and compresses when he is checked by the recoil
    var vel = lean - prevLean;
    prevLean = lean;
    var st = Math.max(-0.13, Math.min(0.13, vel * 0.045));

    wrap.style.transform =
      "translate(" + (x - SIZE / 2 + lean * facing + jx) + "px," +
                     (y - SIZE / 2 + bob + jy) + "px)";
    sprite.style.transform =
      "rotate(" + (tilt * facing) + "deg)" +
      " scaleX(" + (sx * (1 + st)) + ") scaleY(" + (1 - st * 0.75) + ")";
  }

  function setAura(level) { aura.className = "vg-aura vg-aura-" + level; }

  /* `bubble` is nulled by stop(), and a line can still be in flight when the
     visitor switches him off mid-sentence — so both the call and its own
     hide-timer have to tolerate the element having gone away. */
  function say(text, ms) {
    if (!text || !bubble) return;
    bubble.textContent = text;
    bubble.classList.add("on");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () {
      if (bubble) bubble.classList.remove("on");
    }, ms || 1500);
  }

  function hand(dy) {
    return { x: x + facing * SIZE * 0.44, y: y + (dy || 0) };
  }

  /* --------------------------- effects ----------------------------- */

  function detonate(px, py, size) {
    // size: 1 normal, 2 large
    var rings = STATIC ? 0 : (size > 1 ? 3 : 2);   // rings expand; the flash does not
    for (var i = 0; i < rings; i++) {
      (function (i) {
        setTimeout(function () {
          var ring = document.createElement("div");
          ring.className = "vg-shock" + (size > 1 ? " big" : "");
          ring.style.left = px + "px";
          ring.style.top = py + "px";
          document.body.appendChild(ring);
          setTimeout(function () { ring.remove(); }, 780);
        }, i * 100);
      })(i);
    }
    var flash = document.createElement("div");
    flash.className = "vg-boom" + (size > 1 ? " big" : "");
    flash.style.left = px + "px";
    flash.style.top = py + "px";
    document.body.appendChild(flash);
    setTimeout(function () { flash.remove(); }, 560);
  }

  /** rotated beam from a hand to the target */
  function beam(from, tx, ty, cls, ms) {
    if (STATIC) return;
    var dx = tx - from.x, dy = ty - from.y;
    var len = Math.hypot(dx, dy) + 30;
    var ang = Math.atan2(dy, dx) * 180 / Math.PI;
    var holder = document.createElement("div");
    holder.className = "vg-beamwrap";
    holder.style.left = from.x + "px";
    holder.style.top = from.y + "px";
    holder.style.transform = "rotate(" + ang + "deg)";
    var b = document.createElement("div");
    b.className = "vg-beam " + cls;
    b.style.width = len + "px";
    holder.appendChild(b);
    document.body.appendChild(holder);
    requestAnimationFrame(function () { b.classList.add("on"); });
    setTimeout(function () { holder.remove(); }, ms || 900);
  }

  /** ki sphere that flies from the palm to the target */
  function orb(from, tx, ty, done) {
    if (STATIC) { done(); return; }     // nothing crosses the screen
    var el = document.createElement("div");
    el.className = "vg-orb";
    document.body.appendChild(el);
    var t0 = null, DUR = 280;
    (function step(now) {
      if (!el.isConnected) return;
      if (t0 === null) t0 = now;
      var k = Math.min(1, (now - t0) / DUR);
      var e = k * k;
      el.style.transform =
        "translate(" + (from.x + (tx - from.x) * e - 11) + "px," +
                       (from.y + (ty - from.y) * e - 11) + "px) scale(" + (0.6 + k * 0.7) + ")";
      if (k < 1) requestAnimationFrame(step);
      else { el.remove(); done(); }
    })(performance.now());
  }

  /* ------------------------ portrait barrier ----------------------- */
  /* Shots aimed at the portrait are stopped at its barrier instead of
     landing. `blocked` is set once per attack in onClick and cleared in
     rest(), which is the single place a move is allowed to end — so it
     cannot leak into the next shot. */

  var blocked = false;

  /** Where the shot crosses the barrier, or null if it never does.
      Liang-Barsky segment/rectangle clipping: walk the four edges, keeping
      the largest entry parameter. The blast then stops there rather than at
      the click, which is what makes it look deflected instead of absorbed. */
  function barrierEntry(ox, oy, tx, ty) {
    var el = document.getElementById("shield");
    if (!el) return null;
    var r = el.getBoundingClientRect();
    if (!r.width) return null;                       // hidden / not laid out
    if (tx < r.left || tx > r.right || ty < r.top || ty > r.bottom) return null;
    // if he is standing inside the barrier there is nothing between him and
    // the target (can happen on a narrow window where the hero stacks)
    if (ox >= r.left && ox <= r.right && oy >= r.top && oy <= r.bottom) return null;

    var dx = tx - ox, dy = ty - oy;
    var p = [-dx, dx, -dy, dy];
    var q = [ox - r.left, r.right - ox, oy - r.top, r.bottom - oy];
    var enter = 0, exit = 1;
    for (var i = 0; i < 4; i++) {
      if (p[i] === 0) {
        if (q[i] < 0) return null;                   // parallel and outside
      } else {
        var k = q[i] / p[i];
        if (p[i] < 0) { if (k > exit) return null; if (k > enter) enter = k; }
        else          { if (k < enter) return null; if (k < exit) exit = k; }
      }
    }
    return { x: ox + dx * enter, y: oy + dy * enter, el: el };
  }

  /** light the band and drop a ripple where the shot struck it */
  function barrierHit(px, py) {
    var el = document.getElementById("shield");
    if (!el) return;
    // The ripple goes on the figure, not inside .shield: the band is drawn
    // with a mask, and a child would inherit it and be sliced off as it grew.
    var host = el.parentNode || el;
    var r = host.getBoundingClientRect();
    var ping = document.createElement("span");
    ping.className = "shield-ping";
    ping.style.left = (px - r.left) + "px";
    ping.style.top = (py - r.top) + "px";
    host.appendChild(ping);
    el.classList.add("hit");
    setTimeout(function () { ping.remove(); }, 700);
    setTimeout(function () { el.classList.remove("hit"); }, 900);
    say(t("vg.blocked", "A barrier?! ... Hmph. Clever."), 1700);
  }

  /** where a blast lands: deflected off the barrier, or a normal detonation */
  function impact(px, py, size) {
    if (blocked) barrierHit(px, py);
    else detonate(px, py, size);
  }

  /* --------------------------- the moves --------------------------- */

  /** The single place a move is allowed to end. Every transient motion flag
      is cleared here, so a new one can never be forgotten and leave him
      trembling forever (which is exactly what Final Explosion used to do). */
  function rest() {
    shake = 0;
    vibrate = 0;
    blocked = false;
    setMotion(0, 0);
    busy = false;
    idleTicks = 0;
  }

  function finish(delay) {
    setTimeout(function () {          // follow-through: settle back upright
      if (!wrap) return;
      setMotion(2, 2);
    }, Math.max(0, delay - 220));
    setTimeout(function () {
      if (!wrap) return;
      setPose("smirk");
      setAura(1);
      rest();
    }, delay);
  }

  function bigBang(tx, ty) {
    busy = true; idleTicks = 0;
    faceTowards(tx >= x ? 1 : -1);
    setAura(2);
    setMotion(-7, -4);                              // anticipation: draw back
    setTimeout(function () {                        // thrust
      if (!wrap) return;
      setPose("point");
      setMotion(11, 6);
      say(t("vg.bigbang", "BIG BANG ATTACK!"), 1100);
    }, 240);
    setTimeout(function () {
      if (!wrap) return;
      muzzle();
      orb(hand(-SIZE * 0.06), tx, ty, function () { impact(tx, ty, 1); });
      setMotion(4, 4);                              // recoil
    }, 400);
    finish(940);
  }

  function galickGun(tx, ty) {
    busy = true; idleTicks = 0;
    faceTowards(tx >= x ? 1 : -1);
    setAura(2);
    setTimeout(function () {                        // settle into the stance
      if (!wrap) return;
      setPose("galick"); shake = 2; vibrate = 1.2;  // ki building in his hands
      setMotion(-10, -5);                           // coil back over the hip
      say(t("vg.galickcharge", "Galick Gun..."), 900);
    }, 170);
    setTimeout(function () {                        // lunge and fire
      if (!wrap) return;
      shake = 0; vibrate = 0;
      setPose("galickfire");
      setMotion(13, 7);
      muzzle();
      say(t("vg.galick", "FIRE!"), 1200);
      beam(hand(-SIZE * 0.02), tx, ty, "purple", 880);
      setTimeout(function () { impact(tx, ty, 1); }, 200);
    }, 730);
    setTimeout(function () {                        // pushed back by his own beam
      if (!wrap) return;
      setMotion(5, 4); shake = 1.5;
    }, 980);
    finish(1600);
  }

  function finalFlash(tx, ty) {
    busy = true; idleTicks = 0;
    faceTowards(tx >= x ? 1 : -1);
    setAura(3);
    setTimeout(function () {                        // brace, arms spread
      if (!wrap) return;
      setPose("charge"); shake = 4; vibrate = 2;
      setMotion(-8, -5);
      say(t("vg.charge", "This ends now!"), 1300);
    }, 170);
    setTimeout(function () {                        // slam both palms forward
      if (!wrap) return;
      shake = 0; vibrate = 0;
      setPose("flash");
      setMotion(15, 8);
      muzzle();
      say(t("vg.finalflash", "FINAL FLASH!!"), 1500);
      beam(hand(-SIZE * 0.04), tx, ty, "blue", 950);
      setTimeout(function () { impact(tx, ty, 2); }, 240);
    }, 900);
    setTimeout(function () {                        // driven back by the recoil
      if (!wrap) return;
      setMotion(4, 3); shake = 2;
    }, 1150);
    finish(1950);
  }

  /** his signature: everything he has left, then he reforms */
  function finalExplosion() {
    busy = true; idleTicks = 0;
    setPose("charge"); setAura(3); shake = 5; vibrate = 3;
    setMotion(-5, 0);
    say(t("vg.sacrifice", "I do this... for my family!"), 1800);

    setTimeout(function () {
      if (!wrap) return;
      setPose("boom");
      say(t("vg.explosion", "FINAL EXPLOSION!!!"), 1400);
      shake = 8; vibrate = 5;
      muzzle();
      setMotion(0, 0);
    }, 900);

    setTimeout(function () {
      if (!wrap) return;
      shake = 0; vibrate = 0;                  // nothing is left to tremble
      detonate(x, y, 2);
      detonate(x, y, 2);
      var wash = document.createElement("div");
      wash.className = "vg-whiteout";
      document.body.appendChild(wash);
      setTimeout(function () { wash.remove(); }, 900);
      if (!STATIC) wrap.classList.add("vg-dust");   // he crumbles away
    }, 1450);

    setTimeout(function () {                    // ... and reforms
      if (!wrap) return;
      wrap.classList.remove("vg-dust");
      if (!STATIC) wrap.classList.add("vg-reform");
      setPose("smirk"); setAura(1);
      say(t("vg.back", "Hmph. Do not look so surprised."), 1800);
      rest();
      setTimeout(function () { if (wrap) wrap.classList.remove("vg-reform"); }, 700);
    }, 2600);
  }

  /* ----------------------------- loop ------------------------------ */

  function tick() {
    frameNo++;
    if (busy) return;
    idleTicks++;
    if (pose !== "meditate" && idleTicks > MEDITATE_AFTER) {
      setPose("meditate"); setAura(1);
    } else if (pose === "smirk" && idleTicks > 26) {
      setPose("idle");
    }
  }

  /* ---------------------------- clicks ----------------------------- */

  function isInteractive(el) {
    return !!(el && el.closest &&
      el.closest("a, button, input, textarea, select, label, summary"));
  }

  function onClick(e) {
    if (!enabled() || !wrap || busy) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (isInteractive(e.target)) return;
    if (Math.abs(e.clientX - x) < SIZE * 0.5 && Math.abs(e.clientY - y) < SIZE * 0.5) return;

    blasts++;
    if (pose === "meditate") setPose("idle");

    // Aim at the click — unless the portrait's barrier is in the way, in
    // which case the shot stops where it meets the barrier.
    var tx = e.clientX, ty = e.clientY;
    var stop = barrierEntry(x, y, tx, ty);
    blocked = !!stop;
    if (stop) { tx = stop.x; ty = stop.y; }

    var n = blasts % 9;
    if (n === 0) finalExplosion();
    else if (n === 6) finalFlash(tx, ty);
    else if (n === 3) galickGun(tx, ty);
    else bigBang(tx, ty);
  }

  /* ---------------------------- lifecycle -------------------------- */

  function start() {
    if (wrap || !enabled()) return;

    wrap = document.createElement("div");
    wrap.id = "site-vegeta";
    wrap.setAttribute("aria-hidden", "true");
    wrap.style.width = SIZE + "px";
    wrap.style.height = SIZE + "px";

    aura = document.createElement("div");
    aura.className = "vg-aura vg-aura-1";

    bolts = document.createElement("div");
    bolts.className = "vg-bolts";
    bolts.innerHTML = "<i></i><i></i><i></i>";

    sprite = document.createElement("div");
    sprite.className = "vg-sprite";
    sprite.style.width = SIZE + "px";
    sprite.style.height = SIZE + "px";
    sprite.style.backgroundImage = "url('" + SPRITE_URL + "')";
    sprite.style.backgroundSize =
      (SHEET_COLS * SIZE) + "px " + (SHEET_ROWS * SIZE) + "px";

    bubble = document.createElement("div");
    bubble.className = "vg-bubble";

    wrap.appendChild(aura);
    wrap.appendChild(bolts);
    wrap.appendChild(sprite);
    wrap.appendChild(bubble);
    document.body.appendChild(wrap);

    x = homeX(); y = homeY();
    facing = -1;
    blasts = 0; busy = false; idleTicks = 0; shake = 0;
    lean = leanTarget = prevLean = tilt = tiltTarget = 0;
    vibrate = 0; turnStart = 0;
    setPose("idle"); setAura(1);
    timer = setInterval(tick, TICK_MS);
    if (!raf) raf = requestAnimationFrame(render);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    clearTimeout(bubbleTimer);
    if (wrap) wrap.remove();
    wrap = sprite = aura = bolts = bubble = null;
    busy = false;
  }

  document.addEventListener("click", onClick);

  window.addEventListener("resize", function () {
    if (!wrap) return;
    x = homeX(); y = homeY();
    // In STATIC mode render() runs once and stops, so no loop picks the new
    // corner up — place him again by hand.
    if (STATIC) render(0);
  });

  var toggle = document.getElementById("pet-toggle");
  function syncLabel() {
    if (toggle) {
      toggle.textContent = enabled() ? t("pet.off", "Turn it off") : t("pet.on", "Turn it on");
    }
  }
  if (toggle) {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      storeSet("site-pet", storeGet("site-pet") === "off" ? "on" : "off");
      if (enabled()) start(); else stop();
      syncLabel();
    });
  }
  document.addEventListener("sitelang", syncLabel);
  syncLabel();

  start();
})();
