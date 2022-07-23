import {
  backend,
  getOtherDataRoute,
  getProductByIdRoute,
  getProductBySearchRoute,
  getRecentlyViewed,
} from "./env.js";
import("./component/header.js");

// populate Main-Carousel
async function populateMainCarousel() {
  const slider = document.querySelector(".slider");
  const responce = await fetch(backend + getOtherDataRoute);
  const data = await responce.json();

  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    slider.remove();
    return;
  }

  const imgs = data.other.mainCarousel;
  if (!imgs || imgs.length < 1) {
    slider.remove();
    return;
  }

  const sliderImgs = slider.querySelector(".slider-images");
  for (let i = 0; i < imgs.length; i++) {
    sliderImgs.innerHTML += `<img ${i === 0 ? 'class="active"' : ""} src="${
      imgs[i]
    }?tr=h-600" alt="Image">`;
  }

  sliderBtnEventListner();
}

// Slider
function slideRight() {
  const sliderImgs = document.querySelectorAll(".slider .slider-images img");
  for (let i = 0; i < sliderImgs.length; i++) {
    if (sliderImgs[i].classList.contains("active")) {
      sliderImgs[i].classList.remove("active");

      if (i + 1 === sliderImgs.length) {
        const firstImg = sliderImgs[0];
        firstImg.classList.add("active");
        break;
      }

      sliderImgs[i + 1].classList.add("active");
      break;
    }
  }
}

function slideLeft() {
  const sliderImgs = document.querySelectorAll(".slider .slider-images img");
  for (let i = 0; i < sliderImgs.length; i++) {
    if (sliderImgs[i].classList.contains("active")) {
      sliderImgs[i].classList.remove("active");
      if (i === 0) {
        const lastImg = sliderImgs[sliderImgs.length - 1];
        lastImg.classList.add("active");
        break;
      }

      sliderImgs[i - 1].classList.add("active");
      break;
    }
  }
}

function sliderBtnEventListner() {
  const leftArrow = document.querySelector(".slider .left-arrow");
  const rightArrow = document.querySelector(".slider .right-arrow");

  leftArrow.addEventListener("click", slideLeft);
  rightArrow.addEventListener("click", slideRight);
}

// sliderBtnEventListner();
populateMainCarousel();

const main = document.querySelector("main");

// Products Carousel
let pageSize = 0;
if (window.innerWidth > 1100) {
  pageSize = 4;
} else if (window.innerWidth < 1100 && window.innerWidth > 770) {
  pageSize = 2;
} else {
  pageSize = 1;
}

async function getProductId(pid, useToken = false) {
  const token = localStorage.getItem("token");
  const options = token && useToken ? `?token=${token}&pid=${pid}` : `?pid=${pid}`;
  const responce = await fetch(backend + getProductByIdRoute + options);
  const data = await responce.json();

  if (!data.success) {
    return false;
  }

  return data.product;
}

async function leftClick(e, name = "") {
  const section = e.currentTarget.parentElement;
  if (section.dataset.query === "recent") {
    section.dataset.page = parseInt(section.dataset.page) - 1;
    document.querySelector(".products.recently-viewed .products-items").innerHTML= "";
    populateRecent(section.dataset.page);
    return;
  }

  section.dataset.page = parseInt(section.dataset.page) - 1;
  populateProucts(name.replace(" ", "-"), section.dataset.query, parseInt(section.dataset.page));
}

async function rightClick(e, name = "") {
  const section = e.currentTarget.parentElement;
  if (section.dataset.query === "recent") {
    section.dataset.page = parseInt(section.dataset.page) + 1;
    document.querySelector(".products.recently-viewed .products-items").innerHTML= "";
    populateRecent(section.dataset.page);
    return;
  }

  section.dataset.page = parseInt(section.dataset.page) + 1;

  populateProucts(
    name.replace(" ", "-"),
    section.dataset.query,
    parseInt(section.dataset.page)
  );
}

