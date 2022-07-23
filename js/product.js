import("./component/header.js");
import { localCartAdd } from "./component/cart.js";
import {qtyEL} from "./component/quantity.js";
import { backend, getProductByIdRoute, getUserDetailsRoute, userCartUpdate } from "./env.js";

const backBtn = document.querySelector(".back-btn img");
backBtn.addEventListener("click", () => {
  window.history.back();
});

// Display Image
function removeActiveImgs() {
  const allNavImgs = document.querySelectorAll(".image-navigate img.active");
  allNavImgs.forEach((img) => {
    img.classList.remove("active");
  });
}

function displayImg(e, direct = false) {
  const img = direct ? e : e.currentTarget;
  const position = parseInt(img.dataset.position);
  removeActiveImgs();
  img.classList.add("active");
  const src = document.querySelector(
    `.image-navigate img[data-position='${position}']`
  )?.src;
  if (!src) return;

  const mainImg = document.querySelector(".main-image");
  mainImg.dataset.position = position;
  mainImg.src = src.split("?tr=")[0] + "?tr=h-600";
}

function nextImg() {
  const mainImg = document.querySelector(".main-image");
  const mainPosition = parseInt(mainImg.dataset.position);
  const totalImgs = document.querySelectorAll(".image-navigate img").length;

  if (mainPosition === totalImgs) {
    const img = document.querySelector(
      `.image-navigate img[data-position='1']`
    );
    displayImg(img, true);
    return;
  }

  const img = document.querySelector(
    `.image-navigate img[data-position='${mainPosition + 1}']`
  );
  displayImg(img, true);
  return;
}

function prvImg() {
  const mainImg = document.querySelector(".main-image");
  const mainPosition = parseInt(mainImg.dataset.position);
  const totalImgs = document.querySelectorAll(".image-navigate img").length;

  if (mainPosition === 1) {
    console.log("hello");
    const img = document.querySelector(
      `.image-navigate img[data-position='${totalImgs}']`
    );
    displayImg(img, true);
    return;
  }

  const img = document.querySelector(
    `.image-navigate img[data-position='${mainPosition - 1}']`
  );
  displayImg(img, true);
  return;
}

const pid = location.href.split("pid=")[1];

async function getProductId(pid, useToken = false) {
  const token = localStorage.getItem("token");
  const options =
    token && useToken ? `?token=${token}&pid=${pid}` : `?pid=${pid}`;
  const responce = await fetch(backend + getProductByIdRoute + options);
  const data = await responce.json();

  if (!data.success) {
    return false;
  }

  return data.product;
}

async function updateData() {
  const product = await getProductId(pid, true);
  if (!product) return;

  const imgNavArea = document.querySelector(".image-navigate");
  let imgNavAreaHTML = "";

  for (let i in product.images) {
    const num = parseInt(i)+1;
    imgNavAreaHTML += `<img data-position="${num}" src="${product.images[i]}?tr=h-100,q-80"
    alt="product-image">`;
  }

  imgNavArea.innerHTML = imgNavAreaHTML;

  document.querySelector(".brand-name span").innerText = product.brand;
  document.querySelector(".product-name").innerText = product.name;

  const review = document.querySelector(".reviews");
  let reviewHTML = "";
  for (let i = 0; i < product.stars; i++) {
    reviewHTML += `<img src="/assets/fill-star.png" alt="filled-star">`;
  }

  for (let i = 0; i < 5 - product.stars; i++) {
    reviewHTML += `<img src="/assets/empty-star.png" alt="filled-star">`;
  }
  reviewHTML += `<p class="total-reviews">${product.reviews}</p>`;
  review.innerHTML = reviewHTML;

  document.querySelector(".delivery-date span").innerText = product.delivery;
  document.querySelector(".price").innerHTML = `<small>₹</small>${product.price}`;
  document.querySelector(".description").innerText = product.about;

  const allNavImgs = document.querySelectorAll(".image-navigate img");
  allNavImgs.forEach((img) => {
    img.addEventListener("click", displayImg);
  });

  const nextBtn = document.querySelector(".display-image .right-arrow img");
  nextBtn.addEventListener("click", nextImg);

  const prvBtn = document.querySelector(".display-image .left-arrow img");
  prvBtn.addEventListener("click", prvImg);

  const addToCart = document.querySelector(".cart-adding");
  
  addToCart.addEventListener("click", async () => {
    const qty = document.querySelector(".qty-input span").innerText;
    const token = localStorage.getItem("token");
    if(!token){
      localCartAdd({ id: product._id, qty: parseInt(qty)});
      return;
    }

    let responce = await fetch(
      backend + userCartUpdate + `?token=${token}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: [{ id: product._id, qty: parseInt(qty)}] })
      }
    );

    await responce.json();

    responce = await fetch(backend+getUserDetailsRoute+`?token=${token}`);
    const data = await responce.json();
      if(!data.success) {
        console.log(data.error);
        alert("something went wrong");
        localStorage.removeItem("token");
        location.href = "/login.html";
      }

    const cartCount = document.querySelector(".cart-item-count");
    cartCount.innerText = data?.user?.cart.length;
  })

  document.querySelector(".image-navigate img").click();
  qtyEL();
}
updateData();
