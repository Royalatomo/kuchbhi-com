import { backend, delUserRoute, getAllUsersRoute, USER_IMG } from "./env.js";
import("./header.js");

let PAGE_SIZE = 2;
let PAGE = 1;

const getUsers = async (size, page) => {
  const token = localStorage.getItem("token");
  const responce = await fetch(
    backend + getAllUsersRoute + `?token=${token}&page=${page}&pagesize=${size}`
  );
  const data = await responce.json();
  if (!data.success) {
    return false;
  }

  return {
    users: data.users,
    currentPage: data.currentPage,
    totalPages: data.totalPages,
  };
};

const deleteUser = async (e) => {
  const uid = e.currentTarget.dataset.uid;
  if (!uid) return;

  const token = localStorage.getItem("token");
  const confirm = window.confirm("Are you sure to delete it?");
  if (!confirm) return;

  const responce = await fetch(backend+delUserRoute+`?token=${token}&userId=${uid}`, {method: "DELETE"});
  const data = await responce.json();
  if(!data.success) {
    alert("something went wrong");
    console.log(data.error);
    return;
  }
  
  const parent = document.getElementById(uid);
  const usersContainer = parent.parentElement;
  const loadmore = document.querySelector(".loadmore.active");
  if (usersContainer.childElementCount === 1 && !loadmore) {
    usersContainer.innerHTML = "<h1>No Users Found</h1>";
    return;
  }
  parent.remove()
};

function userHtml(uid, name, email, address, admin) {
  const user = document.createElement("div");
  user.setAttribute("class", "user");
  user.setAttribute("id", uid);

  user.innerHTML += `<img src="${USER_IMG + "?tr=h-90,w-90"}" alt="user-img" class="user-img">`;
  user.innerHTML += `<div class="user-info">
  <div class="line">Name: <span>${name}</span></div>
  <div class="line">Email: <span>${email}</span></div>
  <div class="line">Address: <span>${address}</span></div>
  </div>`;

  if(!admin) {
    user.innerHTML += `<div class="action-btn">
    <button data-uid="${uid}" class="close"><img src="./assets/close.png" alt="close"></button>
    </div>`;
    user.querySelector(".close").addEventListener("click", deleteUser);
  }

  return user;
}

async function populateUsers(initial = false) {
  const main = document.querySelector("main .users-container");
  const data = await getUsers(PAGE_SIZE, PAGE);
  if (!data) {
    if (!initial) {
      return;
    }

    main.innerHTML = "<h1>No Users Found</h1>";
  }
  if (data.currentPage < data.totalPages) {
    const loadMore = document.querySelector("main .loadmore");
    loadMore.classList.add("active");
  } else {
    loadMore.classList.remove("active");
  }

  for (let user of data.users) {
    const html = userHtml(user._id, user.fullName, user.email, user.address, user.admin);
    main.appendChild(html);
  }
}

const loadMore = document.querySelector("main .loadmore");
loadMore.addEventListener("click", () => {
  PAGE += 1;
  populateUsers();
});

populateUsers(true);
