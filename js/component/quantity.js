import { backend, userCartUpdate } from "../env.js";
import { localCartAdd } from "./cart.js";

const updatePrice = async (e, add = true) => {
  const totalPrice = document.querySelector(".total-value strong");
  const price = parseInt(totalPrice?.innerText.split("₹")[1]);

  const productId = e.currentTarget.dataset.id;
  const jumpValue = parseInt(e.currentTarget.dataset.value);

  const calc = add ? price + jumpValue : price - jumpValue;
  totalPrice.innerHTML = `<small>₹</small>${calc}`;

  
  const qtyNum = e.currentTarget.parentElement.querySelector(".qty-input span");
  const currentVal = parseInt(qtyNum.innerText);
  
  if((!add) && currentVal === 0)return;
  if((add) && currentVal === 11)return;
  
  const token = localStorage.getItem("token");
  if (!token) {
    localCartAdd({ id: productId, qty: add?1:-1 });
    return;
  }

  let responce = await fetch(backend + userCartUpdate + `?token=${token}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: [{ id: productId, qty: add?1:-1 }],
    }),
  });

  await responce.json();
};

// Quantity Listners
export const qtyEL = (price = false) => {
  const increaseBtn = document.querySelectorAll(".quantity .increase");
  const decreaseBtn = document.querySelectorAll(".quantity .decrease");

  const totalPrice = document.querySelector(".total-value strong");
  if (totalPrice) {
    totalPrice.innerHTML = `<small>₹</small>${price}`;
  }

  increaseBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const qtyNum =
        e.currentTarget.parentElement.querySelector(".qty-input span");
      const currentVal = parseInt(qtyNum.innerText);
      if (currentVal >= 10) return;
      qtyNum.innerText = currentVal + 1;
      if (price) updatePrice(e, true);
    });
  });

  decreaseBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const qtyNum =
        e.currentTarget.parentElement.querySelector(".qty-input span");
      const currentVal = parseInt(qtyNum.innerText);
      if (currentVal === 1) return;
      qtyNum.innerText = parseInt(qtyNum.innerText) - 1;
      if (price) updatePrice(e, false);
    });
  });
};
