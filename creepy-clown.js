const MIN_HOURS = 1;
const MAX_HOURS = 5;
const HOURS_ERROR = `Ange ett heltal mellan ${MIN_HOURS} och ${MAX_HOURS} timmar.`;
const NO_OFFER_MESSAGE = "Välj ett erbjudande för att se totalpriset.";

const offers = [
  {
    id: "clown-funhouse",
    name: "Funhouse",
    description:
      "60 minutes among crooked mirrors and laughter from nowhere. Hints included.",
    pricePerHour: 250,
  },
  {
    id: "clown-red-balloon",
    name: "Red Balloon",
    description:
      "Follow the balloons to find the way out. Just don't follow them too far.",
    pricePerHour: 310,
  },
  {
    id: "clown-showtime",
    name: "Showtime",
    description:
      "90 minutes with a live clown. He decides when the show is over.",
    pricePerHour: 400,
  },
];

const offersList = document.getElementById("clown-prices");
const hoursInput = document.getElementById("hours");
const totalPriceBox = document.getElementById("total-price-box");
const totalPriceEl = document.getElementById("total-price");
const bookingForm = document.getElementById("booking-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const confirmButton = document.getElementById("confirm-booking");
const startOverButton = document.getElementById("start-over");
const bookingSummary = document.getElementById("booking-summary");

let selectedOfferId = null;
let bookingConfirmed = false;

hoursInput.min = MIN_HOURS;
hoursInput.max = MAX_HOURS;

function formatPrice(amount) {
  return amount.toLocaleString("sv-SE") + " kr";
}

function formatHours(hours) {
  return hours === 1 ? "1 timme" : hours + " timmar";
}

function getOfferById(id) {
  return offers.find((offer) => offer.id === id) ?? null;
}

function calculateTotalPrice(pricePerHour, hours) {
  return pricePerHour * hours;
}

function isValidHours(hours) {
  return Number.isInteger(hours) && hours >= MIN_HOURS && hours <= MAX_HOURS;
}

function readBooking() {
  return {
    offerId: selectedOfferId,
    hours: Number(hoursInput.value),
  };
}

function setFieldError(id, message) {
  document.getElementById(id).textContent = message;
}

function clearFieldErrors() {
  setFieldError("name-error", "");
  setFieldError("email-error", "");
  setFieldError("package-error", "");
  setFieldError("quantity-error", "");
}

function isValidName(name) {
  return name.trim().length > 0;
}

function isValidEmail(email) {
  if (!email || email.includes(" ")) {
    return false;
  }
  const parts = email.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }
  const domain = parts[1];
  const dotIndex = domain.indexOf(".");
  return dotIndex > 0 && dotIndex < domain.length - 1;
}

function createOfferCard(offer) {
  return `
    <button type="button" class="offer-card" data-id="${offer.id}" aria-pressed="false">
      <span class="offer-card__title">${offer.name}</span>
      <span class="offer-card__description">${offer.description}</span>
      <span class="offer-card__price">
        <span class="offer-card__amount">${formatPrice(offer.pricePerHour)}</span>
        <span class="offer-card__unit">/ timme</span>
      </span>
      <span class="offer-card__pick">Välj</span>
      <span class="offer-card__picked">✓ Vald</span>
    </button>
  `;
}

function renderOffers() {
  offersList.innerHTML = offers.map(createOfferCard).join("");
  updateSelection();
}

function updateSelection() {
  for (const card of offersList.children) {
    card.setAttribute("aria-pressed", card.dataset.id === selectedOfferId);
  }
}

function updatePriceDisplay() {
  const { offerId, hours } = readBooking();
  const offer = getOfferById(offerId);

  totalPriceBox.classList.remove("total-price-box--ready");

  if (!offer) {
    totalPriceEl.textContent = NO_OFFER_MESSAGE;
    return;
  }
  if (!isValidHours(hours)) {
    totalPriceEl.textContent = HOURS_ERROR;
    return;
  }

  const total = calculateTotalPrice(offer.pricePerHour, hours);
  totalPriceEl.textContent = formatPrice(total);
  totalPriceBox.classList.add("total-price-box--ready");
}

