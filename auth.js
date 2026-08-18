(function () {
  "use strict";

  // ============================================================
  // CONFIG — point this at your backend auth service.
  // ============================================================
  var AUTH_ENDPOINT = "/api/auth/login"; // TODO: replace with your real endpoint

  var form = document.getElementById("loginForm");
  var emailInput = document.getElementById("email");
  var passwordInput = document.getElementById("password");
  var emailError = document.getElementById("emailError");
  var passwordError = document.getElementById("passwordError");
  var alertBox = document.getElementById("authAlert");
  var submitButton = document.getElementById("submitButton");
  var submitLabel = document.getElementById("submitLabel");
  var passwordToggle = document.getElementById("passwordToggle");
  var passwordToggleLabel = document.getElementById("passwordToggleLabel");

  if (!form) return;

  // ------------------------------------------------------------
  // Show / hide password
  // ------------------------------------------------------------
  passwordToggle.addEventListener("click", function () {
    var isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    passwordToggleLabel.textContent = isPassword ? "Hide" : "Show";
    passwordToggle.setAttribute("aria-pressed", String(isPassword));
  });

  // ------------------------------------------------------------
  // Alert helper
  // ------------------------------------------------------------
  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.hidden = false;
    alertBox.classList.remove("is-error", "is-success");
    alertBox.classList.add(type === "success" ? "is-success" : "is-error");
  }

  function clearAlert() {
    alertBox.hidden = true;
    alertBox.textContent = "";
    alertBox.classList.remove("is-error", "is-success");
  }

  // ------------------------------------------------------------
  // Field-level validation
  // ------------------------------------------------------------
  function setFieldError(input, errorEl, show) {
    input.closest(".field").classList.toggle("has-error", show);
    errorEl.hidden = !show;
    input.setAttribute("aria-invalid", show ? "true" : "false");
  }

  function validate() {
    var valid = true;

    var emailValid = emailInput.value.trim() !== "" && emailInput.checkValidity();
    setFieldError(emailInput, emailError, !emailValid);
    if (!emailValid) valid = false;

    var passwordValid = passwordInput.value.length >= 8;
    setFieldError(passwordInput, passwordError, !passwordValid);
    if (!passwordValid) valid = false;

    return valid;
  }

  emailInput.addEventListener("input", function () {
    if (emailInput.closest(".field").classList.contains("has-error")) {
      setFieldError(emailInput, emailError, !(emailInput.value.trim() !== "" && emailInput.checkValidity()));
    }
  });
  passwordInput.addEventListener("input", function () {
    if (passwordInput.closest(".field").classList.contains("has-error")) {
      setFieldError(passwordInput, passwordError, passwordInput.value.length < 8);
    }
  });

  // ------------------------------------------------------------
  // Submit state
  // ------------------------------------------------------------
  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitLabel.textContent = isLoading ? "Logging in\u2026" : "Log in";
  }

  // ------------------------------------------------------------
  // Submit handler — wire your backend auth service here.
  // ------------------------------------------------------------
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearAlert();

    if (!validate()) {
      showAlert("Check the highlighted fields and try again.", "error");
      return;
    }

    var payload = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      remember: document.getElementById("remember").checked
    };

    setLoading(true);

    // --------------------------------------------------------
    // Replace this fetch with a call to your real auth service.
    // Expected contract (adjust to match your backend):
    //   POST AUTH_ENDPOINT
    //   body: { email, password, remember }
    //   200 -> { token: "...", user: { ... } }
    //   401 -> { message: "Invalid email or password." }
    // --------------------------------------------------------
    fetch(AUTH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, status: response.status, data: data };
        });
      })
      .then(function (result) {
        setLoading(false);

        if (result.ok) {
          // TODO: store result.data.token (e.g. httpOnly cookie set by
          // the server is safest) and redirect to the logged-in area.
          showAlert("Logged in. Redirecting\u2026", "success");
          // window.location.href = "/dashboard";
        } else {
          var message =
            (result.data && result.data.message) ||
            "Invalid email or password.";
          showAlert(message, "error");
        }
      })
      .catch(function () {
        setLoading(false);
        // Network failure, backend not reachable, CORS issue, etc.
        // Common while the backend isn't wired up yet.
        showAlert(
          "Couldn't reach the login service. Check your connection and try again.",
          "error"
        );
      });
  });
})();
