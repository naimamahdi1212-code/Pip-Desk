(function () {
  "use strict";

  // ============================================================
  // Appwrite project config
  // Safe to expose client-side — this is how the Appwrite Web SDK
  // is designed to be used (it's a project ID, not a secret key).
  // ============================================================
  var APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
  var APPWRITE_PROJECT_ID = "6a8431580028e56302b6";

  // ============================================================
  // Fill these in once the database, collections, and team exist
  // in the Appwrite console (see the setup steps).
  // ============================================================
  window.PIPDESK_DATABASE_ID = "<YOUR_DATABASE_ID_HERE>";
  window.PIPDESK_LESSONS_COLLECTION_ID = "<YOUR_LESSONS_COLLECTION_ID_HERE>";
  window.PIPDESK_PROGRESS_COLLECTION_ID = "<YOUR_PROGRESS_COLLECTION_ID_HERE>";
  window.PIPDESK_ADMIN_TEAM_ID = "<YOUR_ADMIN_TEAM_ID_HERE>";

  if (typeof Appwrite === "undefined") {
    console.error(
      "Appwrite SDK not loaded — check the <script> tag for the Appwrite CDN."
    );
    return;
  }

  var client = new Appwrite.Client();
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

  // Exposed globally so every page's script (auth.js, guard.js,
  // admin.js, lessons-list.js, lesson.js, admin-guard.js) can share
  // the same configured clients without duplicating setup.
  window.pipDeskAccount = new Appwrite.Account(client);
  window.pipDeskDatabases = new Appwrite.Databases(client);
  window.pipDeskTeams = new Appwrite.Teams(client);
})();
