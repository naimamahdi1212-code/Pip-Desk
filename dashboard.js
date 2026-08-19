(function () {
  "use strict";

  var account = window.pipDeskAccount;
  var greeting = document.getElementById("dashboardGreeting");
  if (!account || !greeting) return;

  account
    .get()
    .then(function (user) {
      var name = (user && (user.name || user.email)) || "";
      if (name) {
        greeting.textContent = "Welcome back, " + name.split(" ")[0];
      }
    })
    .catch(function () {
      // guard.js already handles redirecting on a failed session check —
      // nothing to do here if this call also fails.
    });
})();
