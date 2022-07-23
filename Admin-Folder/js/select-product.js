import {
  addProductRoute,
  backend,
  getProductByIdRoute,
  updateProductRoute,
} from "./env.js";
import("./header.js");

// Images
const ImgsEL = () => {
  const ImgHolder = document.querySelector(".holder.images");
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

// Tags
const TagsEL = () => {
  const TagHolder = document.querySelector(".holder.tags");
  const tagContainer = TagHolder.querySelector(".tag-container");
  const tagAddBtn = TagHolder.querySelector(".tag-add .add");

  const removeTag = (e) => {
    e.currentTarget.parentElement.remove();
  };

  tagAddBtn.addEventListener("click", () => {
    const inputTag = TagHolder.querySelector(".tag-add input");
    if (!inputTag?.value) {
      alert("Input Tag is empty!!");
      return;
    }

    const tagDiv = document.createElement("p");
    tagDiv.setAttribute("class", "tag");
    tagDiv.innerHTML = `${inputTag?.value}<span><img src="./assets/close.png" alt="close-btn"></span>`;

    const closeBtn = tagDiv.querySelector("span");
    closeBtn.addEventListener("click", removeTag);

    tagContainer.appendChild(tagDiv);
    inputTag.value = "";
  });

  const closeBtnTag = tagContainer.querySelectorAll(".tag span");
  closeBtnTag.forEach((btn) => btn.addEventListener("click", removeTag));
};

// delivery
const DeliveryEL = () => {
  const deliveryHolder = document.querySelector(".holder.delivery");
  const deliveryContainer = deliveryHolder.querySelector(".card-container");
  const deliveryAddBtn = deliveryHolder.querySelector(".card-add .add");

  const removeDelivery = (e) => {
    e.currentTarget.parentElement.remove();
  };

  deliveryAddBtn.addEventListener("click", () => {
    const inputCity = deliveryHolder.querySelector(".card-add input.city");
    const inputTime = deliveryHolder.querySelector(".card-add input.time");
    if (!inputCity?.value) {
      alert("Input City is empty!!");
      return;
    }

    if (!inputTime?.value) {
      alert("Input Time is empty!!");
      return;
    }

    let city = inputCity.value.toLowerCase();
    city = city.charAt(0).toUpperCase() + city.slice(1);

    const entryDiv = document.createElement("div");
    entryDiv.setAttribute("class", "entry");
    entryDiv.innerHTML = `  <div class="text city">City: <span>${city}</span></div>
    <div class="text time">Time: <span>${inputTime.value} Days</span></div>
    <button class="close"><img src="./assets/close.png" alt=""></button>`;

    const closeBtn = entryDiv.querySelector(".close");
    closeBtn.addEventListener("click", removeDelivery);

    deliveryContainer.appendChild(entryDiv);
    inputCity.value = "";
    inputTime.value = "";
  });

  const closeBtnDelivery = deliveryHolder.querySelectorAll(".close");
  closeBtnDelivery.forEach((btn) =>
    btn.addEventListener("click", removeDelivery)
  );
};

// Prepopulate Info
async function populateInfo(pid) {
  // do something
  const token = localStorage.getItem("token");
  const responce = await fetch(
    backend + getProductByIdRoute + `?token=${token}&pid=${pid}`
  );
  const data = await responce.json();

  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  const product = data.product;

  document.querySelector(".info #brand").value = product.brand;
  document.querySelector(".info #name").value = product.name;
  document.querySelector(".info #stars").value = product.stars;
  document.querySelector(".info #review").value = product.reviews;
  document.querySelector(".info #price").value = product.price;

  // images
  const imgs = document.querySelector(".images .input-container");
  if (product.images.length > 0) {
    imgs.innerHTML = "";
  }
  for (let i of product.images) {
    imgs.innerHTML += `<div class="input"><input type="text" placeholder="ImageKit Link" value="${i}"><img src="./assets/close.png" alt="close-btn"></div>`;
  }

  // tags
  const tags = document.querySelector(".tags .tag-container");
  for (let i of product.tags) {
    tags.innerHTML += `<p class="tag">${i}<span><img src="./assets/close.png" alt="close-btn"></span></p>`;
  }

  // delivery
  const delivery = document.querySelector(".delivery .card-container");
  // product.delivery = { mumbai: "10", delhi: "20" };
  for (let i of Object.keys(product.delivery || [])) {
    delivery.innerHTML += `<div class="entry"> <div class="text city">City: <span>${i}</span></div>
    <div class="text time">Time: <span>${product.delivery[i]} Days</span></div>
    <button class="close"><img src="./assets/close.png" alt=""></button></div>`;
  }

  // about
  document.querySelector(".about textarea").value = product.about;

  ImgsEL();
  TagsEL();
  DeliveryEL();
}

// Actual Code
const pid = location.href.split("pid=")[1];
const saveBtn = document.querySelector(".save");
if (!pid) {
  saveBtn.innerText = "Add New";
  ImgsEL();
  TagsEL();
  DeliveryEL();
} else {
  populateInfo(pid);
}

saveBtn.addEventListener("click", () => {
  if (pid) updateData();
  else saveData();
});

function getFieldsData() {
  const responce = {};
  // info
  responce.brand = document.querySelector(".info #brand").value;
  responce.name = document.querySelector(".info #name").value;
  responce.stars = parseInt(document.querySelector(".info #stars").value || 0);
  responce.reviews = parseInt(
    document.querySelector(".info #review").value || 0
  );
  responce.price = parseInt(document.querySelector(".info #price").value);

  document.querySelector(".info #brand").value = "";

  if (!responce.brand) {
    alert("Input Brand is empty");
    return false;
  }

  if (!responce.name) {
    alert("Input Name is empty");
    return false;
  }

  if (!responce.price) {
    alert("Input Price is empty");
    return false;
  }

  // Images
  const imgs = document.querySelectorAll(".images .input-container input");
  responce.images = [];
  for (let img of imgs) {
    if (!img.value) continue;
    responce.images.push(img.value);
  }

  // Tags
  const tags = document.querySelectorAll(".tags .tag-container .tag");
  responce.tags = [];
  for (let tag of tags) {
    responce.tags.push(tag.innerText);
  }

  // Delivery
  const delivery = document.querySelectorAll(
    ".delivery .card-container .entry"
  );
  responce.delivery = {};
  for (let entry of delivery) {
    const city = entry.querySelector(".text.city span").innerText;
    const time = entry.querySelector(".text.time span").innerText;
    responce.delivery[city.toLowerCase()] = parseInt(time.split(" ")[0]);
  }

  // About
  responce.about = document.querySelector(".about textarea").value;

  return responce;
}

async function saveData() {
  const fieldData = getFieldsData();
  if (!fieldData) return;
  const token = localStorage.getItem("token");
  const responce = await fetch(backend + addProductRoute + `?token=${token}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brand: fieldData.brand,
      name: fieldData.name,
      stars: fieldData.stars,
      reviews: fieldData.reviews,
      images: fieldData.images,
      about: fieldData.about,
      tags: fieldData.tags,
      delivery: fieldData.delivery,
      price: fieldData.price,
    }),
  });
  const data = await responce.json();
  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  location.href = "/product.html";
}

async function updateData() {
  const fieldData = getFieldsData();
  if (!fieldData) return;
  const token = localStorage.getItem("token");
  const responce = await fetch(
    backend + updateProductRoute + `?token=${token}&pid=${pid}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand: fieldData.brand,
        name: fieldData.name,
        stars: fieldData.stars,
        reviews: fieldData.reviews,
        images: fieldData.images,
        about: fieldData.about,
        tags: fieldData.tags,
        delivery: fieldData.delivery,
        price: fieldData.price,
      }),
    }
  );
  const data = await responce.json();
  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  location.href = "/product.html";
}