function isFormComplete() {
  const { offerId, hours } = readBooking();
  return (
    getOfferById(offerId) &&
    isValidHours(hours) &&
    isValidName(nameInput.value) &&
    isValidEmail(emailInput.value)
  );
}

function updateActionButtons() {
  if (bookingConfirmed) {
    confirmButton.disabled = true;
    confirmButton.classList.remove("btn-ready");
    confirmButton.classList.add("btn-sent");
    startOverButton.classList.add("btn-active");
    bookingForm.classList.add("booking-form--confirmed");
    return;
  }

  bookingForm.classList.remove("booking-form--confirmed");
  confirmButton.classList.remove("btn-sent");

  // Knappen går att klicka på ända tills förfrågan är bekräftad, så att
  // validateForm() kan visa felmeddelanden om något saknas eller är fel.
  // Klassen btn-ready visar när allt är rätt ifyllt.
  const ready = isFormComplete();
  confirmButton.disabled = false;
  confirmButton.classList.toggle("btn-ready", ready);

  const hasAnyInput =
    selectedOfferId !== null ||
    nameInput.value.trim() !== "" ||
    emailInput.value.trim() !== "" ||
    hoursInput.value !== "1";
  startOverButton.classList.toggle("btn-active", hasAnyInput);
}

function validateForm() {
  clearFieldErrors();
  let valid = true;
  const { offerId, hours } = readBooking();

  if (!isValidName(nameInput.value)) {
    setFieldError(
      "name-error",
      "Namn måste fyllas i och får inte bara vara blanksteg.",
    );
    valid = false;
  }

  if (!emailInput.value.trim()) {
    setFieldError("email-error", "E-postadress måste fyllas i.");
    valid = false;
  } else if (!isValidEmail(emailInput.value)) {
    setFieldError(
      "email-error",
      "E-post ska ha ett @, text före och efter, samt en domän med punkt och text på båda sidor.",
    );
    valid = false;
  }

  if (!getOfferById(offerId)) {
    setFieldError("package-error", "Välj ett giltigt erbjudande.");
    valid = false;
  }

  if (!isValidHours(hours)) {
    setFieldError("quantity-error", HOURS_ERROR);
    valid = false;
  }

  return valid;
}

function setFormLocked(locked) {
  nameInput.disabled = locked;
  emailInput.disabled = locked;
  hoursInput.disabled = locked;
  for (const card of offersList.children) {
    card.disabled = locked;
  }
}

function showConfirmation(name, email, offer, hours, total) {
  document.getElementById("summary-name").textContent = name;
  document.getElementById("summary-email").textContent = email;
  document.getElementById("summary-offer").textContent = offer.name;
  document.getElementById("summary-quantity").textContent = formatHours(hours);
  document.getElementById("summary-total").textContent = formatPrice(total);
  bookingSummary.classList.remove("booking-form-hidden");
}

function resetBooking() {
  nameInput.value = "";
  emailInput.value = "";
  selectedOfferId = null;
  hoursInput.value = "1";
  bookingConfirmed = false;
  clearFieldErrors();
  bookingSummary.classList.add("booking-form-hidden");
  setFormLocked(false);
  updateSelection();
  updatePriceDisplay();
  updateActionButtons();
}

offersList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-id]");
  if (!card || card.disabled) {
    return;
  }
  selectedOfferId = card.dataset.id;
  setFieldError("package-error", "");
  updateSelection();
  updatePriceDisplay();
  updateActionButtons();
});

hoursInput.addEventListener("input", () => {
  setFieldError("quantity-error", "");
  updatePriceDisplay();
  updateActionButtons();
});

nameInput.addEventListener("input", () => {
  setFieldError("name-error", "");
  updateActionButtons();
});
emailInput.addEventListener("input", () => {
  setFieldError("email-error", "");
  updateActionButtons();
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) {
    updatePriceDisplay();
    return;
  }

  const { offerId, hours } = readBooking();
  const offer = getOfferById(offerId);
  const total = calculateTotalPrice(offer.pricePerHour, hours);

  showConfirmation(nameInput.value.trim(), emailInput.value.trim(), offer, hours, total);
  bookingConfirmed = true;
  setFormLocked(true);
  updateActionButtons();
});

startOverButton.addEventListener("click", resetBooking);

renderOffers();
updatePriceDisplay();
updateActionButtons();
