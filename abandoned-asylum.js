const offers = [
    { id: 1, name: "Patient Room", description: "A frightening room for a short visit", price: 100 },
    { id: 2, name: "Night Shift", description: "A longer experience during the night shift", price: 150 },
    { id: 3, name: "Asylum Wing", description: "Explore an entire wing together", price: 200 }
];

const MAX_QUANTITY = 5;
const MIN_QUANTITY = 1;

const offerList = document.getElementById("offer-list");
const selectedOfferDisplay = document.getElementById("selected-offer");
const priceDisplay = document.getElementById("price-output");
const resetButton = document.getElementById("restart-button");
const submitButton = document.getElementById("submit-button");

const bookingFields = {
    form: document.getElementById("booking-form"),
    fieldset: document.getElementById("booking-fields"),
    quantity: document.getElementById("quantity"),
    name: document.getElementById("customer-name"),
    email: document.getElementById("customer-email")
};

const fieldErrors = {
    offer: document.getElementById("offer-error"),
    quantity: document.getElementById("quantity-error"),
    name: document.getElementById("name-error"),
    email: document.getElementById("email-error")
};

const summaryFields = {
    name: document.getElementById("summary-name"),
    email: document.getElementById("summary-email"),
    offer: document.getElementById("summary-offer"),
    quantity: document.getElementById("summary-quantity"),
    total: document.getElementById("summary-total")
};
const confirmation = document.getElementById("confirmation");

let bookingIsConfirmed = false;
let validationHasRun = false;

function renderOffers() {
    if (!offerList) return;

    offers.forEach((offer) => {
        const label = document.createElement("label");
        label.className = "offer-card";

        const radio = document.createElement("input");
        radio.className = "offer-choice";
        radio.type = "radio";
        radio.name = "offer";
        radio.value = String(offer.id);
        radio.setAttribute("aria-describedby", "selected-offer offer-error");

        const name = document.createElement("span");
        name.className = "offer-name";
        name.textContent = offer.name;

        const description = document.createElement("span");
        description.className = "offer-description";
        description.textContent = offer.description;

        const price = document.createElement("span");
        price.className = "offer-price";
        price.textContent = `${offer.price} kr per player`;

        label.append(radio, name, description, price);
        offerList.appendChild(label);
    });
}

function getSelectedOfferId() {
    return new FormData(bookingFields.form).get("offer") || "";
}

function updateSelectedOfferDisplay() {
    if (!selectedOfferDisplay || !offerList) return;

    const selectedOfferId = String(getSelectedOfferId());
    const selectedOffer = offers.find((offer) => String(offer.id) === selectedOfferId);

    selectedOfferDisplay.textContent = selectedOffer
        ? `Selected experience: ${selectedOffer.name} — ${selectedOffer.description}`
        : "No experience selected yet.";

    offerList.querySelectorAll(".offer-card").forEach((card) => {
        const radio = card.querySelector(".offer-choice");
        card.classList.toggle("is-selected", Boolean(radio && radio.checked));
    });
}

function calculateTotalPrice(selectedOfferId, quantity) {
    const offer = offers.find((item) => String(item.id) === String(selectedOfferId));
    const validQuantity = Number(quantity);

    if (
        !offer
        || !Number.isInteger(validQuantity)
        || validQuantity < MIN_QUANTITY
        || validQuantity > MAX_QUANTITY
    ) {
        return null;
    }

    return offer.price * validQuantity;
}

function validateForm(formValues) {
    const errors = {};
    const name = String(formValues.name || "").trim();
    const email = String(formValues.email || "");
    const offer = String(formValues.offer || "").trim();
    const quantityValue = Number(formValues.quantity || 0);

    if (!name) errors.name = "Enter your name. The field cannot contain only spaces.";

    if (!email.trim()) {
        errors.email = "Enter your email address.";
    } else if (/\s/.test(email)) {
        errors.email = "The email address cannot contain spaces.";
    } else {
        const emailParts = email.split("@");
        if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
            errors.email = "The email address must contain one @ with text before and after it.";
        } else {
            const domainParts = emailParts[1].split(".");
            if (domainParts.length < 2 || !domainParts[0] || !domainParts[1]) {
                errors.email = "The email domain must contain a dot with text on both sides.";
            }
        }
    }

    if (!offers.some((item) => String(item.id) === offer)) {
        errors.offer = "Choose a valid experience.";
    }

    if (!Number.isInteger(quantityValue) || quantityValue < MIN_QUANTITY || quantityValue > MAX_QUANTITY) {
        errors.quantity = `Enter a whole number of players between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`;
    }

    return errors;
}

function updatePriceDisplay() {
    if (!bookingFields.form || !bookingFields.quantity || !priceDisplay) return;

    const selectedOfferId = getSelectedOfferId();
    const quantity = Number(bookingFields.quantity.value);

    if (!selectedOfferId) {
        priceDisplay.textContent = "Choose an experience to see the price.";
        return;
    }

    if (!bookingFields.quantity.value) {
        priceDisplay.textContent = `Enter a number of players between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`;
        return;
    }

    if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
        priceDisplay.textContent = `Players must be a whole number between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`;
        return;
    }

    const totalPrice = calculateTotalPrice(selectedOfferId, quantity);
    if (totalPrice === null) {
        priceDisplay.textContent = "Choose a valid experience.";
        return;
    }

    priceDisplay.textContent = `Total price: ${totalPrice} kr`;
}

