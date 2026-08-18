(function () {
  "use strict";

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

    var account = window.pipDeskAccount;
    if (!account) {
      setLoading(false);
      showAlert("Login service isn't loaded. Refresh and try again.", "error");
      return;
    }

    setLoading(true);

    // Note: "remember me" isn't something Appwrite takes per-login —
    // session length is configured project-wide in the Appwrite
    // console under Auth > Security > Session length. The checkbox
    // is left in place for later if you want to build custom logic
    // around it, but it isn't sent anywhere right now.

    // --------------------------------------------------------
    // Appwrite email/password session.
    // Docs: https://appwrite.io/docs/products/auth/email-password
    // --------------------------------------------------------
    account
      .createEmailPasswordSession({
        email: emailInput.value.trim(),
        password: passwordInput.value
      })
      .then(function () {
        setLoading(false);
        showAlert("Logged in. Redirecting\u2026", "success");
        window.location.href = "home.html";
      })
      .catch(function (error) {
        setLoading(false);
        var message =
          (error && error.message) || "Invalid email or password.";
        showAlert(message, "error");
      });
  });
})();
