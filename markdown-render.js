(function () {
  "use strict";

  // Relies on marked.js and DOMPurify being loaded via <script> tags
  // before this file. Both are just parsing/sanitizing libraries —
  // no build step, no framework.
  window.pipDeskRenderMarkdown = function (rawText) {
    if (!rawText) return "";
    if (typeof marked === "undefined" || typeof DOMPurify === "undefined") {
      console.error("marked or DOMPurify failed to load.");
      // Fall back to escaped plain text so nothing renders unsafely.
      var div = document.createElement("div");
      div.textContent = rawText;
      return div.innerHTML;
    }
    var html = marked.parse(rawText);
    return DOMPurify.sanitize(html);
  };
})();
