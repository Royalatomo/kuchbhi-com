import {
  backend,
  updateUserDetailsRoute,
  getUserDetailsRoute,
  logoutUserRoute,
} from "./env.js";
import("./component/header.js");

const token = localStorage.getItem("token");
if (!token) {
  location.href = "/login.html";
}

const populateData = async () => {
  const userName = document.getElementById("user-name");
  const address = document.getElementById("address");

  let responce = await fetch(backend + getUserDetailsRoute + `?token=${token}`);
  let data = await responce.json();

  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  userName.value = data.user.fullName;
  address.value = data.user.address;
};

async function saveData() {
  const userName = document.getElementById("user-name");
  const address = document.getElementById("address");

  let responce = await fetch(
    backend + updateUserDetailsRoute + `?token=${token}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullname: userName.value,
        address: address.value,
      }),
    }
  );
  let data = await responce.json();

  console.log("data");
  if (!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }

  location.href = "/";
}

const saveBtn = document.querySelector("button.save");
const logout = document.querySelector("button.logout");

saveBtn.addEventListener("click", saveData);
logout.addEventListener("click", async () => {
  const responce = await fetch(backend + logoutUserRoute + `?token=${token}`, {method: "POST"});
  await responce.json();
  localStorage.removeItem("token");
  location.href = "/";
});

populateData();
