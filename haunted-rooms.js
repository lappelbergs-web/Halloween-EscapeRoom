const rooms = [
  {
    id: 1,
    name: "The Haunted Mansion",
    description: "Enter an abandoned mansion where the previous owners never truly left.",
    price: 300
    },
    {
        id: 2,
        name: "The Possessed Doll",
        description: "A cursed doll has awakened. Solve the mystery before she finds you.",
        price: 350
    },
    {
        id: 3,
        name: "The Abandoned Asylym",
        description: "The asylym has been empty for decades... or so everyone thought.",
        price: 400
    }
];

const roomsContainer = document.querySelector("#rooms-container");
function displayRooms() {
    rooms.forEach(function(room) {
const roomCard = document.createElement("div");
roomCard.innerHTML = `
        <h2>${room.name}</h2>
        <p>${room.description}</p>
        <p>Price: $${room.price}</p>
        `;

        roomsContainer.appendChild(roomCard);
    });
}

displayRooms(); 