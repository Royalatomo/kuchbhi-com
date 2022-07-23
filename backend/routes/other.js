const express = require("express");
const { validateToken, isUserAdmin } = require("../helper/token");
const Router = express.Router();
const Other = require("../schema/other");

Router.get("/", async (req, res) => {
  const otherDB = await Other.find({});
  const responce = {};
  if (!otherDB || otherDB.length <= 0) {
    responce["success"] = true;
    responce["other"] = { homeCat: [], mainCarousel: [], categories: [] };
    return res.json(responce);
  }

  responce["success"] = true;
  responce["other"] = {
    homeCat: otherDB[0].homeCat,
    mainCarousel: otherDB[0].mainCarousel,
    categories: otherDB[0].categories,
  };
  return res.json(responce);
});

Router.post("/update", validateToken, async (req, res) => {
  const userId = req.body.activeSessionId;
  const homeCat = req.body.homeCat;
  const mainCarousel = req.body.mainCarousel;
  const categories = req.body.categories;
  const responce = {};

  if (!(await isUserAdmin(userId))) {
    responce["success"] = false;
    responce["error"] = { msg: "Unauthorized request", code: 11 };
    return res.json(responce);
  }

  const otherDB = await Other.find({});
  if (!otherDB || otherDB.length <= 0) {
    const schema = new Other({
      homeCat: homeCat || [],
      mainCarousel: mainCarousel || [],
      categories: categories || [],
    });
    schema.save();
    responce["success"] = true;
    responce["msg"] = "Info updated successfully";
    return res.json(responce);
  }

  await Other.updateOne(
    { _id: otherDB[0]._id },
    {
      homeCat: homeCat || otherDB[0].homeCat,
      mainCarousel: mainCarousel || otherDB[0].mainCarousel,
      categories: categories || otherDB[0].categories,
    }
  );
  responce["success"] = true;
  responce["msg"] = "Info updated successfully";
  return res.json(responce);
});

module.exports = Router;
