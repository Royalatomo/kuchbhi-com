import("./component/header.js");
import { localCartAdd } from "./component/cart.js";
import { backend, getProductBySearchRoute, getUserDetailsRoute, userCartUpdate } from "./env.js";

function removeActiveDropMenu() {
  const selectContainers = document.querySelectorAll(".options.visible");
  selectContainers.forEach((options) => {
    options.classList.remove("visible");
  });
}

function dropDownEL() {
  const selectContainers = document.querySelectorAll(".select-container");
  selectContainers.forEach((select) => {
    select.addEventListener("click", (e) => {
      const targetClass = e.target.classList;
      if (
        targetClass.contains("options") ||
        targetClass.contains("select-option")
      )
        return;
      const options = select.querySelector(".options");
      if (
        e.currentTarget.id === e.target.id &&
        options.classList.contains("visible")
      ) {
        removeActiveDropMenu();
        return;
      }
      removeActiveDropMenu();
      const optionArea = select.querySelector("p span");
      options.classList.add("visible");

      const optionsItems = options.querySelectorAll("div");
      optionsItems.forEach((item) => {
        item.addEventListener("click", () => {
          optionArea.innerText = item.innerText;
          optionArea.dataset.value = item.dataset.value;
          removeActiveDropMenu();
        });
      });
    });
  });
}
dropDownEL();

let pageSize = 4;
let page = 1;

const link = window.location.href;
const querry = link.split("?q=")[1]?.replace("+", " ");
document.querySelector(".header-searchbox input").value = querry;

const addToCart = async (id) => {
  localCartAdd({ id, qty: 1 });

  const token = localStorage.getItem("token");
  if(token) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if(cart && cart.length>0) {
      const body = [];
      for(let i of cart) {
        body.push({id: i.id, qty: i.qty});
      }

      let responce = await fetch(backend+userCartUpdate+`?token=${token}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: body }),
      })

      await responce.json();
      localStorage.removeItem("cart");

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
    }
  }
};

async function getProducts() {
  let searchQuery = "?";
  searchQuery += `q=${querry}`;
  if (localStorage.getItem("token")) {
    searchQuery += `&token=${localStorage.getItem("token")}`;
  }

  searchQuery += `&page=${page}`;
  searchQuery += `&pagesize=${pageSize}`;

  const delivery = document.querySelector(".filters #delivery span").dataset
    .value;
  if (delivery !== "30+") {
    searchQuery += `&delivery=${parseInt(delivery)}`;
  }

  const brand = document.querySelector(".filters #brand span").dataset.value;
  if (brand !== "all") {
    console.log(brand);
    searchQuery += `&brand=${brand}`;
  }

  const sort = document.querySelector(".filters #sort span").dataset.value;
  if (sort === "rhl") {
    searchQuery += `&rating=htl`;
  } else if (sort === "rlh") {
    searchQuery += `&rating=lth`;
  } else if (sort === "phl") {
    searchQuery += `&price=htl`;
  } else if (sort === "plh") {
    searchQuery += `&price=lth`;
  }

  const responce = await fetch(backend + getProductBySearchRoute + searchQuery);
  const data = await responce.json();

  if (!data.success) {
    if (data.error.code === 13) {
      document.querySelector(".results").innerHTML = "";
      return;
    }
    alert("something went wrong");
    console.log(data.error);
    return;
  }
  document.querySelector(".results").innerHTML = "";
  for (let i of data.products) {
    let reviewHTML = "";
    for (let x = 0; x < i.stars; x++) {
      reviewHTML += `<img src="/assets/fill-star.png" alt="filled-star">`;
    }

    for (let x = 0; x < 5 - i.stars; x++) {
      reviewHTML += `<img src="/assets/empty-star.png" alt="filled-star">`;
    }

    const product = document.createElement("div");
    product.setAttribute("class", "product");
    const img =
      i.images[0] ||
      "https://ik.imagekit.io/imdfhuoko/62bb2054b5a19e7ad70393bb-0_hIsXL87i0.jpg";
    product.innerHTML += `<a href="/product.html?pid=${i._id}">
      <div class="product-head">
          <img src="${img + "?tr=h-200,q-80"}" alt="product-image">
          <p class="delivery-time">${i.delivery} Days</p>
      </div>

      <div class="product-body">
          <p class="brand">${i.brand}</p>
          <p class="product-name">${i.name}</p>
          <div class="reviews">
              ${reviewHTML}
              <p class="total-reviews">${i.reviews}</p>
          </div>
      </div>
    </a>

    <div class="product-foot">
      <p class="price"><span>₹</span>${i.price}</p>
      <img src="/assets/cart.png" alt="cart">
    </div>`;

    const cart = product.querySelector(".product-foot img");
    cart.addEventListener("click", () => {
      addToCart(i._id);
    });
    document.querySelector(".results").appendChild(product);
  }

  navigation(data.currentPage, data.totalPages);
}

getProducts();

const filters = document.querySelectorAll(
  ".filters .select-container .options div"
);
filters.forEach((fil) => {
  fil.addEventListener("click", () => {
    setTimeout(() => {
      getProducts();
    }, 0);
  });
});

function navigation(currentPage, totalPage) {
  `<img src="/assets/arrow.png" alt="left-arrow" class="left-arrow">
        <span class="number active">1</span>
        <span class="number">2</span>
        <span class="number">3</span>
        <div class="more">...</div>
        <div class="number last">7</div>
        <img src="/assets/arrow.png" alt="right-arrow" class="right-arrow"></img>`;

  const nav = document.querySelector(".page-navigation");
  nav.innerHTML = `<img src="/assets/arrow.png" alt="left-arrow" class="left-arrow">`;
  for (let i = 1; i <= totalPage; i++) {
    if (i === totalPage) {
      if (i === page) {
        console.log(page);
        nav.innerHTML += `<span class="number active last">${i}</span>`;
        continue;
      }
      nav.innerHTML += `<span class="number last">${i}</span>`;
      continue;
    }

    if (i === page) {
      nav.innerHTML += `<span class="number active">${i}</span>`;
      continue;
    }

    nav.innerHTML += `<span class="number">${i}</span>`;
  }
  nav.innerHTML += `<img src="/assets/arrow.png" alt="right-arrow" class="right-arrow">`;

  const numbers = nav.querySelectorAll(".number");
  numbers.forEach((num) => {
    num.addEventListener("click", (e) => {
      page = parseInt(num.innerText);
      getProducts();
    });
  });

  const leftArr = nav.querySelector(".left-arrow");
  leftArr.addEventListener("click", () => {
    if (page === 1) {
      return;
    }
    page -= 1;
    getProducts();
  });

  const rightArr = nav.querySelector(".right-arrow");
  rightArr.addEventListener("click", () => {
    if (page === totalPage) {
      return;
    }
    page += 1;
    getProducts();
  });
}
