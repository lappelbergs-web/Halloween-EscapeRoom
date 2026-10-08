"use strict";

/*
 * WorkHub Haunted Rooms – gemensam JavaScript för alla sidor.
 *
 * 1. Navigering och sidfot (alla sidor)
 * 2. Bokning (bara sidor med <body data-activity="...">):
 *    erbjudanden, prisberäkning, validering, bekräftelse och Start over.
 */

// Talar om för CSS att JavaScript är igång (används för mobilmenyn).
document.documentElement.classList.add("js");

/* ==========================================================
   Data: erbjudanden per aktivitet
   ========================================================== */

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 5;

const ACTIVITIES = {
  mansion: {
    unitSingular: "player",
    unitPlural: "players",
    offers: [
      { id: "mansion-classic", name: "Classic Haunting", description: "60 minutes with hints whenever you need them. A good first scare.", pricePerUnit: 250 },
      { id: "mansion-candlelight", name: "Candlelight Only", description: "The power is out. One candle per team, and every shadow moves.", pricePerUnit: 300 },
      { id: "mansion-seance", name: "Midnight Séance", description: "Starts at the stroke of midnight, with a live actor in the house.", pricePerUnit: 380 }
    ]
  },
  doll: {
    unitSingular: "player",
    unitPlural: "players",
    offers: [
      { id: "doll-playroom", name: "The Playroom", description: "60 minutes in the nursery where it all began. Hints included.", pricePerUnit: 250 },
      { id: "doll-hide-and-seek", name: "Hide and Seek", description: "She is looking for you. Make a sound and the clock speeds up.", pricePerUnit: 320 },
      { id: "doll-night", name: "Night of the Doll", description: "No hints and no lights. She only moves when you look away.", pricePerUnit: 360 }
    ]
  },
  asylum: {
    unitSingular: "player",
    unitPlural: "players",
    offers: [
      { id: "asylum-intake", name: "Patient Intake", description: "60 minutes to escape the admissions ward. Hints included.", pricePerUnit: 260 },
      { id: "asylum-isolation", name: "Isolation Ward", description: "Your team starts locked in separate cells and must find each other.", pricePerUnit: 330 },
      { id: "asylum-lockdown", name: "Full Lockdown", description: "90 minutes, no hints, and the night staff are still doing their rounds.", pricePerUnit: 420 }
    ]
  },
  clown: {
    unitSingular: "player",
    unitPlural: "players",
    offers: [
      { id: "clown-funhouse", name: "Funhouse", description: "60 minutes among crooked mirrors and laughter from nowhere. Hints included.", pricePerUnit: 250 },
      { id: "clown-red-balloon", name: "Red Balloon", description: "Follow the balloons to find the way out. Just don't follow them too far.", pricePerUnit: 310 },
      { id: "clown-showtime", name: "Showtime", description: "90 minutes with a live clown. He decides when the show is over.", pricePerUnit: 400 }
    ]
  }
};

/* ==========================================================
   Start: körs när sidan har laddats
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  markCurrentPage();
  showCurrentYear();
  setupBookingPage();
});

/* ==========================================================
   1. Navigering och sidfot
   ========================================================== */

function setupMobileMenu() {
  const toggleButton = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  if (!toggleButton || !nav) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const isOpen = toggleButton.getAttribute("aria-expanded") === "true";
    toggleButton.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
  });
}