function showValidationErrors(errors) {
    Object.entries(fieldErrors).forEach(([fieldName, errorElement]) => {
        const message = errors[fieldName] || "";
        if (!errorElement) return;

        errorElement.textContent = message;
        errorElement.hidden = !message;

        if (fieldName === "offer") {
            offerList?.querySelectorAll(".offer-choice").forEach((radio) => {
                radio.setAttribute("aria-invalid", String(Boolean(message)));
            });
            return;
        }

        const field = bookingFields[fieldName];
        if (field) field.setAttribute("aria-invalid", String(Boolean(message)));
    });
}

function showSummary(formValues, totalPrice) {
    if (!confirmation || Object.values(summaryFields).some((field) => !field)) return;

    const name = String(formValues.name || "").trim();
    const email = String(formValues.email || "").trim();
    const selectedOfferId = String(formValues.offer || "").trim();
    const quantity = Number(formValues.quantity || 0);
    const offer = offers.find((item) => String(item.id) === selectedOfferId);

    summaryFields.name.textContent = name;
    summaryFields.email.textContent = email;
    summaryFields.offer.textContent = offer ? offer.name : "No experience selected";
    summaryFields.quantity.textContent = `${quantity} ${quantity === 1 ? "player" : "players"}`;
    summaryFields.total.textContent = `${totalPrice} kr`;
    confirmation.hidden = false;
    confirmation.focus();
}

function resetForm() {
    if (!bookingFields.form) return;

    bookingIsConfirmed = false;
    validationHasRun = false;
    bookingFields.form.reset();

    showValidationErrors({});
    if (confirmation) confirmation.hidden = true;
    Object.values(summaryFields).forEach((field) => {
        if (field) field.textContent = "";
    });

    setBookingFormLocked(false);
    updateSelectedOfferDisplay();
    updatePriceDisplay();
}

function setBookingFormLocked(isLocked) {
    if (bookingFields.fieldset) bookingFields.fieldset.disabled = isLocked;
    if (submitButton) submitButton.disabled = isLocked;
}

function getFormValues() {
    if (!bookingFields.form) return {};
    return Object.fromEntries(new FormData(bookingFields.form));
}

function updateValidationErrors() {
    if (!validationHasRun || bookingIsConfirmed) return;
    showValidationErrors(validateForm(getFormValues()));
}

function handleBookingSubmit(event) {
    event.preventDefault();

    if (!bookingFields.form || bookingIsConfirmed) return;

    validationHasRun = true;
    const formValues = getFormValues();
    const errors = validateForm(formValues);

    if (Object.keys(errors).length > 0) {
        showValidationErrors(errors);
        return;
    }

    const totalPrice = calculateTotalPrice(formValues.offer, formValues.quantity);
    if (totalPrice === null) {
        showValidationErrors({
            offer: "Choose a valid experience.",
            quantity: `Players must be a whole number between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`
        });
        return;
    }

    showValidationErrors({});
    showSummary(formValues, totalPrice);
    bookingIsConfirmed = true;
    setBookingFormLocked(true);
}

function initializeBookingPage() {
    if (!bookingFields.form) return;

    const requiredElements = [
        ["offer list", offerList],
        ["selected experience message", selectedOfferDisplay],
        ["quantity input", bookingFields.quantity],
        ["booking fieldset", bookingFields.fieldset],
        ["name input", bookingFields.name],
        ["email input", bookingFields.email],
        ["price display", priceDisplay],
        ...Object.entries(fieldErrors).map(([name, field]) => [`${name} error message`, field]),
        ["confirmation section", confirmation],
        ...Object.entries(summaryFields).map(([name, field]) => [`summary ${name}`, field]),
        ["reset button", resetButton],
        ["submit button", submitButton]
    ];
    const missingElements = requiredElements
        .filter(([, element]) => !element)
        .map(([name]) => name);

    if (missingElements.length > 0) {
        console.error(`Booking form is missing required HTML elements: ${missingElements.join(", ")}`);
        return;
    }

    bookingFields.form.noValidate = true;
    renderOffers();
    offerList.addEventListener("change", () => {
        updateSelectedOfferDisplay();
        updatePriceDisplay();
        updateValidationErrors();
    });
    bookingFields.quantity.addEventListener("input", () => {
        updatePriceDisplay();
        updateValidationErrors();
    });
    bookingFields.name.addEventListener("input", updateValidationErrors);
    bookingFields.email.addEventListener("input", updateValidationErrors);
    bookingFields.form.addEventListener("submit", handleBookingSubmit);
    resetButton.addEventListener("click", resetForm);
    updateSelectedOfferDisplay();
    updatePriceDisplay();
}

initializeBookingPage();