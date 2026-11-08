/* Apple Dental Clinic audit — dial animation + findings filter.
   No external dependencies. Respects prefers-reduced-motion. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Dial: tick marks + sweep + count-up ---------- */
  var arc = document.getElementById("dialArc");
  var countEl = document.getElementById("dialCount");
  var ticks = document.getElementById("dialTicks");
  var CIRCUMFERENCE = 2 * Math.PI * 108; // r = 108 -> 678.58
  var SCORE = 12;

  // 60 tick marks around the ring, like a clinical instrument.
  if (ticks) {
    var NS = "http://www.w3.org/2000/svg";
    for (var i = 0; i < 60; i++) {
      var a = (i / 60) * Math.PI * 2;
      var major = i % 5 === 0;
      var r1 = major ? 92 : 97;
      var r2 = 102;
      var line = document.createElementNS(NS, "line");
      line.setAttribute("x1", (130 + r1 * Math.cos(a)).toFixed(2));
      line.setAttribute("y1", (130 + r1 * Math.sin(a)).toFixed(2));
      line.setAttribute("x2", (130 + r2 * Math.cos(a)).toFixed(2));
      line.setAttribute("y2", (130 + r2 * Math.sin(a)).toFixed(2));
      line.setAttribute("stroke-width", major ? "2.5" : "1.5");
      line.setAttribute("opacity", major ? "0.85" : "0.45");
      ticks.appendChild(line);
    }
  }

  function setDial(value) {
    var frac = value / 100;
    arc.style.strokeDashoffset = (CIRCUMFERENCE * (1 - frac)).toFixed(1);
    countEl.textContent = Math.round(value);
  }

  if (reduceMotion) {
    setDial(SCORE); // final state immediately, no animation
  } else {
    // Start after the hero entrance (~0.5s), sweep 1.2s ease-out with count-up.
    setTimeout(function () {
      var start = null;
      var DURATION = 1200;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / DURATION, 1);
        var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        setDial(SCORE * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, 500);
  }

  /* ---------- Findings filter ---------- */
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".finding"));
  var statusEl = document.getElementById("filterStatus");

  var LABELS = { all: "all 7 findings", critical: "3 CRITICAL findings", high: "2 HIGH findings", medium: "2 MEDIUM findings" };

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      buttons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
      });
      var shown = 0;
      cards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-severity") === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) shown++;
      });
      statusEl.textContent = "Showing " + LABELS[filter] + ".";
    });
  });
})();
