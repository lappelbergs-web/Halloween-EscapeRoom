const rooms = [
  {
    id: 1,
    name: "The Haunted Mansion",
    description: "Enter an abandoned mansion where the previous owners never truly left.",
    price: 300,
    image: "images/haunted-mansion.jpg"
    },
    {
        id: 2,
        name: "The Possessed Doll",
        description: "A cursed doll has awakened. Solve the mystery before she finds you.",
        price: 350,
        image: "images/possessed-doll.jpg"
    },
    {
        id: 3,
        name: "The Abandoned Asylym",
        description: "The asylym has been empty for decades... or so everyone thought.",
        price: 400,
        image: "images/abandoned-asylum.jpg"
    }
];

const roomsContainer = document.querySelector("#rooms-container");
const selectedRoom = document.querySelector("#selected-room");

function displayRooms() {
    rooms.forEach(function(room) {
const roomCard = document.createElement("div");
roomCard.classList.add("room-card");

roomCard.innerHTML = `
        <img src="${room.image}" alt="${room.name}" class="room-image">

        <div class="room-info">
        <h2>${room.name}</h2>
        <p>${room.description}</p>
        <p>Price: $${room.price}</p>

        <button class="select-room" data-id="${room.id}">
            Select Room
        </button>
        </div>
        `;

        roomsContainer.appendChild(roomCard);
        const selectButton = roomCard.querySelector(".select-room");

        selectButton.addEventListener("click", function() {
            document.querySelectorAll(".room-card").forEach(function(card) {
                card.classList.remove("selected");
            });
            roomCard.classList.add("selected");
            console.log(room.name);
            selectedRoom.textContent = `You selected: ${room.name} - Price: $${room.price}`;
        });
    });
}

displayRooms(); 