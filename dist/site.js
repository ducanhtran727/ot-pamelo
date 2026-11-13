"use strict";

const gallery = document.querySelector(".com-gallery");
const slides = [...gallery.querySelectorAll(".gallery-view-item")];
const thumbnails = [...gallery.querySelectorAll(".gallery-controls-item")];
let currentSlide = 0;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => slide.classList.toggle("active", position === currentSlide));
  thumbnails.forEach((thumbnail, position) => {
    const active = position === currentSlide;
    thumbnail.classList.toggle("active", active);
    thumbnail.setAttribute("aria-pressed", String(active));
  });
}

function makeButton(element, label, activate) {
  element.tabIndex = 0;
  element.setAttribute("role", "button");
  if (label) element.setAttribute("aria-label", label);
  element.addEventListener("click", activate);
  element.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  });
}

for (const [direction, change, label] of [["prev", -1, "Ảnh trước"], ["next", 1, "Ảnh tiếp theo"]]) {
  gallery.querySelectorAll('[class$="icon-' + direction + '"]').forEach(element => {
    if (element.className.startsWith("gallery-")) makeButton(element, label, () => showSlide(currentSlide + change));
  });
}

thumbnails.forEach((thumbnail, index) => makeButton(thumbnail, "Xem ảnh " + (index + 1), () => showSlide(index)));
slides.forEach((slide, index) => slide.setAttribute("aria-label", "Hạt giống ớt Palermo, ảnh " + (index + 1)));
showSlide(0);

let touchStart;
gallery.addEventListener("touchstart", event => { touchStart = event.touches[0].clientX; }, { passive: true });
gallery.addEventListener("touchend", event => {
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 35) showSlide(currentSlide + (distance < 0 ? 1 : -1));
}, { passive: true });

const timerStarted = Date.now();
const countdown = ["hour", "minute", "second"].map(unit =>
  document.querySelectorAll(".countdown-item-" + unit + " .show")
);
function updateCountdown() {
  const seconds = 3540 - Math.floor((Date.now() - timerStarted) / 1000) % 3540;
  const values = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60];
  countdown.forEach((digits, index) => {
    const value = String(values[index]).padStart(2, "0");
    digits.forEach((digit, position) => { digit.textContent = value[position]; });
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

const order = document.getElementById("order-dialog");
for (const id of ["w-8brm836h", "w-iaxhhk0l"]) {
  makeButton(document.getElementById(id), "", () => order.showModal());
}

order.querySelector(".order-close").addEventListener("click", () => order.close());
order.addEventListener("click", event => {
  if (event.target !== order) return;
  const bounds = order.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) order.close();
});

for (const [id, label, url] of [
  ["w-3tw80v1n", "Tư vấn qua Zalo", "https://zalo.me/0388403111"],
  ["w-uzmvyu2q", "Tư vấn qua Zalo", "https://zalo.me/0388403111"],
  ["w-905tqad3", "Gọi 0388403111", "tel:0388403111"],
  ["w-c0v37bcx", "Gọi 0388403111", "tel:0388403111"]
]) {
  const element = document.getElementById(id);
  makeButton(element, label, () => { window.location.href = url; });
}

const form = document.getElementById("y2a69jfz");
form.addEventListener("submit", event => {
  event.preventDefault();
  document.getElementById("order-status").textContent =
    "Đây là bản xem thử. Đơn hàng chưa được gửi.";
});

function fitLayout() {
  document.documentElement.style.setProperty("--page-scale", Math.min(1, window.innerWidth / 420));
  document.documentElement.style.setProperty("--viewport-height", window.innerHeight + "px");
}
fitLayout();
window.addEventListener("resize", fitLayout);
