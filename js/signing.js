import { backend, registerRoute } from "./env.js";

const showBtn = document.querySelector(".container span");
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

function checkConfirmEL() {
  const confirmPass = document.querySelector("#confirm-pass");
  if (!confirmPass) return;
  const password = document.querySelector("#password");
  const error = document.querySelector("#error");

  [confirmPass, password].forEach((input) => {
    input.addEventListener("input", () => {
      if (confirmPass.value !== "") {
        if (confirmPass.value !== password.value) {
          error.innerText = "Confrim Password does not match";
        } else {
          error.innerText = "";
        }
      } else {
        error.innerText = "";
      }
    });
  });
}

const joinBtn = document.querySelector(".inputs button");
joinBtn.addEventListener("click", async () => {
  const fullName = document.querySelector("#username").value;
  const email = document.querySelector("#email").value;
  const confirmPass = document.querySelector("#confirm-pass").value;
  const password = document.querySelector("#password").value;
  if (!username || !confirmPass || !email || !password || confirmPass !== password) return;

  const responce = await fetch(backend + registerRoute, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fullName, email, pass: password  }),
  });
  const data = await responce.json();

  if(!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }
  
  location.href = `/verify.html?email=${email}`;
});
checkConfirmEL();
