(function () {
  "use strict";

  var databases = window.pipDeskDatabases;
  var grid = document.getElementById("lessonGrid");
  if (!databases || !grid) return;

  var PLACEHOLDER_ICON =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.4"/>' +
    '<circle cx="8.5" cy="8.5" r="1.4" stroke="currentColor" stroke-width="1.4"/>' +
    '<path d="M21 15l-5-5-4 4-3-3-6 6" stroke="currentColor" stroke-width="1.4" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function tileMarkup(lesson, index) {
    var number = String(index + 1).padStart(2, "0");
    var imagePath = lesson.image ? "images/" + lesson.image : "";
    var imageBlock = imagePath
      ? '<img src="' + escapeHtml(imagePath) + '" alt="" ' +
        "onerror=\"this.style.display='none'; this.nextElementSibling.style.display='flex';\">" +
        '<div class="lesson-image-fallback">' + PLACEHOLDER_ICON +
        '<span class="mono">' + escapeHtml(imagePath) + "</span></div>"
      : '<div class="lesson-image-fallback" style="display:flex;">' + PLACEHOLDER_ICON +
        '<span class="mono">no image set</span></div>';

    return (
      '<a href="lesson.html?slug=' + encodeURIComponent(lesson.slug) + '" class="lesson-tile">' +
        '<div class="lesson-image">' + imageBlock + "</div>" +
        '<div class="lesson-body">' +
          '<p class="lesson-number mono">LESSON ' + number + "</p>" +
          '<h2 class="lesson-title">' + escapeHtml(lesson.title) + "</h2>" +
          '<p class="lesson-desc">' + escapeHtml(lesson.summary) + "</p>" +
          '<span class="lesson-cta">Start lesson →</span>' +
        "</div>" +
      "</a>"
    );
  }

  databases
    .listDocuments({
      databaseId: window.PIPDESK_DATABASE_ID,
      collectionId: window.PIPDESK_LESSONS_COLLECTION_ID,
      queries: [
        Appwrite.Query.equal("published", true),
        Appwrite.Query.orderAsc("order"),
        Appwrite.Query.limit(100)
      ]
    })
    .then(function (result) {
      var lessons = result.documents || [];
      if (lessons.length === 0) {
        grid.innerHTML =
          '<p class="lesson-loading mono">No lessons yet — check back soon.</p>';
        return;
      }
      grid.innerHTML = lessons.map(tileMarkup).join("");
    })
    .catch(function (error) {
      console.error("Failed to load lessons:", error);
      grid.innerHTML =
        '<p class="lesson-loading mono">Couldn\u2019t load lessons right now. Try refreshing.</p>';
    });
})();
