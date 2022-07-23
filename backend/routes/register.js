const express = require("express");
const { sha512 } = require("js-sha512");
const { validate } = require("email-validator");

const { getUser } = require("../helper/search");
const User = require("../schema/user");
const Verify = require("../schema/verification");
const { generateSalt, generateToken } = require("../helper/token");

const sendMail = require("../helper/sendMail");
const {otpHtml} = require("../helper/html");

const Router = express.Router();

// FUNCTION: Random 4-digit gen
const generateVerify = (fullName, pass, email) => {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += Math.ceil(Math.random() * 9).toString();
  }

  sendMail(
    email,
    "KuchBhi - OTP",
    `This is to inform you your OTP: ${code}`,
    otpHtml(code, fullName)
  );

  return new Verify({
    fullName,
    pass: sha512(pass),
    email,
    code,
    time: new Date().getTime(),
  });
};

Router.post("/", async (req, res) => {
  const fullName = req.body.fullName.trim();
  const email = req.body.email;
  const pass = req.body.pass;

  // Responce to return
  const responce = {};

  if (!fullName || !pass || !email) {
    responce["success"] = false;
    responce["error"] = { msg: "Missing field value", code: 4 };
    return res.json(responce);
  }

  if (!validate(email)) {
    responce["success"] = false;
    responce["error"] = { msg: "Wrong email format", code: 1 };
    return res.json(responce);
  }

  // If username found in DB
  if (await getUser(email)) {
    responce["success"] = false;
    responce["error"] = { msg: "User already exists", code: 2 };
    return res.json(responce);
  }

  // if already a code present - means "resend code" req
  const activeCode = await Verify.findOne({ email });
  if (activeCode) {
    // converting to seconds
    const createdTime = (new Date().getTime() - activeCode.time) / 1000;

    if (createdTime < 10) {
      responce["success"] = false;
      responce["error"] = {
        msg: "wait 10s before resending the code",
        code: 3,
      };
      return res.json(responce);
    }

    // delete the code
    await Verify.deleteOne({ email });
  }

  // make new code
  await generateVerify(fullName, pass, email).save();
  responce["success"] = true;
  responce["msg"] = "Verify Your Request";
  return res.json(responce);
});

Router.get("/verify", async (req, res) => {
  const email = req.query.email;
  const code = req.query.code;
  const responce = {};

  if (!email || !code) {
    responce["success"] = false;
    responce["error"] = { msg: "Missing field value", code: 4 };
    return res.json(responce);
  }

  // if already a code present - means "resend code" req
  const activeVerify = await Verify.findOne({ email });

  if (!activeVerify) {
    responce["success"] = false;
    responce["error"] = { msg: "No code found for this email", code: 5 };
    return res.json(responce);
  }

  // time in minutes
  const createdTime = (new Date().getTime() - activeVerify.time) / 1000 / 60;

  if (createdTime > 20) {
    await Verify.deleteOne({ email });
    responce["success"] = false;
    responce["error"] = { msg: "Code has expired", code: 6 };
    return res.json(responce);
  }

  if (code !== activeVerify.code) {
    responce["success"] = false;
    responce["error"] = { msg: "wrong verification code", code: 7 };
    return res.json(responce);
  }

  // Generating Salt for password
  const salt = generateSalt();

  const userTemplate = new User({
    fullName: activeVerify.fullName,
    email: activeVerify.email,
    pass: sha512(activeVerify.pass + salt),
    salt,
    admin: email==="admin@mail.com"
  });

  const user = await userTemplate.save();
  const token = (await generateToken(user)).token;
  await Verify.deleteOne({ email });

  responce["success"] = true;
  responce["userId"] = user.id;
  responce["token"] = token;
  return res.json(responce);
});

module.exports = Router;
