const express = require("express");
const Product = require("../schema/product");
const User = require("../schema/user");
const { validateToken, isUserAdmin } = require("../helper/token");
const { queriedProducts } = require("../helper/search");
const sorting = require("../helper/sort");
require("dotenv").config();

const Router = express.Router();

Router.get("/", async (req, res) => {
  const token = req.query.token;
  if(token) {
    await validateToken(req, res, () => {});
  }
  const pId = req.query.pid;
  const TOTAL_RECENT_PRODUCTS = 40;
  const responce = {};

  if (!pId) {
    responce["success"] = false;
    responce["error"] = { msg: "Missing field value", code: 4 };
    return res.json(responce);
  }

  let productDB = "";
  try {
    productDB = await Product.findOne({ _id: pId });
  } catch (error) {
    responce["success"] = false;
    responce["error"] = { msg: "Something Went Wrong", code: 1000 };
    return res.json(responce);
  }

  if (!productDB) {
    responce["success"] = false;
    responce["error"] = { msg: "No product found", code: 12 };
    return res.json(responce);
  }
  if (token && (await isUserAdmin(req.body.activeSessionId))) {
    console.log("a");
    responce["success"] = true;
    responce["product"] = productDB;
    return res.json(responce);
  }

  if(token) {
    let recent = [];
    const userId = req.body.activeSessionId;
    const userDB = await User.findOne({ _id: userId });
    const recentDB = userDB.recentViewed;

  
    const recentCompressed =
      recentDB.length < TOTAL_RECENT_PRODUCTS
        ? recentDB
        : recentDB.slice(0, recentDB.length - 1);
  
    for (let i of recentCompressed) {
      if (i === pId) {
        continue;
      }
      recent.push(i);
    }
    recent.unshift(pId);
    await User.updateOne({ _id: userId }, { recentViewed: recent });
    const deliverDate = productDB.delivery[userDB.address] || parseInt(process.env.OTHERS_DELIVER);
    responce["success"] = true;
    responce["product"] = { ...productDB["_doc"], delivery: deliverDate };
    return res.json(responce);
  }


  responce["success"] = true;
  responce["product"] = { ...productDB["_doc"], delivery: parseInt(process.env.OTHERS_DELIVER) };
  return res.json(responce);
});

Router.get("/search", async (req, res) => {
  const token = req.query.token;
  let userId = "";
  if(token) {
    await validateToken(req, res, () => {});
    userId = req.body.activeSessionId;
  }

  const query = req.query.q;
  const rating = req.query.rating || false;
  const delivery = req.query.delivery || false;
  const price = req.query.price || false;
  const brand = req.query.brand || false;
  const responce = {};

  let productDB = "";
  try {
    productDB = queriedProducts(await Product.find({}), query);
  } catch (error) {
    console.log(error);
    responce["success"] = false;
    responce["error"] = { msg: "Something Went Wrong", code: 1000 };
    return res.json(responce);
  }

  if(token) {
    const userDB = await User.findOne({ _id: userId });
    productDB = sorting.calculateDelivery(productDB, userDB.address);
  }else {
    productDB = sorting.calculateDelivery(productDB, "other");
  }

  if (brand) {
    productDB = sorting.filterBrand(productDB, brand.toLowerCase());
  }

  if (delivery) {
    productDB = sorting.filterDelivery(productDB, parseInt(delivery));
  }

  if (rating) {
    productDB = sorting.sortRating(productDB, rating === "lth" ? false : true);
  }

  if (price) {
    productDB = sorting.sortPrice(productDB, price === "lth" ? false : true);
  }

  const pagesize = parseInt(req.query.pagesize) || 1;
  const page = parseInt(req.query.page) || 1;

  const totalPages = Math.ceil(productDB.length / pagesize);
  const pageEndIndex = pagesize * page;

  if (page > totalPages) {
    responce["success"] = false;
    responce["error"] = { msg: "Page out of index", code: 13 };
    return res.json(responce);
  }

  const splitResponce = [];
  if (totalPages === page) {
    for (let i = pageEndIndex - pagesize; i < productDB.length; i++) {
      splitResponce.push(productDB[i]);
    }
  } else {
    for (let i = pageEndIndex - pagesize; i < pageEndIndex; i++) {
      splitResponce.push(productDB[i]);
    }
  }

  responce["success"] = true;
  responce["products"] = splitResponce;
  return res.json({ ...responce, currentPage: page, totalPages });
});

Router.post("/add", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const responce = {};

  if (!(await isUserAdmin(userId))) {
    responce["success"] = false;
    responce["error"] = { msg: "Unauthorized request", code: 11 };
    return res.json(responce);
  }

  const brand = req.body.brand;
  const name = req.body.name;
  const stars = req.body.stars || 0;
  const reviews = req.body.reviews || 0;
  const images = req.body.images || [];
  const about = req.body.about || "";
  const tags = req.body.tags || [];
  const delivery = req.body.delivery || {};
  const price = req.body.price || 0;

  if (!brand || !name || !price) {
    responce["success"] = false;
    responce["error"] = { msg: "Missing field value", code: 4 };
    return res.json(responce);
  }

  const newProduct = new Product({
    brand,
    name,
    stars,
    reviews,
    images,
    about,
    tags,
    delivery,
    price,
  });

  await newProduct.save();

  responce["success"] = true;
  responce["msg"] = "Product created successfully";
  return res.json(responce);
});

Router.patch("/update", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const responce = {};

  if (!(await isUserAdmin(userId))) {
    responce["success"] = false;
    responce["error"] = { msg: "Unauthorized request", code: 11 };
    return res.json(responce);
  }

  const pId = req.query.pid;
  let existingProduct = "";
  try {
    existingProduct = await Product.findOne({ _id: pId });
  } catch (error) {
    responce["success"] = false;
    responce["error"] = { msg: "No product found", code: 12 };
    return res.json(responce);
  }

  const brand = req.body.brand || existingProduct.brand;
  const name = req.body.name || existingProduct.name;
  const stars = req.body.stars || existingProduct.stars;
  const reviews = req.body.reviews || existingProduct.reviews;
  const images = req.body.images || existingProduct.images;
  const about = req.body.about || existingProduct.about;
  const tags = req.body.tags || existingProduct.tags;
  const delivery = req.body.delivery || existingProduct.delivery;
  const price = req.body.price || existingProduct.price;

  await Product.updateOne(
    { _id: pId },
    {
      brand,
      name,
      stars,
      reviews,
      images,
      about,
      tags,
      delivery,
      price,
    }
  );

  responce["success"] = true;
  responce["msg"] = "Product Updated successfully";
  return res.json(responce);
});

Router.delete("/delete", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const responce = {};

  if (!(await isUserAdmin(userId))) {
    responce["success"] = false;
    responce["error"] = { msg: "Unauthorized request", code: 11 };
    return res.json(responce);
  }

  const pId = req.query.pid;

  try {
    await Product.deleteOne({ _id: pId });
  } catch (error) {
    responce["success"] = false;
    responce["error"] = { msg: "No product found", code: 12 };
    return res.json(responce);
  }

  responce["success"] = true;
  responce["msg"] = "Product deleted successfully";
  return res.json(responce);
});

module.exports = Router;
