(function () {
  "use strict";

  // ============================================================
  // Appwrite project config
  // Safe to expose client-side — this is how the Appwrite Web SDK
  // is designed to be used (it's a project ID, not a secret key).
  // ============================================================
  var APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
  var APPWRITE_PROJECT_ID = "6a8431580028e56302b6";

  if (typeof Appwrite === "undefined") {
    console.error(
      "Appwrite SDK not loaded — check the <script> tag for the Appwrite CDN."
    );
    return;
  }

  var client = new Appwrite.Client();
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

  // Exposed globally so auth.js (login page) and guard.js (home page)
  // can both use the same configured client without duplicating it.
  window.pipDeskAccount = new Appwrite.Account(client);
})();
