const express = require("express");
const User = require("../schema/user");
const { validateToken } = require("../helper/token");
const Product = require("../schema/product");

const sendMail = require("../helper/sendMail");
const { checkoutHtml } = require("../helper/html");

const Router = express.Router();

Router.post("/", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const userDB = await User.findOne({ _id: userId });
  const orders = req.body.orders;
  const responce = {};

  if (!orders) {
    responce["success"] = false;
    responce["error"] = { msg: "Missing field value", code: 4 };
    return res.json(responce);
  }

  const date = new Date();
  const newOrder = {
    date: `${date.getFullYear()}:${date.getMonth()}:${date.getDate()}`,
    time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
    products: [],
  };

  const orderReceipts = [];
  let totalPrice = 0;
  for (let product of orders) {
    if (
      typeof product["id"] !== "string" ||
      typeof product["qty"] !== "number"
    ) {
      responce["success"] = false;
      responce["error"] = { msg: "Something Went Wrong", code: 1000 };
      return res.json(responce);
    }

    try {
      const productDB = await Product.findOne({ _id: product.id });
      if (!productDB) {
        responce["success"] = false;
        responce["error"] = { msg: "No product found", code: 12 };
        return res.json(responce);
      }

      for (let i = 0; i < userDB.cart.length; i++) {
        if (userDB.cart[i].id === product.id) {
          userDB.cart[i].qty = parseInt(userDB.cart[i].qty) - parseInt(product.qty);
          if (userDB.cart[i].qty <= 0) {
            userDB.cart.splice(i, 1);
          }

          await User.updateOne({ _id: userId }, { cart: userDB.cart });
          break;
        }
      }

      totalPrice += productDB.price * product.qty;
      orderReceipts.push({
        name: productDB.name,
        qty: product.qty,
        price: productDB.price * product.qty,
      });
      newOrder.products.push(product);
    } catch (error) {
      console.log(error);
      responce["success"] = false;
      responce["error"] = { msg: "Something Went Wrong", code: 1000 };
      return res.json(responce);
    }
  }

  console.log("Email send")
  await User.updateOne(
    { _id: userId },
    { orders: [newOrder, ...userDB.orders] }
  );

  // Sending Email Receipt
  sendMail(
    userDB.email,
    "KuchBhi - Order Receipt",
    "You Placed a order --- Total Price: " + totalPrice,
    checkoutHtml(orderReceipts, totalPrice)
  );

  responce["success"] = true;
  responce["msg"] = "Checkout completed";
  return res.json(responce);
});

[{ date: "date", products: [] }];

module.exports = Router;
