import { backend, getUserByIdRoute, loginRoute } from "./env.js";

const showBtn = document.querySelector(".container form span");
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

const email = document.querySelector("form input#email");
const pass = document.querySelector("form input#password");
const error = document.querySelector("form p#error");
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

  if (!data.admin) {
    error.innerText = "No admin is registered for this email";
    return;
  }

  localStorage.setItem("userId", data.userId);
  localStorage.setItem("token", data.token);

  location.href = "/";
};

const submitBtn = document.querySelector("form button");
submitBtn?.addEventListener("click", registerUser);