async function populateRecent(page) {
  const token = localStorage.getItem("token");
  if(!token) return;
  const query = token ? `?token=${token}&` : "?";
  const responce = await fetch(
    backend + getRecentlyViewed + `${query}page=${page}&pagesize=${pageSize}`
  );
  const data = await responce.json();
  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  if (data?.products.length < 1) return;
  let productHtml = "";


  for (let i of data.products) {
    const product = await getProductId(i);
    if (!product) continue;
    const img =
      product.images[0] ||
      "https://ik.imagekit.io/imdfhuoko/62bb2054b5a19e7ad70393bb-0_hIsXL87i0.jpg";
    productHtml += `<a href="/product.html?pid=${product._id}">
      <div class="products-items--box">
        <div class="product-head">
          <img src="${img + "?tr=h-250"}" alt="product-img">
          <p class="price-tag"><small>₹</small>${product.price}</p>
        </div>
        <p class="product-name">${product.name}</p>
      </div>
    </a>`;
  }

  const existingElem = document.querySelector(
    `.products.recently-viewed .products-items`
  );

  if (existingElem) {
    const leftElem = existingElem.parentElement.querySelector(".left-arrow");
    const rightElem = existingElem.parentElement.querySelector(".right-arrow");
    if (data.currentPage > 1) {
      leftElem.classList.remove("disable");
    } else {
      leftElem.classList.add("disable");
    }

    if (data.currentPage < data.totalPages) {
      rightElem.classList.remove("disable");
    } else {
      rightElem.classList.add("disable");
    }
    existingElem.innerHTML += `${productHtml}`;
    return;
  }

  const recentlyViewed = document.querySelector(".products.recently-viewed") || document.createElement("section");
  recentlyViewed.setAttribute("class", `products recently-viewed`);
  recentlyViewed.setAttribute("data-page", "1");
  recentlyViewed.setAttribute("data-query", "recent");
  recentlyViewed.innerHTML += `<h3 class="products-heading">Recently Viewed</h3>`;
  recentlyViewed.innerHTML += `<div class="left-arrow arrow disable"><img src="/assets/arrow.png" alt="left-arrow"></div><div class="right-arrow arrow ${
    data.currentPage === data.totalPages ? "disable" : ""
  }"><img src="/assets/arrow.png" alt="left-arrow"></div>`;
  recentlyViewed.innerHTML += `<div class="products-items">${productHtml}</div>`;

  recentlyViewed
    .querySelector(".left-arrow")
    .addEventListener("click", leftClick);
  recentlyViewed
    .querySelector(".right-arrow")
    .addEventListener("click", rightClick);
  main.appendChild(recentlyViewed);
}

async function populateProucts(name, query, page) {
  const token = localStorage.getItem("token");
  const para = token ? `?token=${token}&` : "?";
  const link = backend + getProductBySearchRoute + `${para}q=${query}&page=${page}&pagesize=${pageSize}`;
  const responce = await fetch(link);
  const data = await responce.json();
  if (!data.success) {
    return;
  }
  if (data?.products.length < 1) return;
  let productHtml = "";

  for (let i of data.products) {
    if (!i) continue;
    const img =
      i.images[0] ||
      "https://ik.imagekit.io/imdfhuoko/62bb2054b5a19e7ad70393bb-0_hIsXL87i0.jpg";
    productHtml += `<a href="/product.html?pid=${i._id}">
      <div class="products-items--box">
        <div class="product-head">
          <img src="${img + "?tr=h-250"}" alt="product-img">
          <p class="price-tag"><small>₹</small>${i.price}</p>
        </div>
        <p class="product-name">${i.name}</p>
      </div>
    </a>`;
  }

  const existingElem = document.querySelector(
    `.products.${name.replace(" ", "-")} .products-items`
  );

  if (existingElem) {
    const leftElem = existingElem.parentElement.querySelector(".left-arrow");
    const rightElem = existingElem.parentElement.querySelector(".right-arrow");
    if (data.currentPage > 1) {
      leftElem.classList.remove("disable");
    } else {
      leftElem.classList.add("disable");
    }

    if (data.currentPage < data.totalPages) {
      rightElem.classList.remove("disable");
    } else {
      rightElem.classList.add("disable");
    }
    existingElem.innerHTML = `${productHtml}`;
    return;
  }

  const recentlyViewed = document.createElement("section");
  recentlyViewed.setAttribute("class", `products ${name.replace(" ", "-")}`);
  recentlyViewed.setAttribute("data-page", "1");
  recentlyViewed.setAttribute("data-query", query);
  recentlyViewed.innerHTML += `<h3 class="products-heading">${name}</h3>`;
  recentlyViewed.innerHTML += `<div class="left-arrow arrow disable"><img src="/assets/arrow.png" alt="left-arrow"></div><div class="right-arrow arrow ${
    data.currentPage === data.totalPages ? "disable" : ""
  }"><img src="/assets/arrow.png" alt="left-arrow"></div>`;
  recentlyViewed.innerHTML += `<div class="products-items">${productHtml}</div>`;

  recentlyViewed
    .querySelector(".left-arrow")
    .addEventListener("click", (e) => leftClick(e, name));
  recentlyViewed
    .querySelector(".right-arrow")
    .addEventListener("click", (e) => rightClick(e, name));
  main.appendChild(recentlyViewed);
}

async function populate() {
  const responce = await fetch(backend + getOtherDataRoute);
  const data = await responce.json();

  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  const homeCat = data.other.homeCat;
  await categories();
  await populateRecent(1);
  for (let i of homeCat) {
    await populateProucts(i.name, i.query, 1);
  }
}

async function categories() {
  const section = document.querySelector(".products.categories");
  const responce = await fetch(backend + getOtherDataRoute);
  const data = await responce.json();

  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    section.remove();
    return;
  }

  const cat = data.other.categories;
  if (cat.length < 1) {
    section.remove();
    return;
  }

  const catItems = section.querySelector(".categories-items");
  let html = "";
  for (let i of cat) {
    html += `<div style="background-image: url('${i.img}');" class="item--box">
      <a href="/search.html?q=${i.query}">
        <h4>${i.name}</h4>
      </a>
    </div>`;
  }

  catItems.innerHTML = html;
}
populate();
