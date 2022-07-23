const express = require("express");
const sha512 = require("js-sha512");

const { getUser } = require("../helper/search");
const { generateToken } = require("../helper/token");

const Router = express.Router();

Router.post("/", async (req, res) => {
  const email = req.body.email;
  const password = req.body.pass;
  const responce = {};

  if (!email || !password) {
    responce["success"] = false;
    responce["error"] = { msg: "Missing field value", code: 4 };
    return res.json(responce);
  }

  // Getting user with email
  const user = await getUser(email);

  // if no user found
  if (!user || user.length <= 0) {
    responce["success"] = false;
    responce["error"] = { msg: "Email not found", code: 0 };
    return res.json(responce);
  }

  const makeHash = sha512(sha512(password) + user.salt);
  const storedHash = user.pass;

  // Checking password hashes
  if (makeHash === storedHash) {
    const token = (await generateToken(user)).token;
    responce["success"] = true;
    responce["userId"] = user.id;
    responce["token"] = token;
    responce["admin"] = user.admin;
    return res.json(responce);
  }

  // if hashes does not match
  responce["success"] = false;
  responce["error"] = { msg: "Password is incorrect", code: 8 };
  return res.json(responce);
});

module.exports = Router;
