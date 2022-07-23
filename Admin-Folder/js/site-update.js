import { backend, getOtherDataRoute, updateOtherDataRoute } from "./env.js";
import("./header.js");

// main-display
const ImgsEL = () => {
  const ImgHolder = document.querySelector(".holder.main-display");
  const inputContainer = ImgHolder.querySelector(".input-container");
  const imgAddBtn = ImgHolder.querySelector(".add");

  const removeInput = (e) => {
    const inputs = inputContainer.querySelectorAll(".input");
    if (inputs.length === 1) return;
    const parent = e.currentTarget.parentElement;
    parent.remove();
  };

  imgAddBtn.addEventListener("click", () => {
    const inputDiv = document.createElement("div");
    inputDiv.setAttribute("class", "input");
    inputDiv.innerHTML = `<input type="text" placeholder="ImageKit Link"><img src="./assets/close.png" alt="close-btn">`;

    const closeBtn = inputDiv.querySelector("img");
    closeBtn.addEventListener("click", removeInput);
    inputContainer.appendChild(inputDiv);
  });

  const closeBtn = inputContainer.querySelectorAll(".input img");
  closeBtn.forEach((btn) => btn.addEventListener("click", removeInput));
};

// products-display
const ProductDisplayEL = () => {
  const displayHolder = document.querySelector(".holder.products-display");
  const displayContainer = displayHolder.querySelector(".card-container");
  const displayAddBtn = displayHolder.querySelector(".card-add .add");

  const removeDelivery = (e) => {
    e.currentTarget.parentElement.remove();
  };

  displayAddBtn.addEventListener("click", () => {
    const inputTitle = displayHolder.querySelector(".card-add input.title");
    const inputQuery = displayHolder.querySelector(".card-add input.query");
    if (!inputTitle?.value) {
      alert("Input Title is empty!!");
      return;
    }

    if (!inputQuery?.value) {
      alert("Input Query is empty!!");
      return;
    }

    const entryDiv = document.createElement("div");
    entryDiv.setAttribute("class", "entry");
    entryDiv.innerHTML = `<div class="text name">Name: <span>${inputTitle.value}</span></div>
    <div class="text query">Query: <span>${inputQuery.value}</span></div>
    <button class="close"><img src="./assets/close.png" alt=""></button>`;

    const closeBtn = entryDiv.querySelector(".close");
    closeBtn.addEventListener("click", removeDelivery);

    displayContainer.appendChild(entryDiv);
    inputTitle.value = "";
    inputQuery.value = "";
  });

  const closeBtnDelivery = displayHolder.querySelectorAll(".close");
  closeBtnDelivery.forEach((btn) =>
    btn.addEventListener("click", removeDelivery)
  );
};

// categories
const CategoriesEL = () => {
  const catHolder = document.querySelector(".holder.categories");
  const catContainer = catHolder.querySelector(".card-container");
  const catAddBtn = catHolder.querySelector(".card-add .add");

  const removeDelivery = (e) => {
    e.currentTarget.parentElement.remove();
  };

  catAddBtn.addEventListener("click", () => {
    const inputCat = catHolder.querySelector(".card-add input.cat");
    const inputQuery = catHolder.querySelector(".card-add input.query");
    const inputImg = catHolder.querySelector(".card-add input.img");

    if (!inputCat?.value) {
      alert("Input Category is empty!!");
      return;
    }

    if (!inputQuery?.value) {
      alert("Input Query is empty!!");
      return;
    }

    if (!inputImg?.value) {
      alert("Input Img is empty!!");
      return;
    }

    const entryDiv = document.createElement("div");
    entryDiv.setAttribute("class", "entry");
    entryDiv.innerHTML = `<div class="text cat">Cat: <span>${inputCat.value}</span></div>
    <div class="text query">Query: <span>${inputQuery.value}</span></div>
    <div class="text img">Img: <span>${inputImg.value}</span></div>
    <button class="close"><img src="./assets/close.png" alt=""></button>`;

    const closeBtn = entryDiv.querySelector(".close");
    closeBtn.addEventListener("click", removeDelivery);

    catContainer.appendChild(entryDiv);
    inputCat.value = "";
    inputQuery.value = "";
    inputImg.value = "";
  });

  const closeBtnDelivery = catHolder.querySelectorAll(".close");
  closeBtnDelivery.forEach((btn) =>
    btn.addEventListener("click", removeDelivery)
  );
};

async function populateInfo() {
  // do something
  const token = localStorage.getItem("token");
  const responce = await fetch(backend + getOtherDataRoute);
  const data = await responce.json();

  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  const other = data.other;

  // main-display
  const mainDisplay = document.querySelector(".main-display .input-container");
  if (other.mainCarousel.length > 0) {
    mainDisplay.innerHTML = "";
  }
  for (let i of other.mainCarousel) {
    mainDisplay.innerHTML += `<div class="input"><input type="text" placeholder="ImageKit Link" value="${i}"><img src="./assets/close.png" alt="close-btn"></div>`;
  }

  // products-display
  const productDisplay = document.querySelector(
    ".products-display .card-container"
  );
  for (let i of other.homeCat) {
    productDisplay.innerHTML += `<div class="entry"><div class="text name">Name: <span>${i.name}</span></div>
    <div class="text query">Query: <span>${i.query}</span></div>
    <button class="close"><img src="./assets/close.png" alt=""></button></div>`;
  }

  // categories
  const categories = document.querySelector(".categories .card-container");
  for (let i of other.categories) {
    categories.innerHTML += `<div class="entry"><div class="text cat">Cat: <span>${i.name}</span></div>
    <div class="text query">Query: <span>${i.query}</span></div>
    <div class="text img">Img: <span>${i.img}</span></div>
    <button class="close"><img src="./assets/close.png" alt=""></button></div>`;
  }

  ImgsEL();
  ProductDisplayEL();
  CategoriesEL();
}

function getFieldsData() {
  const responce = {};

  // Main-Display
  const mainDisplay = document.querySelectorAll(
    ".main-display .input-container input"
  );
  responce.mainCarousel = [];
  for (let i of mainDisplay) {
    if (!i.value) continue;
    responce.mainCarousel.push(i.value);
  }

  // Products-Display
  const productsDispaly = document.querySelectorAll(
    ".products-display .card-container .entry"
  );
  responce.homeCat = [];
  for (let i of productsDispaly) {
    const name = i.querySelector(".name span").innerText;
    const query = i.querySelector(".query span").innerText;
    responce.homeCat.push({ name, query });
  }

  console.log(responce);

  const categories = document.querySelectorAll(
    ".categories .card-container .entry"
  );
  responce.categories = [];
  for (let i of categories) {
    const name = i.querySelector(".cat span").innerText;
    const query = i.querySelector(".query span").innerText;
    const img = i.querySelector(".img span").innerText;
    responce.categories.push({ name, query, img });
  }

  return responce;
}

populateInfo();

const updateData = async () => {
  const fieldData = getFieldsData();
  console.log(fieldData);
  if (!fieldData) return;
  const token = localStorage.getItem("token");
  const responce = await fetch(
    backend + updateOtherDataRoute + `?token=${token}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        homeCat: fieldData.homeCat,
        mainCarousel: fieldData.mainCarousel,
        categories: fieldData.categories
      }),
    }
  );
  const data = await responce.json();
  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  location.href = "/site-update.html";
};

const saveBtn = document.querySelector(".save");
saveBtn.addEventListener("click", updateData);

