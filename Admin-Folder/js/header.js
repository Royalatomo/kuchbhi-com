import { backend, getUserByIdRoute, logoutRoute } from "./env.js";

async function validate() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }
  const userResponce = await fetch(
    backend + getUserByIdRoute + `?token=${token}&uid=${localStorage.getItem("userId")}`
  );
  const userData = await userResponce.json();

  if (!userData.success) {
    if (userData.error.code === 11) {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      location.href = "/login.html";
    }
  }
}

if (!(location.pathname === "/login.html"))  {
  validate();
}

function activateMobEventListner() {
  const hamburgerBtn = document.querySelector(".header .ham-icon");
  const MobMenu = document.querySelector(".header .hamburger-options");
  const closeMobMenu = MobMenu.querySelector(".close-btn");

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
}

activateMobEventListner();

const logout = async () => {
  const url = backend + logoutRoute;
  const responce = await fetch(url + `?token=${token}`, { method: "POST" });
  const data = await responce.json();

  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  localStorage.removeItem("userId");
  localStorage.removeItem("token");
  location.href = "/login.html";
};

const logoutBtn = document.querySelector(".container .logout");
logoutBtn.addEventListener("click", logout);
