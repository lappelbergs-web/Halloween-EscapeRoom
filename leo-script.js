/*
 * BOOKING FLOW DIAGRAM
 *
 * Page loads
 *    |
 *    v
 * initializeBookingPage()
 *    |-- check that required HTML controls already exist
 *    |-- renderOffers()             -> fill the offer dropdown from `offers`
 *    |-- connect event listeners
 *    `-- updatePriceDisplay()       -> show the initial price message
 *
 * User changes offer or quantity
 *    `-- updatePriceDisplay() -> calculateTotalPrice() -> update price text
 *
 * User submits the form
 *    `-- handleBookingSubmit()
 *          |-- getFormValues() -> read the current inputs
 *          |-- validateForm()  -> return an object containing any errors
 *          |       `-- errors found? -> showValidationErrors() and stop
 *          `-- no errors -> calculateTotalPrice() -> showSummary() -> lock form
 *
 * User chooses Start over
 *    `-- resetBookingForm() -> clear inputs, errors, summary, and price; unlock form
 *
 * Arrow meaning: one function calls the next; `|--` marks a step and `--` a branch.
 */

// ------------------------------
// 1. OFFER DATA
// ------------------------------
// The exam requires at least three offers in an array of objects.
// This section is the data layer: it defines the actual prices and descriptions.
const offers = [
    { id: 1, name: "Patient Room", description: "A short escape for one guest", price: 100 },
    { id: 2, name: "Night Shift", description: "A longer escape for two guests", price: 150 },
    { id: 3, name: "Asylum Wing", description: "The full escape for a group", price: 200 }
];
const MAX_QUANTITY = 5;

// ------------------------------
// 2. EXISTING HTML ELEMENTS
// ------------------------------
// The HTML provides the labeled controls and message areas.
// This script finds them and adds behavior; it does not create form markup.
const bookingForm = document.getElementById("asylumBookingForm");
const offerSelect = document.getElementById("asylumOfferSelect");
const quantityInput = document.getElementById("asylumQuantityInput");
const nameInput = document.getElementById("asylumNameInput");
const emailInput = document.getElementById("asylumEmailInput");
const priceDisplay = document.getElementById("asylumPriceDisplay");
const errorBox = document.getElementById("asylumErrorMessage");
const summaryBox = document.getElementById("asylumSummarySection");
const summaryName = document.getElementById("asylumSummaryName");
const summaryEmail = document.getElementById("asylumSummaryEmail");
const summaryOffer = document.getElementById("asylumSummaryOffer");
const summaryQuantity = document.getElementById("asylumSummaryQuantity");
const summaryTotal = document.getElementById("asylumSummaryTotal");
const resetButton = document.getElementById("asylumResetBtn");
const submitButton = document.getElementById("asylumSubmitBtn");
let bookingIsConfirmed = false;

// ------------------------------
// 3. RENDER OFFER LIST
// ------------------------------
// This uses iteration to display each offer dynamically.
// That matches the requirement: offers must be shown via JavaScript.
function renderOffers() {
    if (!offerSelect) return;

    offerSelect.innerHTML = '<option value="">Please choose an offer</option>';

    // `forEach` visits each offer object, creating one dropdown option per offer.
    offers.forEach((offer) => {
        const option = document.createElement("option");
        // The id is the option's submitted value; the text is what the user sees.
        option.value = String(offer.id);
        option.textContent = `${offer.name} - ${offer.description} (${offer.price} kr)`;
        offerSelect.appendChild(option);
    });
}

// ------------------------------
// 4. FORM DATA
// ------------------------------
// Input: a form element.
// Output: a Map where values can be read by field name, such as values.get("email").
function getFormValues(form) {
    if (!form) return new Map();
    return new Map(Array.from(new FormData(form).entries()));
}

// ------------------------------
// 5. PRICE CALCULATION
// ------------------------------
// Inputs: selected offer id and quantity.
// Output: the numeric total price. Returns null when the selection/quantity is invalid.
// Keeping the multiplication here means the same price rule is reused everywhere.
function calculateTotalPrice(selectedOfferId, quantity) {
    // `find` returns the matching offer object, or undefined if no id matches.
    const offer = offers.find((item) => String(item.id) === String(selectedOfferId));
    const validQuantity = Number(quantity);

    if (!offer || !Number.isInteger(validQuantity) || validQuantity < 1 || validQuantity > MAX_QUANTITY) {
        return null;
    }

    return offer.price * validQuantity;
}

