// contact.js — sends the Tri-Stone contact form to Google Apps Script
(function () {
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyhOM-z6aTlpGJxKrzilQGESp7YLvnFMcEnwnNRKg7H8fxG8EmtEr7FPJtV3Tdxzbce7A/exec";

  const form = document.getElementById("contact-form");
  const submitBtn = form.querySelector(".btn-submit");
  const phoneInput = document.getElementById("contact-number");
  const popupSuccess = document.getElementById("popup-success");
  const popupFailed = document.getElementById("popup-failed");
  const failedText = document.getElementById("popup-failed-text");
  const defaultFailedMsg = failedText.textContent;

  // Keep the phone field digits-only as the user types
  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 15);
  });

  // ---------- Popups ----------
  let lastFocused = null;

  function openPopup(popup) {
    lastFocused = document.activeElement;
    popup.hidden = false;
    document.body.classList.add("popup-open");
    const btn = popup.querySelector("[data-popup-close]");
    if (btn) btn.focus();
  }

  function closePopups() {
    [popupSuccess, popupFailed].forEach((p) => (p.hidden = true));
    document.body.classList.remove("popup-open");
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll("[data-popup-close]").forEach((btn) =>
    btn.addEventListener("click", closePopups)
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (!popupSuccess.hidden || !popupFailed.hidden)) {
      closePopups();
    }
  });

  function showFailed(message) {
    failedText.textContent = message || defaultFailedMsg;
    openPopup(popupFailed);
  }

  // ---------- Validation ----------
  function validate() {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const service = form.service.value;
    const message = form.message.value.trim();

    if (!name) return "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    if (!/^[0-9]{7,15}$/.test(phone)) return "Please enter a valid contact number (7–15 digits).";
    if (!service) return "Please choose the service you're interested in.";
    if (!message) return "Please enter a message.";
    return null;
  }

  // ---------- Submit ----------
  async function submitToGoogleScript(data) {
    // Your script does JSON.parse(e.postData.contents), so send JSON.
    // Content-Type text/plain keeps it a "simple" request, so the browser
    // skips the CORS preflight that Apps Script can't answer.
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("HTTP " + response.status);

    // Your script replies {"ok":true} or {"ok":false,"error":"..."}
    const json = await response.json();
    if (!json.ok) throw new Error(json.error || "Script reported an error");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      showFailed(error);
      return;
    }

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      // Send the visible label ("Fit-out") rather than the value ("fit-out")
      // so the email reads nicely
      service: form.service.options[form.service.selectedIndex].text,
      message: form.message.value.trim(),
    };

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "SENDING...";

    try {
      await submitToGoogleScript(data);
      form.reset();
      openPopup(popupSuccess);
    } catch (err) {
      console.error("Contact form submission failed:", err);
      showFailed();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
})();
