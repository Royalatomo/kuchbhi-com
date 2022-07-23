import { backend, userCartGet, userCartUpdate, checkoutRoute, getUserDetailsRoute, getProductByIdRoute } from "./env.js";

import("./component/header.js");
import { qtyEL } from "./component/quantity.js";
import { delCartItem } from "./component/cart.js";

async function populateWithLocal() {
  let items = [];
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  for(let i of cart) {
    const responce = await fetch(backend+getProductByIdRoute+`?pid=${i.id}`);
    const data = await responce.json();
    if(!data.success) {
      alert("something went wrong");
      console.log(data.error);
      return;
    }

    items.push({...data.product, qty: i.qty});
  }

  return items;
}

const pageSize = 4;
const page = 1;

async function populateItems() {
  const token = localStorage.getItem("token");
  let items = [];

  if (!token) {
    items = await populateWithLocal();
  }else {
    const responce = await fetch(
      backend + userCartGet + `?token=${token}&page=${page}&pagesize=${pageSize}`
    );
    const data = await responce.json();
  
    if (!data.success) {
      return;
    }
    items = data.products;
  }


  let price = 0;
  for (let product of items) {
    price += product.price * product.qty;
    let reviewHTML = "";
    for (let i = 0; i < product.stars; i++) {
      reviewHTML += `<img src="/assets/fill-star.png" alt="filled-star">`;
    }

    for (let i = 0; i < 5 - product.stars; i++) {
      reviewHTML += `<img src="/assets/empty-star.png" alt="filled-star">`;
    }

    const productElem = document.createElement("div");
    productElem.setAttribute("id", product._id);
    productElem.setAttribute("class", "product");
    const img =
      product.images[0] ||
      "https://ik.imagekit.io/imdfhuoko/62bb2054b5a19e7ad70393bb-0_hIsXL87i0.jpg";
    productElem.innerHTML += `<a href="/product.html?pid=${product._id}" class="img-area"><img src="${
      img + "?tr=h-150"
    }" alt="product-image"></a>`;
    productElem.innerHTML += `<div class="details-area">
    <div class="container">
        <div class="details-head">
            <div class="brand-name"><small>Brand:</small> Something Amazing</div>
            <div class="product-name">One of the most amazing product</div>
        </div>
        <img data-id="${product._id}"src="/assets/close.png" alt="close-btn" class="close">
    </div>

    <div class="reviews">
        ${reviewHTML}
        <p class="total-reviews">${product.reviews}</p>
    </div>

    <div class="container product-foot">
        <p class="price"><small>₹</small>${product.price}</p>
        <div class="quantity">
            <button data-id="${product._id}" data-value="${product.price}" class="decrease">-</button>
            <p class="qty-input">Qty: <span>${product.qty}</span></p>
            <button data-id="${product._id}" data-value="${product.price}" class="increase">+</button>
        </div>
        <p class="delivery-date">Deliver In: <span>${product.delivery}</span> Days</p>
        </div>
        </div>`;

    const closeBtn = productElem.querySelector(".close");
    closeBtn.addEventListener("click", async () => {
      const confirm = window.confirm("Are you sure to remove it?");
      if (!confirm) return;
      
      const productId = closeBtn.dataset.id;
      if(!token) {
        delCartItem(productId);
      }else {
        const responce = await fetch(
          backend + userCartUpdate + `?token=${token}`,
          {
            method: "PATCH",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ product: [{ id: productId, qty: -500000 }] }),
          }
        );
  
        await responce.json();
      }
      
      const productElement = document.getElementById(productId);

      const cartCount = document.querySelector(".cart-item-count");
      cartCount.innerText = parseInt(cartCount.innerText) - 1;
      const jump = parseInt(
        productElement.querySelector(".decrease").dataset.value
      );
      const qty = parseInt(
        productElement.querySelector(".qty-input span").innerText
      );
      const totalPrice = document.querySelector(".total-value strong");
      const price = parseInt(totalPrice?.innerText.split("₹")[1]);
      const calc = price - jump * qty;
      totalPrice.innerHTML = `<small>₹</small>${calc}`;
      productElement.remove();
    });

    document.querySelector(".products-container").appendChild(productElem);
  }

  qtyEL(price);
  document.querySelector("button.checkout").addEventListener("click", checkout);
}

populateItems();

async function checkout() {
  const token = localStorage.getItem("token");
  if (!token) {
    location.href = "/login.html?checkout=true"
  }

  // getting cart
  let responce = await fetch(backend + getUserDetailsRoute + `?token=${token}`);
  let data = await responce.json();

  if (!data.success) {
    console.log(data.error);
    alert("something went wrong");
    localStorage.removeItem("token");
    location.href = "/login.html";
  }

  responce = await fetch(backend + checkoutRoute + `?token=${token}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({orders: data?.user?.cart}),
  });

  data = await responce.json();
  if(!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }
  location.href = "/thanks.html";
}