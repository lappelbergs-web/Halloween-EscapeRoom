const offers = [
    { id: 1, name: "Patient Room", description: "Ett skrämmande rum för en kort vistelse", price: 100 },
    { id: 2, name: "Night Shift", description: "En längre upplevelse under nattskiftet", price: 150 },
    { id: 3, name: "Asylum Wing", description: "Utforska en hel avdelning tillsammans", price: 200 }
];

const MAX_QUANTITY = 5;
const MIN_QUANTITY = 1;

const priceDisplay = document.getElementById("asylumPriceDisplay");
const resetButton = document.getElementById("asylumResetBtn");
const submitButton = document.getElementById("asylumSubmitBtn");

const bookingFields = {
    form: document.getElementById("asylumBookingForm"),
    offer: document.getElementById("asylumOfferSelect"),
    quantity: document.getElementById("asylumQuantityInput"),
    name: document.getElementById("asylumNameInput"),
    email: document.getElementById("asylumEmailInput")
};

const fieldErrors = {
    offer: document.getElementById("asylumOfferError"),
    quantity: document.getElementById("asylumQuantityError"),
    name: document.getElementById("asylumNameError"),
    email: document.getElementById("asylumEmailError")
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
let validationHasRun = false;

function renderOffers() {
    if (!bookingFields.offer) return;

    bookingFields.offer.innerHTML = '<option value="">Välj ett erbjudande</option>';

    offers.forEach((offer) => {
        const option = document.createElement("option");
        option.value = String(offer.id);
        option.textContent = `${offer.name} - ${offer.description} (${offer.price} kr/paket)`;
        bookingFields.offer.appendChild(option);
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
    const email = String(formValues.email || "").trim();
    const offer = String(formValues.offer || "").trim();
    const quantityValue = Number(formValues.quantity || 0);

    if (!name) errors.name = "Ange ditt namn. Fältet får inte bara innehålla blanksteg.";

    if (!email) {
        errors.email = "Ange din e-postadress.";
    } else if (/\s/.test(email)) {
        errors.email = "E-postadressen får inte innehålla blanksteg.";
    } else {
        const emailParts = email.split("@");
        if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
            errors.email = "E-postadressen ska innehålla ett @ med text före och efter.";
        } else {
            const domainParts = emailParts[1].split(".");
            if (domainParts.length < 2 || !domainParts[0] || !domainParts[1]) {
                errors.email = "E-postadressens domän ska innehålla en punkt med text på båda sidor.";
            }
        }
    }

    if (!offers.some((item) => String(item.id) === offer)) {
        errors.offer = "Välj ett giltigt erbjudande.";
    }

    if (!Number.isInteger(quantityValue) || quantityValue < MIN_QUANTITY || quantityValue > MAX_QUANTITY) {
        errors.quantity = `Ange ett heltal mellan ${MIN_QUANTITY} och ${MAX_QUANTITY} paket.`;
    }

    return errors;
}

function updatePriceDisplay() {
    if (!bookingFields.offer || !bookingFields.quantity || !priceDisplay) return;

    const selectedOfferId = bookingFields.offer.value;
    const quantity = Number(bookingFields.quantity.value);

    if (!selectedOfferId) {
        priceDisplay.textContent = "Välj ett erbjudande för att se priset.";
        return;
    }

    if (!bookingFields.quantity.value) {
        priceDisplay.textContent = `Ange antal paket mellan ${MIN_QUANTITY} och ${MAX_QUANTITY}.`;
        return;
    }

    if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
        priceDisplay.textContent = `Antalet paket måste vara ett heltal mellan ${MIN_QUANTITY} och ${MAX_QUANTITY}.`;
        return;
    }

    const totalPrice = calculateTotalPrice(selectedOfferId, quantity);
    if (totalPrice === null) {
        priceDisplay.textContent = "Välj ett giltigt erbjudande.";
        return;
    }

    priceDisplay.textContent = `Totalpris: ${totalPrice} kr`;
}

function showValidationErrors(errors) {
    Object.entries(fieldErrors).forEach(([fieldName, errorElement]) => {
        const message = errors[fieldName] || "";
        const field = bookingFields[fieldName];
        if (!errorElement || !field) return;

        errorElement.textContent = message;
        field.setAttribute("aria-invalid", String(Boolean(message)));
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
    summaryFields.offer.textContent = offer ? offer.name : "Inget erbjudande valt";
    summaryFields.quantity.textContent = `${quantity} paket`;
    summaryFields.total.textContent = `${totalPrice} kr`;
    summarySection.classList.remove("hidden");
}

function resetForm() {
    if (!bookingFields.form) return;

    bookingIsConfirmed = false;
    validationHasRun = false;
    bookingFields.form.reset();

    showValidationErrors({});
    if (summarySection) summarySection.classList.add("hidden");
    Object.values(summaryFields).forEach((field) => {
        if (field) field.textContent = "";
    });

    setBookingFormLocked(false);
    updatePriceDisplay();
}

function setBookingFormLocked(isLocked) {
    if (!bookingFields.form) return;

    bookingFields.form
        .querySelectorAll("input, select, textarea, button[type='submit']")
        .forEach((element) => {
            element.disabled = isLocked;
        });
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
            offer: "Välj ett giltigt erbjudande.",
            quantity: `Ange ett heltal mellan ${MIN_QUANTITY} och ${MAX_QUANTITY} paket.`
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
        ["offer dropdown", bookingFields.offer],
        ["quantity input", bookingFields.quantity],
        ["name input", bookingFields.name],
        ["email input", bookingFields.email],
        ["price display", priceDisplay],
        ...Object.entries(fieldErrors).map(([name, field]) => [`${name} error message`, field]),
        ["summary section", summarySection],
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
    bookingFields.offer.addEventListener("change", () => {
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
    updatePriceDisplay();
}

initializeBookingPage();