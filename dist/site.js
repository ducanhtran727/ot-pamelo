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
const orderThanks = document.getElementById("order-thanks");
for (const trigger of document.querySelectorAll("[data-open-order]")) {
  const openOrder = () => order.showModal();
  if (trigger instanceof HTMLButtonElement) trigger.addEventListener("click", openOrder);
  else makeButton(trigger, "", openOrder);
}

order.querySelector(".order-close").addEventListener("click", () => order.close());
order.addEventListener("click", event => {
  if (event.target !== order) return;
  const bounds = order.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) order.close();
});

const form = document.getElementById("y2a69jfz");
const orderStatus = document.getElementById("order-status");
const submitOrder = form.querySelector('[type="submit"]');
// Paste the deployed Google Apps Script web app URL ending in /exec here.
const GOOGLE_SCRIPT_URL = "";

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (submitOrder.disabled) return;
  if (!GOOGLE_SCRIPT_URL.trim()) {
    orderStatus.textContent = "Form chưa được kết nối để nhận đơn.";
    return;
  }

  const data = new FormData(form);
  const body = new URLSearchParams({
    full_name: data.get("full_name").trim(),
    phone_number: data.get("phone_number").trim(),
    address: data.get("address").trim(),
    package: data.get("package")
  });
  if (!body.get("full_name") || !body.get("address")) {
    orderStatus.textContent = "Vui lòng điền họ tên và địa chỉ giao hàng.";
    return;
  }

  submitOrder.disabled = true;
  orderStatus.textContent = "Đang gửi đơn hàng…";
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL.trim(), { method: "POST", body });
    if (!response.ok || (await response.json()).ok !== true) {
      throw new Error("Order was not confirmed");
    }
    form.reset();
    orderStatus.textContent = "";
    order.close();
    orderThanks.showModal();
  } catch {
    orderStatus.textContent = "Chưa xác nhận được đơn hàng. Vui lòng kiểm tra lại trước khi gửi lại.";
  } finally {
    submitOrder.disabled = false;
  }
});

function fitLayout() {
  document.documentElement.style.setProperty("--page-scale", Math.min(1, window.innerWidth / 420));
  document.documentElement.style.setProperty("--viewport-height", window.innerHeight + "px");
}
fitLayout();
window.addEventListener("resize", fitLayout);
