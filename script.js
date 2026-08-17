(function () {
  "use strict";

  // Sample pairs with a starting price and decimal precision.
  // These are illustrative only — not connected to any real market feed.
  var PAIRS = [
    { pair: "EUR/USD", price: 1.0842, decimals: 4 },
    { pair: "GBP/USD", price: 1.2651, decimals: 4 },
    { pair: "USD/JPY", price: 156.32, decimals: 2 },
    { pair: "USD/KES", price: 129.15, decimals: 2 },
    { pair: "AUD/USD", price: 0.6524, decimals: 4 },
    { pair: "USD/CAD", price: 1.3712, decimals: 4 },
    { pair: "NZD/USD", price: 0.6011, decimals: 4 },
    { pair: "USD/CHF", price: 0.8823, decimals: 4 },
    { pair: "USD/ZAR", price: 18.243, decimals: 3 },
    { pair: "EUR/GBP", price: 0.8571, decimals: 4 }
  ];

  var track = document.getElementById("tickerTrack");
  if (!track) return;

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Each ticker item's live state lives here so both copies of the
  // track (needed for the seamless scroll loop) can be updated together.
  var state = PAIRS.map(function (p) {
    return { pair: p.pair, price: p.price, decimals: p.decimals, dir: 0 };
  });

  function formatPrice(value, decimals) {
    return value.toFixed(decimals);
  }

  function buildItemMarkup(entry, index) {
    return (
      '<span class="ticker-item" data-index="' + index + '">' +
        '<span class="ticker-pair mono">' + entry.pair + "</span>" +
        '<span class="ticker-price mono" data-role="price">' +
          formatPrice(entry.price, entry.decimals) +
        "</span>" +
        '<span class="ticker-delta mono" data-role="delta">&nbsp;</span>' +
      "</span>"
    );
  }

  function render() {
    var itemsHtml = state.map(buildItemMarkup).join("");
    // Duplicate the sequence once so translateX(-50%) loops seamlessly.
    track.innerHTML = itemsHtml + itemsHtml;
  }

  render();

  if (reduceMotion) {
    // Respect reduced-motion: no scrolling, no flicker loop.
    return;
  }

  function tick() {
    // Pick a handful of pairs to nudge this cycle, like a live feed
    // where not everything updates at once.
    var updates = 2 + Math.floor(Math.random() * 3);
    var touched = {};

    for (var n = 0; n < updates; n++) {
      var idx = Math.floor(Math.random() * state.length);
      if (touched[idx]) continue;
      touched[idx] = true;

      var entry = state[idx];
      var pip = Math.pow(10, -entry.decimals);
      var steps = 1 + Math.floor(Math.random() * 3);
      var goingUp = Math.random() > 0.5;
      var change = pip * steps * (goingUp ? 1 : -1);

      entry.price = Math.max(0.0001, entry.price + change);
      entry.dir = goingUp ? 1 : -1;

      applyFlicker(idx, entry, steps);
    }
  }

  function applyFlicker(idx, entry, steps) {
    var selector = '.ticker-item[data-index="' + idx + '"]';
    var nodes = track.querySelectorAll(selector);
    var priceText = formatPrice(entry.price, entry.decimals);
    var deltaText =
      (entry.dir > 0 ? "+" : "\u2212") + steps + "p";
    var flashClass = entry.dir > 0 ? "flash-up" : "flash-down";

    nodes.forEach(function (node) {
      var priceEl = node.querySelector('[data-role="price"]');
      var deltaEl = node.querySelector('[data-role="delta"]');
      if (!priceEl || !deltaEl) return;

      priceEl.textContent = priceText;
      deltaEl.textContent = deltaText;

      priceEl.classList.remove("flash-up", "flash-down");
      deltaEl.classList.remove("flash-up", "flash-down");
      // Force reflow so the class can be re-added to restart any
      // CSS transition even if the same direction flashes twice in a row.
      void priceEl.offsetWidth;
      priceEl.classList.add(flashClass);
      deltaEl.classList.add(flashClass);

      window.clearTimeout(node._flickerTimeout);
      node._flickerTimeout = window.setTimeout(function () {
        priceEl.classList.remove("flash-up", "flash-down");
      }, 900);
    });
  }

  window.setInterval(tick, 1400);
})();
