import { backend, delProductRoute, getProductsRoute } from "./env.js";
import("./header.js");

let PAGE_SIZE = 6;
let PAGE = 1;

const getProducts = async (size, page) => {
  const token = localStorage.getItem("token");
  const responce = await fetch(
    backend + getProductsRoute + `?token=${token}&page=${page}&pagesize=${size}`
  );
  const data = await responce.json();
  if (!data.success) {
    return false;
  }

  return {
    products: data.products,
    currentPage: data.currentPage,
    totalPages: data.totalPages,
  };
};

function productHtml(pid, img, brand, name, stars, reviews, price) {
  let starHtml = "";

  const count = stars < 5 ? stars : 5;
  for (let i = 0; i < count; i++) {
    starHtml += `<img src="/assets/fill-star.png" alt="filled-star">`;
  }

  if (5 - count !== 0) {
    for (let i = 0; i < 5 - count; i++) {
      starHtml += `<img src="/assets/empty-star.png" alt="empty-star">`;
    }
  }

  const product = document.createElement("div");
  product.setAttribute("class", "product");
  product.setAttribute("id", pid);

  product.innerHTML += `<img class="product-img" src="${img}?tr=h-170,w-250" alt="product-image">`;
  product.innerHTML += `<div class="product-info">
  <p class="brand">Brand: <span>${brand}</span></p>
  <p class="product-name">${name}</p>
  <div class="reviews">${starHtml}<p class="total-reviews">${reviews}</p>
  </div>
  <p class="price"><small>₹</small>${price}</p>
  </div>`;
  product.innerHTML += `<div class="action-btns">
  <a href="/select-product.html?pid=${pid}" target="_blank" class="edit"><img src="./assets/edit.png" alt="edit"></a>
  <button class="close" data-pid="${pid}" ><img src="./assets/close.png" alt="close"></button>
</div>`;

  product.querySelector(".close").addEventListener("click", deleteProduct);
  return product;
}

async function deleteProduct(e) {
  const pid = e.currentTarget.dataset.pid;
  const token = localStorage.getItem("token");
  const confirm = window.confirm("Are you sure to delete it?");
  if (!confirm) return;

  const responce = await fetch(backend+delProductRoute+`?token=${token}&pid=${pid}`, {method: "DELETE"});
  const data = await responce.json();
  if(!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  const loadmore = document.querySelector(".loadmore.active");
  const parent = document.getElementById(pid);
  const productsContainer = parent.parentElement;
  if (productsContainer.childElementCount === 1 && !loadmore) {
    productsContainer.innerHTML = "<h1>No Products Found</h1>";
    return;
  }
  parent.remove()

}

async function populateProducts(initial=false) {
  const main = document.querySelector("main .products-container");
  const data = await getProducts(PAGE_SIZE, PAGE);
  if(!data) {
    if(!initial){
      return;
    }

    main.innerHTML = "<h1>No Product Found</h1>"
  };
  if (data.currentPage < data.totalPages) {
    const loadMore = document.querySelector("main .loadmore");
    loadMore.classList.add("active");
  }else{
    loadMore.classList.remove("active");
  }

  for (let p of data.products) {
    const img =
      p.images.length > 0
        ? p.images[0]
        : "https://ik.imagekit.io/imdfhuoko/62bb2054b5a19e7ad70393bb-0_hIsXL87i0.jpg";
    const html = productHtml(
      p._id,
      img,
      p.brand,
      p.name,
      p.stars,
      p.reviews,
      p.price
    );
    main.appendChild(html);
  }
}

const loadMore = document.querySelector("main .loadmore");
loadMore.addEventListener("click", () => {
  PAGE += 1;
  populateProducts();
});

populateProducts(true);
