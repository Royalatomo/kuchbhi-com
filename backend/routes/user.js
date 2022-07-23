const express = require("express");
const User = require("../schema/user");
const Product = require("../schema/product");
const { validateToken, isUserAdmin } = require("../helper/token");
const Session = require("../schema/session");
const { calculateDelivery } = require("../helper/sort");
const Router = express.Router();

Router.get("/", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  let uid = userId;
  const responce = {};

  if (await isUserAdmin(userId)) {
    if (req.query.uid) {
      uid = req.query.uid;
    }
  }

  const userDB = await User.findOne({ _id: uid });

  responce["success"] = true;
  responce["user"] = userDB;
  return res.json(responce);
});

Router.get("/all", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const responce = {};

  if (!(await isUserAdmin(userId))) {
    responce["success"] = false;
    responce["error"] = { msg: "Unauthorized request", code: 11 };
    return res.json(responce);
  }

  const users = await User.find({});

  const pagesize = parseInt(req.query.pagesize) || 1;
  const page = parseInt(req.query.page) || 1;

  const totalPages = Math.ceil(users.length / pagesize);
  const pageEndIndex = pagesize * page;

  if (totalPages.length === 0) {
    responce["success"] = true;
    responce["users"] = [];
    return res.json({ ...responce, currentPage: 0, totalPages });
  }

  if (page > totalPages) {
    responce["success"] = false;
    responce["error"] = { msg: "Page out of index", code: 13 };
    return res.json(responce);
  }

  const splitResponce = [];
  if (totalPages === page) {
    for (let i = pageEndIndex - pagesize; i < users.length; i++) {
      splitResponce.push(users[i]);
    }
  } else {
    for (let i = pageEndIndex - pagesize; i < pageEndIndex; i++) {
      splitResponce.push(users[i]);
    }
  }

  responce["success"] = true;
  responce["users"] = splitResponce;
  return res.json({ ...responce, currentPage: page, totalPages });
});

Router.get("/orders", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const responce = {};

  const userOrders = (await User.findOne({ _id: userId }))?.orders || [];

  const pagesize = parseInt(req.query.pagesize) || 1;
  const page = parseInt(req.query.page) || 1;

  const totalPages = Math.ceil(userOrders.length / pagesize);
  const pageEndIndex = pagesize * page;

  if (totalPages.length === 0) {
    responce["success"] = true;
    responce["orders"] = [];
    return res.json({ ...responce, currentPage: 0, totalPages });
  }

  if (page > totalPages) {
    responce["success"] = false;
    responce["error"] = { msg: "Page out of index", code: 13 };
    return res.json(responce);
  }

  const splitResponce = [];
  if (totalPages === page) {
    for (let i = pageEndIndex - pagesize; i < userOrders.length; i++) {
      splitResponce.push(userOrders[i]);
    }
  } else {
    for (let i = pageEndIndex - pagesize; i < pageEndIndex; i++) {
      splitResponce.push(userOrders[i]);
    }
  }

  responce["success"] = true;
  responce["orders"] = splitResponce;
  return res.json({ ...responce, currentPage: page, totalPages });
});

Router.get("/recent", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const responce = {};

  const userOrders = (await User.findOne({ _id: userId }))?.recentViewed || [];
  if (userOrders.length < 1) {
    responce["success"] = true;
    responce["products"] = [];
    return res.json({ ...responce, currentPage: 0, totalPages: 0 });
  }

  const pagesize = parseInt(req.query.pagesize) || 1;
  const page = parseInt(req.query.page) || 1;

  const totalPages = Math.ceil(userOrders.length / pagesize);
  const pageEndIndex = pagesize * page;

  if (totalPages.length === 0) {
    responce["success"] = true;
    responce["products"] = [];
    return res.json({ ...responce, currentPage: 0, totalPages });
  }

  if (page > totalPages) {
    responce["success"] = false;
    responce["error"] = { msg: "Page out of index", code: 13 };
    return res.json(responce);
  }

  const splitResponce = [];
  if (totalPages === page) {
    for (let i = pageEndIndex - pagesize; i < userOrders.length; i++) {
      splitResponce.push(userOrders[i]);
    }
  } else {
    for (let i = pageEndIndex - pagesize; i < pageEndIndex; i++) {
      splitResponce.push(userOrders[i]);
    }
  }

  responce["success"] = true;
  responce["products"] = splitResponce;
  return res.json({ ...responce, currentPage: page, totalPages });
});

