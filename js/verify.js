import { backend, verifyRoute } from "./env.js";

const link = window.location.href;
const userEmail = link.split("?email=")[1]?.replace("+", " ");

const joinBtn = document.querySelector(".inputs button");
joinBtn.addEventListener("click", async () => {
  const code = document.querySelector("#code").value;
  if (!code || !userEmail) return;

  const responce = await fetch(backend + verifyRoute + `?email=${userEmail}&code=${code}`);
  const data = await responce.json();

  if(!data.success) {
    document.querySelector("#error").innerText = data.error.msg;
    return;
  }

  localStorage.setItem("userId", data.userId);
  localStorage.setItem("token", data.token);
  location.href = `/`;
});