// ------------------------------
// 6. VALIDATION
// ------------------------------
// Input: the Map returned by getFormValues().
// Output: an object of field names and messages. An empty object means no errors.
function validateForm(formValues) {
    const errors = {};
    const name = String(formValues.get("name") || "").trim();
    const email = String(formValues.get("email") || "").trim();
    const offer = String(formValues.get("offer") || "").trim();
    const quantityValue = Number(formValues.get("quantity") || 0);

    // trim() removes surrounding whitespace, so a name containing only spaces is rejected.
    if (!name) {
        errors.name = "Name is required.";
    }

    // Split on @ and check the local part and domain separately.
    // Exactly two parts means there was one @ character.
    if (!email) {
        errors.email = "Email is required.";
    } else {
        if (/\s/.test(email)) {
            errors.email = "Email cannot contain spaces.";
        }

        const emailParts = email.split("@");
        if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
            errors.email = "Email must contain exactly one @ and text before and after it.";
        } else {
            const domain = emailParts[1];
            const domainParts = domain.split(".");
            // Require non-empty text before and after a dot in the domain.
            if (domainParts.length < 2 || !domainParts[0] || !domainParts[1]) {
                errors.email = "Email domain must contain a valid dot and text on both sides.";
            }
        }
    }

    // A non-empty value is not enough: it must match an offer from our data list.
    if (!offers.some((item) => String(item.id) === offer)) {
        errors.offer = "Please choose an offer.";
    }

    // Number.isInteger rejects decimal quantities as well as values outside 1–5.
    if (!Number.isInteger(quantityValue) || quantityValue < 1 || quantityValue > MAX_QUANTITY) {
        errors.quantity = `Quantity must be a whole number between 1 and ${MAX_QUANTITY}.`;
    }

    return errors;
}

// ------------------------------
// 7. LIVE PRICE DISPLAY
// ------------------------------
// Reads the current dropdown and quantity, then updates the price text.
// Called both during initial setup and after either input changes.
function updatePriceDisplay() {
    if (!offerSelect || !quantityInput || !priceDisplay) return;

    const selectedOfferId = offerSelect.value;
    const quantity = Number(quantityInput.value);
    if (!selectedOfferId) {
        priceDisplay.textContent = "Please choose an offer.";
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        priceDisplay.textContent = "Please enter a valid quantity between 1 and 5.";
        return;
    }

    const total = calculateTotalPrice(selectedOfferId, quantity);
    if (total === null) {
        priceDisplay.textContent = "Please choose a valid offer and quantity.";
        return;
    }

    priceDisplay.textContent = `Total price: ${total} kr`;
}

// ------------------------------
// 8. ERROR DISPLAY
// ------------------------------
// Input: the error object returned by validateForm().
// Clearing the container first prevents old messages from piling up on retries.
function showValidationErrors(errors) {
    if (!errorBox) return;

    errorBox.innerHTML = "";

    // Each entry is a [field name, message] pair from validateForm().
    Object.entries(errors).forEach(([field, message]) => {
        const errorMessage = document.createElement("p");
        errorMessage.textContent = message;
        errorMessage.style.color = "#b00020";
        errorMessage.style.margin = "0.25rem 0";
        errorMessage.dataset.field = field;
        errorBox.appendChild(errorMessage);
    });
}

// ------------------------------
// 9. CONFIRMATION SUMMARY
// ------------------------------
// Inputs: validated form values and the calculated total.
// This displays the booking details on the page rather than using a browser alert.
function showSummary(formValues, totalPrice) {
    if (!summaryBox) return;

    const name = String(formValues.get("name") || "").trim();
    const email = String(formValues.get("email") || "").trim();
    const selectedOfferId = String(formValues.get("offer") || "");
    const quantity = Number(formValues.get("quantity") || 1);
    const offer = offers.find((item) => String(item.id) === selectedOfferId);

    if (!summaryName || !summaryEmail || !summaryOffer || !summaryQuantity || !summaryTotal) return;

    // Show the unit as well as the number, as required by the exam.
    summaryName.textContent = name;
    summaryEmail.textContent = email;
    summaryOffer.textContent = offer ? offer.name : "Not selected";
    summaryQuantity.textContent = `${quantity} paket`;
    summaryTotal.textContent = `${totalPrice} kr`;
    summaryBox.classList.remove("hidden");
}

