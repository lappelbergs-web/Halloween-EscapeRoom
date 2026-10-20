const MIN_HOURS = 1;
const MAX_HOURS = 5;
const HOURS_ERROR = `Ange ett heltal mellan ${MIN_HOURS} och ${MAX_HOURS} timmar.`;

const clown_room_packages = [
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
const totalPrice = document.getElementById("total-price");
const bookingForm = document.getElementById("booking-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const startOverButton = document.getElementById("start-over");
const bookingSummary = document.getElementById("booking-summary");

let selectedOfferId = null;

if (hoursInput) {
  hoursInput.min = MIN_HOURS;
  hoursInput.max = MAX_HOURS;
}

function formatPrice(amount) {
  return amount.toLocaleString("sv-SE") + " kr";
}

function createOfferCard(offer) {
  return `
    <button
      type="button"
      class="offer-card"
      data-id="${offer.id}"
      aria-pressed="false"
    >
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
  if (!offersList) {
    return;
  }
  offersList.innerHTML = clown_room_packages
    .map((offer) => createOfferCard(offer))
    .join("");
  updateSelection();
}

function updateSelection() {
  if (!offersList) {
    return;
  }
  for (const card of offersList.children) {
    card.setAttribute("aria-pressed", card.dataset.id === selectedOfferId);
  }
}

function getOfferById(id) {
  if (!id) {
    return null;
  }
  return clown_room_packages.find((offer) => offer.id === id) || null;
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

function setFieldError(elementId, message) {
  document.getElementById(elementId).textContent = message;
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

function updatePriceDisplay() {
  const booking = readBooking();
  const offer = getOfferById(booking.offerId);

  if (!offer) {
    totalPrice.textContent = "Välj ett erbjudande för att se totalpriset.";
    return;
  }

  if (!isValidHours(booking.hours)) {
    totalPrice.textContent = HOURS_ERROR;
    return;
  }

  const total = calculateTotalPrice(offer.pricePerHour, booking.hours);
  totalPrice.textContent = `Totalpris: ${formatPrice(total)}`;
}

function handleOfferClick(event) {
  const card = event.target.closest("[data-id]");
  if (card === null || card.disabled) {
    return;
  }
  selectedOfferId = card.dataset.id;
  setFieldError("package-error", "");
  updateSelection();
  updatePriceDisplay();
}

function validateBookingForm() {
  clearFieldErrors();
  let isValid = true;
  const booking = readBooking();

  if (!isValidName(nameInput.value)) {
    setFieldError(
      "name-error",
      "Namn måste fyllas i och får inte bara vara blanksteg.",
    );
    isValid = false;
  }

  if (!emailInput.value.trim()) {
    setFieldError("email-error", "E-postadress måste fyllas i.");
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    setFieldError(
      "email-error",
      "E-post ska ha ett @, text före och efter, samt en domän med punkt och text på båda sidor.",
    );
    isValid = false;
  }

  if (!getOfferById(booking.offerId)) {
    setFieldError("package-error", "Välj ett giltigt erbjudande.");
    isValid = false;
  }

  if (!isValidHours(booking.hours)) {
    setFieldError("quantity-error", HOURS_ERROR);
    isValid = false;
  }

  return isValid;
}

function setOfferCardsLocked(locked) {
  if (!offersList) {
    return;
  }
  for (const card of offersList.children) {
    card.disabled = locked;
  }
}

function setFormLocked(locked) {
  nameInput.disabled = locked;
  emailInput.disabled = locked;
  hoursInput.disabled = locked;
  document.getElementById("confirm-booking").disabled = locked;
  setOfferCardsLocked(locked);
}

function showConfirmation(name, email, offer, quantity, total) {
  document.getElementById("summary-name").textContent = name;
  document.getElementById("summary-email").textContent = email;
  document.getElementById("summary-offer").textContent = offer.name;
  document.getElementById("summary-quantity").textContent = String(quantity);
  document.getElementById("summary-total").textContent = formatPrice(total);
  bookingSummary.classList.remove("booking-form-hidden");
}

function resetBooking() {
  nameInput.value = "";
  emailInput.value = "";
  selectedOfferId = null;
  hoursInput.value = "1";
  clearFieldErrors();
  bookingSummary.classList.add("booking-form-hidden");
  setFormLocked(false);
  updateSelection();
  updatePriceDisplay();
}

renderOffers();
updatePriceDisplay();

if (offersList) {
  offersList.addEventListener("click", handleOfferClick);
}

if (hoursInput && totalPrice) {
  hoursInput.addEventListener("input", () => {
    setFieldError("quantity-error", "");
    updatePriceDisplay();
  });
}

if (nameInput) {
  nameInput.addEventListener("input", () => setFieldError("name-error", ""));
}
if (emailInput) {
  emailInput.addEventListener("input", () => setFieldError("email-error", ""));
}

if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateBookingForm()) {
      updatePriceDisplay();
      return;
    }

    const booking = readBooking();
    const offer = getOfferById(booking.offerId);
    const total = calculateTotalPrice(offer.pricePerHour, booking.hours);

    showConfirmation(
      nameInput.value.trim(),
      emailInput.value.trim(),
      offer,
      booking.hours,
      total,
    );
    setFormLocked(true);
  });
}

if (startOverButton) {
  startOverButton.addEventListener("click", resetBooking);
}
