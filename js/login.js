import { backend, checkoutRoute, loginRoute } from "./env.js";

const link = window.location.href;
const querry = link.split("?checkout=")[1]?.replace("+", " ");

const showBtn = document.querySelector(".container .inputs span");
showBtn.addEventListener("click", (e) => {
  const parent = e.currentTarget.parentElement;
  const input = parent.querySelector("input");
  if (!input) return;
  if (input.type === "password") {
    e.currentTarget.innerText = "Hide";
    input.type = "text";
    return;
  }

  e.currentTarget.innerText = "Show";
  input.type = "password";
});

const email = document.querySelector(".inputs input#email");
const pass = document.querySelector(".inputs input#password");
const error = document.querySelector(".inputs p#error");
[email, pass].forEach((input) => {
  input.addEventListener("input", () => (error.innerText = ""));
});

const registerUser = async (e) => {
  e.preventDefault();
  if (!email?.value) {
    error.innerText = "No email id is given";
    return;
  }

  if (!pass?.value) {
    error.innerText = "No password is given";
    return;
  }

  const url = backend + loginRoute;
  const responce = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.value, pass: pass.value }),
  });
  const data = await responce.json();

  if (!data.success) {
    error.innerText = data.error.msg;
    return;
  }

  console.log(data);
  if (data.admin) {
    error.innerText = "No email found";
    return;
  }

  localStorage.setItem("userId", data.userId);
  localStorage.setItem("token", data.token);

  if (querry === "true") {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("something went wrong");
      location.href = "/";
    }

    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");

    if(!cartItems.length<1) {
      const responce = await fetch(backend + checkoutRoute + `?token=${token}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orders: cartItems}),
      });
  
      const data = await responce.json();
      if (!data.success) {
        alert("something went wrong");
        console.log(data.error);
        return;
      }
    }

    localStorage.removeItem("cart");
    location.href = "/thanks.html";
    return;
  }

  location.href = "/";
};

const submitBtn = document.querySelector(".inputs button");
submitBtn?.addEventListener("click", registerUser);
