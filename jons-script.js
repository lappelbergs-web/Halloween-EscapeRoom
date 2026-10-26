// gemensam kod
function renderPrices(listElement, prices) {
    prices.forEach((item) => {
      const li = document.createElement("li");
      li.textContent =
        `${item.name}: ${item.price} kr ` + `- ${item.description}`;
  
      listElement.appendChild(li);
    });
  }
  
  function getPriceForPackage(selectedId, prices) {
    if (!selectedId) {
      return null;
    }
    const pkg = prices.find((item) => String(item.id) === selectedId);
    return pkg ? pkg.price : null;
  }
  
  function calculateTotalPrice(basePrice, hours) {
    return basePrice * hours;
  }
  
  // individuell kod
  
  clown_room_prices = [
    {
      id: 1,
      description: " A smaller package for a daring single soul",
      name: "Single package",
      price: 250,
    },
    {
      id: 2,
      description: " A medium package for two daring people",
      name: "Couple package",
      price: 500,
    },
    {
      id: 3,
      description: " A large package for the whole family",
      name: "Family package",
      price: 1000,
    },
  ];
  
  const clownList = document.getElementById("clown-prices");
  if (clownList) {
    renderPrices(clownList, clown_room_prices);
  }
  
  const packageSelect = document.getElementById("package-select");
  const timeSelect = document.getElementById("time-select");
  const totalPrice = document.getElementById("total-price");
  
  function updateClownTotalPrice() {
    if (!packageSelect.value) {
      totalPrice.textContent = "Please choose a package.";
      return;
    }
    if (timeSelect && !timeSelect.value) {
      totalPrice.textContent = "Please choose a time.";
      return;
    }
  
    const basePrice = getPriceForPackage(packageSelect.value, clown_room_prices);
    const hours = Number(timeSelect.value);
    const price = calculateTotalPrice(basePrice, hours);
    totalPrice.textContent = `Total price: ${price} kr`;
  }
  
  if (packageSelect && totalPrice) {
    packageSelect.addEventListener("change", updateClownTotalPrice);
    if (timeSelect) {
      timeSelect.addEventListener("change", updateClownTotalPrice);
    }
    updateClownTotalPrice();
  }
  
  const bookNowButton = document.getElementById("book-now");
  const bookingForm = document.getElementById("booking-form");
  
  if (bookNowButton && bookingForm) {
    const bookingFormPanel = bookingForm.parentElement;
  
    bookNowButton.addEventListener("click", () => {
      bookingFormPanel.classList.remove("booking-form-hidden");
      bookingFormPanel.classList.add("booking-form-visible");
    });
  }
  