Router.patch("/update", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const responce = {};

  const existingUser = await User.findOne({ _id: userId });
  if (!existingUser) {
    responce["success"] = false;
    responce["error"] = { msg: "Something Went Wrong", code: 1000 };
    return res.json(responce);
  }
  const fullName = req.body.fullname || existingUser.fullName;
  const address = req.body.address?.toLowerCase() || existingUser.address;
  await User.updateOne({ _id: userId }, { address, fullName });
  responce["success"] = true;
  responce["msg"] = "User updated successfully";
  return res.json(responce);
});

Router.delete("/admin-delete", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const deleteUser = req.query.userId;
  const responce = {};

  if (!(await isUserAdmin(userId)) || (await isUserAdmin(deleteUser))) {
    responce["success"] = false;
    responce["error"] = { msg: "Unauthorized request", code: 11 };
    return res.json(responce);
  }

  try {
    await User.deleteOne({ _id: deleteUser });
  } catch (error) {
    responce["success"] = false;
    responce["error"] = { msg: "Something Went Wrong", code: 1000 };
    return res.json(responce);
  }
  await Session.deleteOne({ _id: deleteUser });
  responce["success"] = true;
  responce["msg"] = "User deleted successfully";
  return res.json(responce);
});

Router.get("/cart", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const userDB = await User.findOne({ _id: userId });
  const responce = {};

  let cartProducts = [];
  for (let product of userDB?.cart) {
    const fullProduct = await Product.findOne({ _id: product.id });
    if (fullProduct) {
      cartProducts.push({ ...fullProduct._doc, qty: product.qty });
    }
  }

  cartProducts = calculateDelivery(cartProducts, userDB?.address);

  const pagesize = parseInt(req.query.pagesize) || 1;
  const page = parseInt(req.query.page) || 1;

  const totalPages = Math.ceil(cartProducts.length / pagesize);
  const pageEndIndex = pagesize * page;

  if (cartProducts.length === 0) {
    responce["success"] = true;
    responce["products"] = [];
    return res.json({ ...responce, currentPage: 0, totalPages });
  }

  if (page > totalPages) {
    responce["success"] = false;
    responce["error"] = { msg: "Page out of index", code: 13 };
    return res.json(responce);
  }

  const splitResponce = [];
  if (totalPages === page) {
    for (let i = pageEndIndex - pagesize; i < cartProducts.length; i++) {
      splitResponce.push(cartProducts[i]);
    }
  } else {
    for (let i = pageEndIndex - pagesize; i < pageEndIndex; i++) {
      splitResponce.push(cartProducts[i]);
    }
  }

  responce["success"] = true;
  responce["products"] = splitResponce;
  return res.json({ ...responce, currentPage: page, totalPages });
});

Router.patch("/cart-update", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const cartItem = req.body.product;
  const userDB = await User.findOne({ _id: userId });
  const userCart = userDB?.cart || [];
  const responce = {};

  if (cartItem.length < 1) {
    await User.updateOne({ _id: userId }, { cart: [] });
    responce["success"] = true;
    responce["msg"] = "Cart updated successfully";
    return res.json(responce);
  }

  const addNewItems = [];

  for (item of cartItem) {
    let found = false;
    for (let i = 0; i < userCart.length; i++) {
      if (userCart[i].id === item.id) {
        userCart[i].qty = parseInt(userCart[i].qty) + parseInt(item.qty);
        if (userCart[i].qty <= 0) {
          userCart.splice(i, 1);
        }

        found = true;
        await User.updateOne({ _id: userId }, { cart: userCart });
      }
    }

    if (!found) addNewItems.push(item);
  }

  if (addNewItems.length > 0) {
    await User.updateOne(
      { _id: userId },
      { cart: [...addNewItems, ...userCart] }
    );
  }
  responce["success"] = true;
  responce["msg"] = "Cart updated successfully";
  return res.json(responce);
});

Router.post("/logout", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const responce = {};
  await Session.deleteOne({ _id: userId });
  responce["success"] = true;
  responce["msg"] = "Logged out successfully";
  return res.json(responce);
});

module.exports = Router;
