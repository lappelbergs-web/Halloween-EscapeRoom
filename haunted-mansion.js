const offers = [
    {
        id: 1,
        name: "The Haunted Beginning",
        description: "A mysterious introduction to the haunted mansion.",
        price: 300,
    },
    {
        id: 2,
        name: "The Dark Secrets",
        description:"Discover the terrifying secrets hidden inside",
        price: 350,
    },
    {
        id: 3,
        name: "The Ultimate Nightmare",
        description: "Face your deepest fears in the ultimate experience",
        price: 400,
    }
];

const offersContainer = document.getElementById("offers-container");

let selectedOffer = null;

const quantityInput = document.getElementById("quantity");
const totalPrice = document.getElementById("total-price");

function updateTotalPrice() {
    const quantity = Number(quantityInput.value);
    if (!selectedOffer || !Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
        totalPrice.textContent = "Choose an experience and enter 1-5 players.";
        return;
    }

    const total = selectedOffer.price * quantity;
    totalPrice.textContent = `Total Price: ${total} SEK`;
}
offers.forEach(function(offer) {
    const offerCard = document.createElement("div");

    offerCard.style.cursor = "pointer";

    offerCard.addEventListener("click", function() {
    selectedOffer = offer;
    document.querySelectorAll("#offers-container div").forEach(function(card) {
        card.style.outline = "none";
    });
    offerCard.style.outline = "3px solid orange";
    console.log("Selected Offer:", selectedOffer.name);
    updateTotalPrice();
    });

    offerCard.innerHTML = `
        <h3>${offer.name}</h3>
        <p>${offer.description}</p>
        <p>Price: ${offer.price} SEK / person</p>
    `;
    
    offersContainer.appendChild(offerCard);
});

quantityInput.addEventListener("input", updateTotalPrice);

const bookingForm = document.getElementById("booking-form");
const customerName = document.getElementById("customer-name");
const customerEmail = document.getElementById("customer-email");

bookingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = customerName.value.trim();
    const email = customerEmail.value.trim();

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");

    nameError.textContent = "";
    emailError.textContent = "";

    if (name === "") {
        nameError.textContent = "Please enter your name.";
    }

    const atIndex = email.indexOf("@");
    const domain = email.slice(atIndex + 1);
    const dotIndex = domain.lastIndexOf(".");

    const validEmail =
        !email.includes(" ") &&
        atIndex > 0 &&
        atIndex === email.lastIndexOf("@") &&
        dotIndex > 0 &&
        dotIndex < domain.length - 1;

    if (!validEmail) {
        emailError.textContent = "Please enter a valid email address in the format name@example.com.";
    }
    const bookingError = document.getElementById("booking-error");
bookingError.textContent = "";

const quantity = Number(quantityInput.value);

if (!selectedOffer) {
    bookingError.textContent = "Please choose an experience.";
} else if (
    quantityInput.value.trim() === "" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 5
) {
    bookingError.textContent = "Please enter 1–5 players.";
}
if (
    name === "" ||
    !validEmail ||
    !selectedOffer ||
    quantityInput.value.trim() === "" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 5
) {
    return;
}

const total = selectedOffer.price * quantity;

const confirmation = document.getElementById("booking-confirmation");

confirmation.replaceChildren();

const heading = document.createElement("h2");
heading.textContent = "Booking Confirmed!";
confirmation.appendChild(heading);

const details = [
    ["Name", name],
    ["Email", email],
    ["Experience", selectedOffer.name],
    ["Players", quantity],
    ["Total Price", `${total} SEK`]
];

details.forEach(function([label, value]) {
    const paragraph = document.createElement("p");
    paragraph.textContent = `${label}: ${value}`;
    confirmation.appendChild(paragraph);
});
customerName.disabled = true;
customerEmail.disabled = true;
quantityInput.disabled = true;

offersContainer.style.pointerEvents = "none";
bookingForm.querySelector('button[type="submit"]').disabled = true;
});
bookingForm.addEventListener("reset", function() {
    selectedOffer = null;

    customerName.disabled = false;
    customerEmail.disabled = false;
    quantityInput.disabled = false;

    offersContainer.style.pointerEvents = "auto";
    bookingForm.querySelector('button[type="submit"]').disabled = false;

    quantityInput.value = "1";

    document.getElementById("name-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("booking-error").textContent = "";
    document.getElementById("booking-confirmation").innerHTML = "";

    offersContainer.querySelectorAll("div").forEach(function(card) {
        card.style.outline = "none";
    });

    totalPrice.textContent = "Choose an experience to see the price.";
});

customerName.addEventListener("input", function() {
    if (customerName.value.trim() !== "") {
        document.getElementById("name-error").textContent = "";
    }
});

customerEmail.addEventListener("input", function() {
    if (customerEmail.validity.valid && customerEmail.value.trim() !== "") {
        document.getElementById("email-error").textContent = "";
    }
});