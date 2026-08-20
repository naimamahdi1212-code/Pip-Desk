(function () {
  "use strict";

  var account = window.pipDeskAccount;
  var databases = window.pipDeskDatabases;
  var container = document.getElementById("lessonContent");
  if (!account || !databases || !container) return;

  var PLACEHOLDER_ICON =
    '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.3"/>' +
    '<circle cx="8.5" cy="8.5" r="1.4" stroke="currentColor" stroke-width="1.3"/>' +
    '<path d="M21 15l-5-5-4 4-3-3-6 6" stroke="currentColor" stroke-width="1.3" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function showMessage(text) {
    container.innerHTML = '<p class="lesson-loading mono">' + escapeHtml(text) + "</p>";
  }

  var params = new URLSearchParams(window.location.search);
  var slug = params.get("slug");

  if (!slug) {
    showMessage("No lesson specified.");
    return;
  }

  var currentUser = null;
  var currentLesson = null;

  account
    .get()
    .then(function (user) {
      currentUser = user;
      return databases.listDocuments({
        databaseId: window.PIPDESK_DATABASE_ID,
        collectionId: window.PIPDESK_LESSONS_COLLECTION_ID,
        queries: [
          Appwrite.Query.equal("slug", slug),
          Appwrite.Query.equal("published", true),
          Appwrite.Query.limit(1)
        ]
      });
    })
    .then(function (result) {
      var lessons = result.documents || [];
      if (lessons.length === 0) {
        showMessage("This lesson couldn't be found.");
        return;
      }
      currentLesson = lessons[0];
      renderLesson(currentLesson);
      checkProgress(currentUser.$id, currentLesson.$id);
    })
    .catch(function (error) {
      console.error(error);
      showMessage("Something went wrong loading this lesson.");
    });

  function renderLesson(lesson) {
    var imagePath = lesson.image ? "images/" + lesson.image : "";
    var imageHtml = imagePath
      ? '<div class="lesson-page-image">' +
          '<img src="' + escapeHtml(imagePath) + '" alt="" ' +
          "onerror=\"this.style.display='none'; this.nextElementSibling.style.display='flex';\">" +
          '<div class="lesson-image-fallback">' + PLACEHOLDER_ICON +
          '<span class="mono">' + escapeHtml(imagePath) + "</span></div>" +
        "</div>"
      : "";

    var bodyHtml = window.pipDeskRenderMarkdown(lesson.body);

    container.innerHTML =
      imageHtml +
      '<p class="section-eyebrow">Lesson</p>' +
      "<h1 class=\"lesson-page-title\">" + escapeHtml(lesson.title) + "</h1>" +
      '<div class="lesson-markdown">' + bodyHtml + "</div>" +
      '<div class="lesson-complete-row" id="completeRow">' +
        '<button type="button" class="cta-button" id="completeButton">Mark as complete</button>' +
      "</div>" +
      '<a href="lessons.html" class="back-link back-link-bottom">' +
        '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
        '<path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
        "</svg> Back to lessons</a>";

    var button = document.getElementById("completeButton");
    button.addEventListener("click", function () {
      markComplete(currentUser.$id, currentLesson.$id);
    });
  }

  function showCompletedState() {
    var row = document.getElementById("completeRow");
    if (!row) return;
    row.innerHTML = '<span class="lesson-completed-badge">✓ Completed</span>';
  }

  function checkProgress(userId, lessonId) {
    databases
      .listDocuments({
        databaseId: window.PIPDESK_DATABASE_ID,
        collectionId: window.PIPDESK_PROGRESS_COLLECTION_ID,
        queries: [
          Appwrite.Query.equal("userId", userId),
          Appwrite.Query.equal("lessonId", lessonId),
          Appwrite.Query.limit(1)
        ]
      })
      .then(function (result) {
        if ((result.documents || []).length > 0) {
          showCompletedState();
        }
      })
      .catch(function (error) {
        // Non-fatal — the button just stays as "Mark as complete".
        console.error(error);
      });
  }

  function markComplete(userId, lessonId) {
    var button = document.getElementById("completeButton");
    if (button) {
      button.disabled = true;
      button.textContent = "Saving…";
    }

    databases
      .createDocument({
        databaseId: window.PIPDESK_DATABASE_ID,
        collectionId: window.PIPDESK_PROGRESS_COLLECTION_ID,
        documentId: Appwrite.ID.unique(),
        data: {
          userId: userId,
          lessonId: lessonId,
          completed: true,
          completedAt: new Date().toISOString()
        },
        permissions: [
          Appwrite.Permission.read(Appwrite.Role.user(userId)),
          Appwrite.Permission.update(Appwrite.Role.user(userId)),
          Appwrite.Permission.read(Appwrite.Role.team(window.PIPDESK_ADMIN_TEAM_ID))
        ]
      })
      .then(function () {
        showCompletedState();
      })
      .catch(function (error) {
        console.error(error);
        if (button) {
          button.disabled = false;
          button.textContent = "Mark as complete";
        }
      });
  }
})();
