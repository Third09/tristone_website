// Contact form: digits-only phone, validation, submit, success/failed popups.
//
// SETUP: get a free access key at https://web3forms.com (enter the company
// email; submissions are sent there) and paste it below.
// While the key is empty the form runs in DEMO mode: a valid form shows the
// success popup but nothing is emailed. Fill the key in before going live.
const WEB3FORMS_ACCESS_KEY = "";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const phoneInput = document.getElementById("contact-number");
  const submitBtn = form.querySelector(".btn-submit");
  const popupSuccess = document.getElementById("popup-success");
  const popupFailed = document.getElementById("popup-failed");
  let lastFocused = null;

  // --- Contact number: digits only (covers typing, pasting, autofill) ---
  phoneInput.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "");
    if (digits !== phoneInput.value) {
      phoneInput.value = digits;
    }
  });

  // --- Popups ---
  function openPopup(popup) {
    lastFocused = document.activeElement;
    popup.hidden = false;
    popup.querySelector("[data-popup-close]").focus();
  }

  function closePopup(popup) {
    popup.hidden = true;
    if (popup === popupFailed) {
      // Send the user straight to the first field that needs fixing
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      (firstInvalid || lastFocused || submitBtn).focus();
    } else if (lastFocused) {
      lastFocused.focus();
    }
  }

  [popupSuccess, popupFailed].forEach((popup) => {
    popup.querySelector("[data-popup-close]").addEventListener("click", () => closePopup(popup));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    [popupSuccess, popupFailed].forEach((popup) => {
      if (!popup.hidden) closePopup(popup);
    });
  });

  // --- Validation: mark every invalid field so it can be focused later ---
  function validateForm() {
    let valid = true;
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      // Trim so a field containing only spaces counts as empty
      if (field.tagName !== "SELECT" && field.value.trim() === "") {
        field.value = "";
      }
      const ok = field.checkValidity();
      field.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) valid = false;
    });
    return valid;
  }

  // --- Sending ---
  async function sendInquiry() {
    if (!WEB3FORMS_ACCESS_KEY) {
      console.warn("contact.js: no Web3Forms access key set, DEMO mode (nothing was sent).");
      return true;
    }

    const data = Object.fromEntries(new FormData(form));
    data.access_key = WEB3FORMS_ACCESS_KEY;
    data.subject = "New inquiry from the Tri-Stone website";
    data.from_name = "Tri-Stone Website";

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (err) {
      console.error("contact.js: submission error", err);
      return false;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      openPopup(popupFailed);
      return;
    }

    // Prevent double submits while sending
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = "SENDING...";

    const sent = await sendInquiry();

    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;

    if (sent) {
      form.reset();
      form.querySelectorAll("[aria-invalid]").forEach((f) => f.removeAttribute("aria-invalid"));
      openPopup(popupSuccess);
    } else {
      openPopup(popupFailed);
    }
  });
});
