import { backend, getUserDetailsRoute, userCartUpdate } from "../env.js";

function activateMobEventListner() {
  const hamburgerBtn = document.querySelector(".header .ham-icon");
  const MobMenu = document.querySelector(".header .hamburger-options");
  const closeMobMenu = MobMenu.querySelector(".close-btn");
  const search = document.querySelector(".header-searchbox img");

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
      MobMenu.classList.add("active");
    });
  }

  if (closeMobMenu) {
    const menuItems = MobMenu.querySelectorAll("li");

    for (let menuBtn of menuItems) {
      menuBtn.addEventListener("click", () => {
        MobMenu.classList.remove("active");
      });
    }
  }

  if(search) {
    search.addEventListener("click", () => {
      const query = document.querySelector(".header-searchbox input")?.value;
      location.href = "/search.html"+`?q=${query}`;
    })
  }
}

activateMobEventListner();


async function headerUpdate() {
  const token = localStorage.getItem("token");
  const headerLocation = document.querySelector(".header-location a");
  const headerOrders = document.querySelector(".header-orders");

  const homeChangeBtn = document.querySelector(".mob-change-add");
  const homeOrders = document.querySelector(".mob-orders");
  
  if(!token) {
    headerLocation.parentElement.remove();
    headerOrders.setAttribute("href", "/login.html");
    headerOrders.innerText = "Login";
    homeChangeBtn.remove();
    homeOrders.innerText = "Login"
    homeOrders.setAttribute("href", "/login.html");

    const cartCount = document.querySelector(".cart-item-count");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cartCount.innerText = cart.length;
  }else {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if(cart && cart.length>0) {
      const body = [];
      for(let i of cart) {
        body.push({id: i.id, qty: i.qty});
      }

      const responce = await fetch(backend+userCartUpdate+`?token=${token}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: body }),
      })

      await responce.json();
      localStorage.removeItem("cart");
    }

    const responce = await fetch(backend+getUserDetailsRoute+`?token=${token}`);
    const data = await responce.json();
  
      if(!data.success) {
        console.log(data.error);
        alert("something went wrong");
        localStorage.removeItem("token");
        location.href = "/login.html";
      }

    const cartCount = document.querySelector(".cart-item-count");
    cartCount.innerText = data?.user?.cart.length;

    const locationText = document.querySelector(".header-location--text");
    const name = data.user.fullName.length>10?data.user.fullName.slice(0, 10)+"...":data.user.fullName;
    locationText.innerHTML = `Hello, ${name} <br> <strong>Change Address</strong>`;
  }

}

headerUpdate();