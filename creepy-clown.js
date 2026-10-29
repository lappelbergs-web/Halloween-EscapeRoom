const MIN_PEOPLE = 1;
const MAX_PEOPLE = 5;
const PEOPLE_ERROR = `Enter a whole number between ${MIN_PEOPLE} and ${MAX_PEOPLE} people.`;
const NO_OFFER_MESSAGE = "Select an offer to see the total price.";

const offers = [
  {
    id: "clown-funhouse",
    name: "Funhouse",
    description:
      "60 minutes among crooked mirrors and laughter from nowhere. Hints included.",
    pricePerPerson: 250,
  },
  {
    id: "clown-red-balloon",
    name: "Red Balloon",
    description:
      "Follow the balloons to find the way out. Just don't follow them too far.",
    pricePerPerson: 310,
  },
  {
    id: "clown-showtime",
    name: "Showtime",
    description:
      "90 minutes with a live clown. He decides when the show is over.",
    pricePerPerson: 400,
  },
];

const offersList = document.getElementById("clown-prices");
const peopleInput = document.getElementById("people");
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

peopleInput.min = MIN_PEOPLE;
peopleInput.max = MAX_PEOPLE;

function formatPrice(amount) {
  return amount.toLocaleString("sv-SE") + " SEK";
}

function formatPeople(people) {
  return people === 1 ? "1 person" : people + " people";
}

function getOfferById(id) {
  return offers.find((offer) => offer.id === id) ?? null;
}

function calculateTotalPrice(pricePerPerson, people) {
  return pricePerPerson * people;
}

function isValidPeople(people) {
  return Number.isInteger(people) && people >= MIN_PEOPLE && people <= MAX_PEOPLE;
}

function readBooking() {
  return {
    offerId: selectedOfferId,
    people: Number(peopleInput.value),
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
        <span class="offer-card__amount">${formatPrice(offer.pricePerPerson)}</span>
        <span class="offer-card__unit">/ person</span>
      </span>
      <span class="offer-card__pick">Select</span>
      <span class="offer-card__picked">✓ Selected</span>
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
  const { offerId, people } = readBooking();
  const offer = getOfferById(offerId);

  totalPriceBox.classList.remove("total-price-box--ready");

  if (!offer) {
    totalPriceEl.textContent = NO_OFFER_MESSAGE;
    return;
  }
  if (!isValidPeople(people)) {
    totalPriceEl.textContent = PEOPLE_ERROR;
    return;
  }

  const total = calculateTotalPrice(offer.pricePerPerson, people);
  totalPriceEl.textContent = formatPrice(total);
  totalPriceBox.classList.add("total-price-box--ready");
}

function isFormComplete() {
  const { offerId, people } = readBooking();
  return (
    getOfferById(offerId) &&
    isValidPeople(people) &&
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

  const ready = isFormComplete();
  confirmButton.disabled = false;
  confirmButton.classList.toggle("btn-ready", ready);

  const hasAnyInput =
    selectedOfferId !== null ||
    nameInput.value.trim() !== "" ||
    emailInput.value.trim() !== "" ||
    peopleInput.value !== "1";
  startOverButton.classList.toggle("btn-active", hasAnyInput);
}

function validateForm() {
  clearFieldErrors();
  let valid = true;
  const { offerId, people } = readBooking();

  if (!isValidName(nameInput.value)) {
    setFieldError(
      "name-error",
      "Name is required and cannot be only spaces.",
    );
    valid = false;
  }

  if (!emailInput.value.trim()) {
    setFieldError("email-error", "Email address is required.");
    valid = false;
  } else if (!isValidEmail(emailInput.value)) {
    setFieldError(
      "email-error",
      "Email must contain one @, text before and after it, and a domain with a dot and text on both sides.",
    );
    valid = false;
  }

  if (!getOfferById(offerId)) {
    setFieldError("package-error", "Select a valid offer.");
    valid = false;
  }

  if (!isValidPeople(people)) {
    setFieldError("quantity-error", PEOPLE_ERROR);
    valid = false;
  }

  return valid;
}

function setFormLocked(locked) {
  nameInput.disabled = locked;
  emailInput.disabled = locked;
  peopleInput.disabled = locked;
  for (const card of offersList.children) {
    card.disabled = locked;
  }
}

function showConfirmation(name, email, offer, people, total) {
  document.getElementById("summary-name").textContent = name;
  document.getElementById("summary-email").textContent = email;
  document.getElementById("summary-offer").textContent = offer.name;
  document.getElementById("summary-quantity").textContent = formatPeople(people);
  document.getElementById("summary-total").textContent = formatPrice(total);
  bookingSummary.classList.remove("booking-form-hidden");
}

function resetBooking() {
  nameInput.value = "";
  emailInput.value = "";
  selectedOfferId = null;
  peopleInput.value = "1";
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

peopleInput.addEventListener("input", () => {
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

  const { offerId, people } = readBooking();
  const offer = getOfferById(offerId);
  const total = calculateTotalPrice(offer.pricePerPerson, people);

  showConfirmation(
    nameInput.value.trim(),
    emailInput.value.trim(),
    offer,
    people,
    total,
  );
  bookingConfirmed = true;
  setFormLocked(true);
  updateActionButtons();
});

startOverButton.addEventListener("click", resetBooking);

renderOffers();
updatePriceDisplay();
updateActionButtons();
