"use strict";

/*
 * WorkHub Haunted Rooms – gemensam JavaScript för alla sidor.
 *
 * Här ligger bara det som alla sidor behöver: mobilmenyn, markeringen
 * av aktuell sida i menyn och årtalet i sidfoten.
 * Bokningslogiken ligger i en egen fil per rum, till exempel possessed-doll.js.
 */

// Talar om för CSS att JavaScript är igång (används för mobilmenyn).
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  markCurrentPage();
  showCurrentYear();
});

/* ==========================================================
   Navigering och sidfot
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
