const offers = [
    { id: 1, name: "Patient Room", description: "patient room for patient people", price: 100 },
    { id: 2, name: "Night Shift", description: "night shift for night owls", price: 150 },
    { id: 3, name: "Asylum Wing", description: "asylum wing for people who can fly", price: 200 }
];

const MAX_QUANTITY = 5;
const MIN_QUANTITY = 1;

const priceDisplay = document.getElementById("asylumPriceDisplay");
const errorMessage = document.getElementById("asylumErrorMessage");
const ResetButton = document.getElementById("asylumResetBtn");
const SubmitButton = document.getElementById("asylumSubmitBtn");
const Cards = document.querySelectorAll(".offer-card");

const bookingFields = {
    form: document.getElementById("asylumBookingForm"),
    offer: document.getElementById("asylumOfferSelect"),
    quantity: document.getElementById("asylumQuantityInput"),
    name: document.getElementById("asylumNameInput"),
    email: document.getElementById("asylumEmailInput")
};

const summaryFields = {
    name: document.getElementById("asylumSummaryName"),
    email: document.getElementById("asylumSummaryEmail"),
    offer: document.getElementById("asylumSummaryOffer"),
    quantity: document.getElementById("asylumSummaryQuantity"),
    total: document.getElementById("asylumSummaryTotal")
};
const summarySection = document.getElementById("asylumSummarySection");

let bookingIsConfirmed = false;

Cards.forEach((Card, index) => {
    const offer = offers[index];

    Card.querySelector(".offer-choice").value = offer.id;
    Card.querySelector(".offer-name").textContent = offer.name;
    Card.querySelector(".offer-description").textContent = offer.description;
    Card.querySelector(".offer-price").textContent = `${offer.price} kr`;
});

function calculateTotalPrice(selectedOfferId, quantity) {
    const offer = offers.find((item) => String(item.id) === String(selectedOfferId));
    const validQuantity = Number(quantity);

    if (!offer || !Number.isInteger(validQuantity)
        || validQuantity < MIN_QUANTITY 
        || validQuantity > MAX_QUANTITY){
        return null;
    }

    return offer.price * validQuantity;
}

function validateForm(formValues) {
    const errors = {};
    const name = String(formValues.name || "").trim();
    const email = String(formValues.email || "").trim();
    const offer = String(formValues.offer || "").trim();
    const quantityValue = Number(formValues.quantity || 0);

    if (!name) errors.name = "Name is required.";

    if (!email) {
        errors.email = "Email is required.";
    } else if (/\s/.test(email)) {
        errors.email = "Email cannot contain spaces.";
    } else {
        const emailParts = email.split("@");
        if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
            errors.email = "Email must contain exactly one @ and text before and after it.";
        } else {
            const domainParts = emailParts[1].split(".");
            if (domainParts.length < 2 || !domainParts[0] || !domainParts[1]) {
                errors.email = "Email domain must contain a valid dot and text on both sides.";
            }
        }
    }

    if (!offer) errors.offer = "Please select an offer.";

    if (!Number.isInteger(quantityValue) || quantityValue < MIN_QUANTITY || quantityValue > MAX_QUANTITY) {
        errors.quantity = `Quantity must be an integer between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`;
    }

    return errors;
}

function updatePriceDisplay() {
    if (!bookingFields.offer || !bookingFields.quantity || !priceDisplay) return;

    const selectedOfferId = bookingFields.offer.value;
    const quantity = Number(bookingFields.quantity.value);

    if (!selectedOfferId || !bookingFields.quantity.value) {
        priceDisplay.textContent = "Please select an offer and quantity.";
        return;
    }

    if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
        priceDisplay.textContent = `Quantity must be a whole number between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`;
        return;
    }

    const totalPrice = calculateTotalPrice(selectedOfferId, quantity);
    if (totalPrice === null) {
        priceDisplay.textContent = "Please select a valid offer.";
        return;
    }

    priceDisplay.textContent = `Total price: ${totalPrice} kr`;
}

function showValidationErrors(errors) {
    if (!errorMessage) return;

    errorMessage.innerHTML = "";

    Object.values(errors).forEach((message) => {
        const errorItem = document.createElement("div");
        errorItem.textContent = message;
        errorMessage.appendChild(errorItem);
    });
}

function showSummary(formValues, totalPrice) {
    if (!summarySection || Object.values(summaryFields).some((field) => !field)) return;

    const name = String(formValues.name || "").trim();
    const email = String(formValues.email || "").trim();
    const selectedOfferId = String(formValues.offer || "").trim();
    const quantity = Number(formValues.quantity || 0);
    const offer = offers.find((item) => String(item.id) === selectedOfferId);

    summaryFields.name.textContent = name;
    summaryFields.email.textContent = email;
    summaryFields.offer.textContent = offer ? offer.name : "N/A";
    summaryFields.quantity.textContent = String(quantity);
    summaryFields.total.textContent = `${totalPrice} kr`;
    summarySection.classList.remove("hidden");
}

function resetForm() {
    if (!bookingFields.form) return;

    bookingIsConfirmed = false;
    bookingFields.form.reset();

    if (errorMessage) errorMessage.innerHTML = "";
    if (priceDisplay) priceDisplay.textContent = "Please select an offer.";
    if (summarySection) summarySection.classList.add("hidden");
    Object.values(summaryFields).forEach((field) => {
        if (field) field.textContent = "";
    });

    setBookingFormLocked(false);
}

function setBookingFormLocked(isLocked) {
    if (!bookingFields.form) return;

    bookingFields.form.querySelectorAll("input, select, textarea, button[type='submit']").forEach((element) => {
        element.disabled = isLocked;
    });
}