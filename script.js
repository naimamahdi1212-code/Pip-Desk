(function () {
  "use strict";

  var account = window.pipDeskAccount;
  var html = document.documentElement;

  function reveal() {
    html.classList.remove("auth-checking");
  }

  if (!account) {
    // SDK failed to load — just show the form rather than blocking entry.
    reveal();
    return;
  }

  account
    .get()
    .then(function () {
      // Already have an active session — no need to log in again,
      // and trying to would throw "session already active" anyway.
      window.location.href = "home.html";
    })
    .catch(function () {
      // No active session — this is a normal, logged-out visitor.
      reveal();
    });
})();
