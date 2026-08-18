(function () {
  "use strict";

  var account = window.pipDeskAccount;
  var html = document.documentElement;

  function reveal() {
    html.classList.remove("auth-checking");
  }

  function wireLogout() {
    var btn = document.getElementById("logoutButton");
    if (!btn) return;
    btn.addEventListener("click", function () {
      btn.disabled = true;
      account
        .deleteSession("current")
        .catch(function () {
          // Even if the delete call fails (e.g. session already
          // expired), still send the user back to the login page.
        })
        .then(function () {
          window.location.href = "index.html";
        });
    });
  }

  if (!account) {
    // Appwrite SDK failed to load — fail closed and send to login
    // rather than showing a page we can't verify access to.
    window.location.href = "index.html";
    return;
  }

  // account.get() hits Appwrite's real API — this is a genuine check
  // against the backend, not just a client-side flag.
  account
    .get()
    .then(function () {
      reveal();
      wireLogout();
    })
    .catch(function () {
      window.location.href = "index.html";
    });
})();
