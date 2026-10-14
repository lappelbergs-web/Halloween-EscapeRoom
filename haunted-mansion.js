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

offers.forEach(function(offer) {
    const offerCard = document.createElement("div");

    offerCard.innerHTML = `
        <h3>${offer.name}</h3>
        <p>${offer.description}</p>
        <p>Price: $${offer.price} SEK / person</p>
    `;


})