// ------------------------------
// 10. RESET FLOW
// ------------------------------
// Restores the initial form state so the user can make another request.
function resetBookingForm() {
    if (!bookingForm) return;

    bookingIsConfirmed = false;
    if (nameInput) nameInput.value = "";
    if (emailInput) emailInput.value = "";
    if (offerSelect) offerSelect.value = "";
    if (quantityInput) quantityInput.value = "1";
    if (errorBox) errorBox.innerHTML = "";
    if (summaryBox) {
        summaryBox.classList.add("hidden");
    }
    if (summaryName) summaryName.textContent = "";
    if (summaryEmail) summaryEmail.textContent = "";
    if (summaryOffer) summaryOffer.textContent = "";
    if (summaryQuantity) summaryQuantity.textContent = "";
    if (summaryTotal) summaryTotal.textContent = "";
    if (priceDisplay) priceDisplay.textContent = "Please choose an offer.";
    setBookingFormLocked(false);
}

// Lock the confirmed booking, but leave the reset control available to start again.
function setBookingFormLocked(isLocked) {
    [offerSelect, quantityInput, nameInput, emailInput, submitButton].forEach((field) => {
        if (field) field.disabled = isLocked;
    });
}

// ------------------------------
// 11. SUBMIT HANDLER
// ------------------------------
// Event handler called when the form is submitted.
// It validates before calculating or showing a confirmation.
function handleBookingSubmit(event) {
    // Prevent the browser from reloading the page; JavaScript handles the flow.
    event.preventDefault();

    if (!bookingForm || bookingIsConfirmed) return;

    const formValues = getFormValues(bookingForm);
    const errors = validateForm(formValues);

    // If there is at least one error, display them and do not confirm the booking.
    if (Object.keys(errors).length > 0) {
        showValidationErrors(errors);
        return;
    }

    const selectedOfferId = String(formValues.get("offer") || "");
    const quantity = Number(formValues.get("quantity") || 1);
    const totalPrice = calculateTotalPrice(selectedOfferId, quantity);

    if (totalPrice === null) {
        showValidationErrors({
            offer: "Please choose a valid offer.",
            quantity: `Quantity must be a whole number between 1 and ${MAX_QUANTITY}.`
        });
        return;
    }

    showValidationErrors({});
    showSummary(formValues, totalPrice);
    bookingIsConfirmed = true;
    setBookingFormLocked(true);
}

// ------------------------------
// 12. INITIALIZATION
// ------------------------------
// Runs once to prepare the page and connect user actions to their handlers.
function initializeBookingPage() {
    if (!bookingForm) return;

    // The HTML owns the form structure and labels; this script only adds behavior.
    const missingElements = [
        ["name input", nameInput],
        ["email input", emailInput],
        ["offer dropdown", offerSelect],
        ["quantity input", quantityInput],
        ["price display (#asylumPriceDisplay)", priceDisplay],
        ["error area (#asylumErrorMessage)", errorBox],
        ["summary area (#asylumSummarySection)", summaryBox],
        ["summary name (#asylumSummaryName)", summaryName],
        ["summary email (#asylumSummaryEmail)", summaryEmail],
        ["summary offer (#asylumSummaryOffer)", summaryOffer],
        ["summary quantity (#asylumSummaryQuantity)", summaryQuantity],
        ["summary total (#asylumSummaryTotal)", summaryTotal],
        ["reset button (#asylumResetBtn)", resetButton],
        ["submit button (#asylumSubmitBtn)", submitButton]
    ].filter(([, element]) => !element);

    if (missingElements.length > 0) {
        console.error(`Booking form is missing required HTML elements: ${missingElements.map(([name]) => name).join(", ")}`);
        return;
    }

    // Disable native browser validation so the custom JavaScript rules below decide validity.
    bookingForm.noValidate = true;
    renderOffers();
    // A change/input event reruns the appropriate function when the user interacts.
    offerSelect.addEventListener("change", updatePriceDisplay);
    quantityInput.addEventListener("input", updatePriceDisplay);
    bookingForm.addEventListener("submit", handleBookingSubmit);
    resetButton.addEventListener("click", resetBookingForm);
    updatePriceDisplay();
}

initializeBookingPage();