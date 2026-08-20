(function () {
  "use strict";

  var account = window.pipDeskAccount;
  var teams = window.pipDeskTeams;
  var html = document.documentElement;

  function reveal() {
    html.classList.remove("auth-checking");
  }

  function goToLogin() {
    window.location.href = "index.html";
  }

  function goToHome() {
    // Logged in, but not an admin — don't show any admin UI.
    window.location.href = "home.html";
  }

  if (!account || !teams) {
    goToLogin();
    return;
  }

  account
    .get()
    .then(function () {
      return teams.list();
    })
    .then(function (result) {
      var isAdmin = (result.teams || []).some(function (team) {
        return team.$id === window.PIPDESK_ADMIN_TEAM_ID;
      });
      if (isAdmin) {
        reveal();
        wireLogout();
      } else {
        goToHome();
      }
    })
    .catch(function () {
      goToLogin();
    });

  function wireLogout() {
    var btn = document.getElementById("logoutButton");
    if (!btn) return;
    btn.addEventListener("click", function () {
      btn.disabled = true;
      account
        .deleteSession("current")
        .catch(function () {})
        .then(function () {
          window.location.href = "index.html";
        });
    });
  }
})();

