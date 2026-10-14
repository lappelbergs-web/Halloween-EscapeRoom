function RenderCards(offer) {
  return `
    <article class="offer-card" data-offer-id="${offer.id}">
      <p class="offer-card__tag">${offer.name}</p>
      <h3 class="offer-card__title">${offer.name}</h3>
      <p class="offer-card__description">${offer.description}</p>
      <p class="offer-card__price">
        <span class="offer-card__amount">${offer.price}</span>
        <span class="offer-card__unit">kr per timme</span>
      </p>
    </article>
  `;
}

function renderOfferCards(container, packages) {
  container.innerHTML = packages.map((offer) => RenderCards(offer)).join("");
}

function renderPackageSelect(select, packages) {
  const placeholderText =
    select.querySelector('option[value=""]')?.textContent ||
    "--Välj erbjudande--";
  select.innerHTML = "";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = placeholderText;
  select.appendChild(emptyOption);

  packages.forEach((offer) => {
    const option = document.createElement("option");
    option.value = offer.id;
    option.textContent = offer.name;
    select.appendChild(option);
  });
}

function getOfferById(selectedId, prices) {
  if (!selectedId) {
    return null;
  }
  return prices.find((item) => String(item.id) === selectedId) || null;
}

function calculateTotalPrice(price, quantity) {
  return price * quantity;
}

function isValidQuantity(value) {
  if (value === "" || value.includes(" ")) {
    return false;
  }
  const amount = Number(value);
  return Number.isInteger(amount) && amount >= 1 && amount <= 5;
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

function setFieldError(elementId, message) {
  document.getElementById(elementId).textContent = message;
}

function clearFieldErrors() {
  setFieldError("name-error", "");
  setFieldError("email-error", "");
  setFieldError("package-error", "");
  setFieldError("quantity-error", "");
}

const clown_room_packages = [
  {
    id: "clown-funhouse",
    name: "Funhouse",
    description:
      "60 minutes among crooked mirrors and laughter from nowhere. Hints included.",
    price: 250,
  },
  {
    id: "clown-red-balloon",
    name: "Red Balloon",
    description:
      "Follow the balloons to find the way out. Just don't follow them too far.",
    price: 310,
  },
  {
    id: "clown-showtime",
    name: "Showtime",
    description:
      "90 minutes with a live clown. He decides when the show is over.",
    price: 400,
  },
];

const clownOffers = document.getElementById("clown-prices");
const packageSelect = document.getElementById("package-select");

if (clownOffers) {
  renderOfferCards(clownOffers, clown_room_packages);
}
if (packageSelect) {
  renderPackageSelect(packageSelect, clown_room_packages);
}
const quantityInput = document.getElementById("quantity-input");
const totalPrice = document.getElementById("total-price");
const bookingForm = document.getElementById("booking-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const startOverButton = document.getElementById("start-over");
const bookingSummary = document.getElementById("booking-summary");

function updatePriceDisplay() {
  const offer = getOfferById(packageSelect.value, clown_room_packages);
  if (!offer) {
    totalPrice.textContent = "Välj ett erbjudande för att se totalpriset.";
    return;
  }
  if (!isValidQuantity(quantityInput.value)) {
    totalPrice.textContent = "Ange antal timmar som ett heltal mellan 1 och 5.";
    return;
  }

  const quantity = Number(quantityInput.value);
  const total = calculateTotalPrice(offer.price, quantity);
  totalPrice.textContent = `Totalpris: ${total} kr`;
}

function validateBookingForm() {
  clearFieldErrors();
  let isValid = true;

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

  if (!getOfferById(packageSelect.value, clown_room_packages)) {
    setFieldError("package-error", "Välj ett giltigt erbjudande.");
    isValid = false;
  }

  if (!isValidQuantity(quantityInput.value)) {
    setFieldError(
      "quantity-error",
      "Antal timmar måste vara ett heltal mellan 1 och 5.",
    );
    isValid = false;
  }

  return isValid;
}

function setFormLocked(locked) {
  nameInput.disabled = locked;
  emailInput.disabled = locked;
  packageSelect.disabled = locked;
  quantityInput.disabled = locked;
  document.getElementById("confirm-booking").disabled = locked;
}

function showConfirmation(name, email, offer, quantity, total) {
  document.getElementById("summary-name").textContent = name;
  document.getElementById("summary-email").textContent = email;
  document.getElementById("summary-offer").textContent = offer.name;
  document.getElementById("summary-quantity").textContent = String(quantity);
  document.getElementById("summary-total").textContent = `${total} kr`;
  bookingSummary.classList.remove("booking-form-hidden");
}

function resetBooking() {
  nameInput.value = "";
  emailInput.value = "";
  packageSelect.value = "";
  quantityInput.value = "1";
  clearFieldErrors();
  bookingSummary.classList.add("booking-form-hidden");
  setFormLocked(false);
  updatePriceDisplay();
}

if (packageSelect && quantityInput && totalPrice) {
  packageSelect.addEventListener("change", () => {
    setFieldError("package-error", "");
    updatePriceDisplay();
  });
  quantityInput.addEventListener("input", () => {
    setFieldError("quantity-error", "");
    updatePriceDisplay();
  });
  nameInput.addEventListener("input", () => setFieldError("name-error", ""));
  emailInput.addEventListener("input", () => setFieldError("email-error", ""));
  updatePriceDisplay();
}

if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateBookingForm()) {
      updatePriceDisplay();
      return;
    }

    const offer = getOfferById(packageSelect.value, clown_room_packages);
    const quantity = Number(quantityInput.value);
    const total = calculateTotalPrice(offer.price, quantity);

    showConfirmation(
      nameInput.value.trim(),
      emailInput.value.trim(),
      offer,
      quantity,
      total,
    );
    setFormLocked(true);
  });
}

if (startOverButton) {
  startOverButton.addEventListener("click", resetBooking);
}