// Markerar menylänken till sidan man står på.
function markCurrentPage() {
  const currentFile = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".site-nav a").forEach((link) => {
    if (link.getAttribute("href") === currentFile) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function showCurrentYear() {
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/* ==========================================================
   2. Bokning
   ========================================================== */

// Sidans tillstånd
let activity = null;          // Aktuell aktivitet ur ACTIVITIES
let selectedOfferId = null;   // id för valt erbjudande, eller null
let isConfirmed = false;      // true när förfrågan är bekräftad och låst

// Referenser till element på sidan, fylls i setupBookingPage
const ui = {};

function setupBookingPage() {
  const activityKey = document.body.dataset.activity;

  // Startsidan har ingen data-activity – där finns inget att boka.
  if (!activityKey) {
    return;
  }

  activity = ACTIVITIES[activityKey];
  if (!activity) {
    console.error(`Okänd aktivitet: ${activityKey}`);
    return;
  }

  ui.form = document.getElementById("booking-form");
  ui.fields = document.getElementById("booking-fields");
  ui.offerList = document.getElementById("offer-list");
  ui.selectedOffer = document.getElementById("selected-offer");
  ui.priceOutput = document.getElementById("price-output");
  ui.submitButton = document.getElementById("submit-button");
  ui.restartButton = document.getElementById("restart-button");
  ui.confirmation = document.getElementById("confirmation");

  // Fält som valideras: inmatningselement och tillhörande felmeddelande
  ui.inputs = {
    offer: ui.offerList,
    quantity: document.getElementById("quantity"),
    name: document.getElementById("customer-name"),
    email: document.getElementById("customer-email")
  };
  ui.errors = {
    offer: document.getElementById("offer-error"),
    quantity: document.getElementById("quantity-error"),
    name: document.getElementById("name-error"),
    email: document.getElementById("email-error")
  };
  ui.summary = {
    name: document.getElementById("summary-name"),
    email: document.getElementById("summary-email"),
    offer: document.getElementById("summary-offer"),
    quantity: document.getElementById("summary-quantity"),
    total: document.getElementById("summary-total")
  };

  renderOffers();
  updatePriceDisplay();

  ui.form.addEventListener("submit", handleSubmit);
  ui.restartButton.addEventListener("click", restartBooking);

  ui.inputs.quantity.addEventListener("input", () => {
    updatePriceDisplay();
    revalidateIfShowingError("quantity");
  });
  ui.inputs.name.addEventListener("input", () => revalidateIfShowingError("name"));
  ui.inputs.email.addEventListener("input", () => revalidateIfShowingError("email"));
}

/* ---------- Erbjudanden ---------- */

// Ritar ut alla erbjudanden genom att iterera över arrayen.
function renderOffers() {
  ui.offerList.innerHTML = "";

  for (const offer of activity.offers) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "offer-card";
    card.dataset.offerId = offer.id;
    card.setAttribute("aria-pressed", "false");

    const name = document.createElement("span");
    name.className = "offer-name";
    name.textContent = offer.name;

    const description = document.createElement("span");
    description.className = "offer-description";
    description.textContent = offer.description;

    const price = document.createElement("span");
    price.className = "offer-price";
    price.textContent = `${formatPrice(offer.pricePerUnit)} per ${activity.unitSingular}`;

    card.append(name, description, price);
    card.addEventListener("click", () => selectOffer(offer.id));
    ui.offerList.append(card);
  }
}

function selectOffer(offerId) {
  if (isConfirmed) {
    return;
  }
  selectedOfferId = offerId;
  updateOfferMarking();
  updatePriceDisplay();
  clearError("offer");
}

// Uppdaterar vilket kort som är markerat och texten "Valt erbjudande".
function updateOfferMarking() {
  const cards = ui.offerList.querySelectorAll(".offer-card");

  cards.forEach((card) => {
    const isSelected = card.dataset.offerId === selectedOfferId;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });

  const offer = getSelectedOffer();
  ui.selectedOffer.textContent = offer
    ? `Selected: ${offer.name}`
    : "No experience selected yet.";
}

function getSelectedOffer() {
  return activity.offers.find((offer) => offer.id === selectedOfferId) || null;
}

/* ---------- Pris ---------- */

function calculateTotalPrice(pricePerUnit, quantity) {
  return pricePerUnit * quantity;
}

// Tolkar antal-fältet. Returnerar ett heltal 1–5, eller null om värdet är ogiltigt.
function parseQuantity(text) {
  const trimmed = text.trim();
  if (trimmed === "") {
    return null;
  }

  // Bara siffror tillåts – då stoppas t.ex. "2.5", "-1", "2a" och "1e2".
  const onlyDigits = [...trimmed].every((char) => char >= "0" && char <= "9");
  if (!onlyDigits) {
    return null;
  }

  const quantity = Number(trimmed);
  if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
    return null;
  }
  return quantity;
}

function updatePriceDisplay() {
  const offer = getSelectedOffer();
  const quantity = parseQuantity(ui.inputs.quantity.value);
  const output = ui.priceOutput;

  output.classList.remove("is-total", "is-warning");

  if (!offer) {
    output.textContent = "Choose an experience to see the price.";
    return;
  }

  if (quantity === null) {
    output.textContent = `Enter the number of ${activity.unitPlural} as a whole number between ${MIN_QUANTITY} and ${MAX_QUANTITY} to see the price.`;
    output.classList.add("is-warning");
    return;
  }

  const total = calculateTotalPrice(offer.pricePerUnit, quantity);
  output.textContent = `Total: ${formatPrice(total)} (${formatQuantity(quantity)} × ${formatPrice(offer.pricePerUnit)})`;
  output.classList.add("is-total");
}

/* ---------- Validering ---------- */
// Varje funktion returnerar ett felmeddelande, eller tom sträng om värdet är giltigt.

function validateOffer() {
  return getSelectedOffer() ? "" : "Choose one of the experiences above before you send your request.";
}

function validateQuantity(value) {
  if (value.trim() === "") {
    return `Enter the number of ${activity.unitPlural}.`;
  }
  if (parseQuantity(value) === null) {
    return `The number of ${activity.unitPlural} must be a whole number between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`;
  }
  return "";
}

function validateName(value) {
  if (value.trim() === "") {
    return "Enter your name. The field can't be empty or contain only spaces.";
  }
  return "";
}

function validateEmail(value) {
  if (value === "") {
    return "Enter your email address.";
  }

  const hasWhitespace = [...value].some((char) => char.trim() === "");
  if (hasWhitespace) {
    return "The email address can't contain spaces.";
  }

  const parts = value.split("@");
  if (parts.length !== 2) {
    return "The email address must contain exactly one @, for example name@example.com.";
  }

  const [localPart, domain] = parts;
  if (localPart === "") {
    return "There must be text before the @ in the email address.";
  }
  if (domain === "") {
    return "There must be text after the @ in the email address.";
  }

  // Domänen ska ha minst en punkt, och varje del runt punkterna måste innehålla text.
  const domainParts = domain.split(".");
  const hasEmptyPart = domainParts.some((part) => part === "");
  if (domainParts.length < 2 || hasEmptyPart) {
    return "The part after @ needs a dot with text on both sides, for example example.com.";
  }

  return "";
}

// Validerar ett fält, visar eller tar bort felet och returnerar true om fältet är giltigt.
function validateField(key) {
  let message = "";

  switch (key) {
    case "offer":
      message = validateOffer();
      break;
    case "quantity":
      message = validateQuantity(ui.inputs.quantity.value);
      break;
    case "name":
      message = validateName(ui.inputs.name.value);
      break;
    case "email":
      message = validateEmail(ui.inputs.email.value);
      break;
  }

  if (message) {
    showError(key, message);
    return false;
  }
  clearError(key);
  return true;
}

// När ett fält redan visar ett fel kontrolleras det igen vid varje ändring,
// så att meddelandet uppdateras eller försvinner när felet rättas.
function revalidateIfShowingError(key) {
  if (!ui.errors[key].hidden) {
    validateField(key);
  }
}

function showError(key, message) {
  ui.errors[key].textContent = message;
  ui.errors[key].hidden = false;
  ui.inputs[key].setAttribute("aria-invalid", "true");
}

function clearError(key) {
  ui.errors[key].textContent = "";
  ui.errors[key].hidden = true;
  ui.inputs[key].removeAttribute("aria-invalid");
}

/* ---------- Skicka och bekräfta ---------- */

function handleSubmit(event) {
  event.preventDefault(); // Ingen omladdning och inget skickas till en server

  if (isConfirmed) {
    return;
  }

  // Kontrollera alla fält i samma ordning som på sidan.
  const fieldOrder = ["offer", "quantity", "name", "email"];
  const invalidFields = fieldOrder.filter((key) => !validateField(key));

  if (invalidFields.length > 0) {
    focusField(invalidFields[0]);
    return;
  }

  const offer = getSelectedOffer();
  const quantity = parseQuantity(ui.inputs.quantity.value);

  // Spara en ögonblicksbild av det som bekräftas.
  const booking = {
    name: ui.inputs.name.value.trim(),
    email: ui.inputs.email.value,
    offerName: offer.name,
    quantity: quantity,
    total: calculateTotalPrice(offer.pricePerUnit, quantity)
  };

  showConfirmation(booking);
}

function focusField(key) {
  if (key === "offer") {
    ui.offerList.querySelector(".offer-card").focus();
  } else {
    ui.inputs[key].focus();
  }
}

function showConfirmation(booking) {
  isConfirmed = true;

  // textContent skriver över – då blir det aldrig dubbla bekräftelser.
  ui.summary.name.textContent = booking.name;
  ui.summary.email.textContent = booking.email;
  ui.summary.offer.textContent = booking.offerName;
  ui.summary.quantity.textContent = formatQuantity(booking.quantity);
  ui.summary.total.textContent = formatPrice(booking.total);

  // Lås formuläret så att de bekräftade uppgifterna inte kan ändras.
  ui.fields.disabled = true;
  ui.submitButton.hidden = true;

  ui.confirmation.hidden = false;
  ui.confirmation.focus();
}

/* ---------- Start over ---------- */

function restartBooking() {
  isConfirmed = false;

  ui.inputs.name.value = "";
  ui.inputs.email.value = "";
  ui.inputs.quantity.value = String(MIN_QUANTITY);

  selectedOfferId = null;
  updateOfferMarking();

  Object.keys(ui.errors).forEach(clearError);

  Object.values(ui.summary).forEach((element) => {
    element.textContent = "";
  });
  ui.confirmation.hidden = true;

  ui.fields.disabled = false;
  ui.submitButton.hidden = false;

  updatePriceDisplay();
  ui.form.scrollIntoView({ block: "start" });
}

/* ---------- Hjälpfunktioner för text ---------- */

function formatPrice(amount) {
  return `${amount.toLocaleString("en-US")} SEK`;
}

function formatQuantity(quantity) {
  const unit = quantity === 1 ? activity.unitSingular : activity.unitPlural;
  return `${quantity} ${unit}`;
}
