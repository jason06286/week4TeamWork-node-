const express = require("express");
const router = express.Router();
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/users");

const { appError } = require("../service/handleError");
const { isAuth } = require("../middleware/index");
const handleSuccess = require("../service/handleSuccess");
const handleErrorAsync = require("../service/handleErrorAsync");

require("../connections");

const generateSendJWT = (user, statusCode, res) => {
  // 產生 JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });

  const { email, name } = user;
  const data = {
    message: "登入成功",
    email,
    name,
    token,
  };
  handleSuccess(res, statusCode, data);
};

router.get(
  "/check",
  handleErrorAsync(isAuth),
  handleErrorAsync(async (req, res, next) => {
    handleSuccess(res, 200, null, "已授權");
  })
);

router.post(
  "/users",
  handleErrorAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    const errMessage = [];
    if (!name || !email || !password) {
      return appError(400, "欄位未填寫正確", next);
    }
    if (!validator.isLength(password, { min: 6 })) {
      errMessage.push("密碼 字數太少，至少需要 6 個字");
    }
    if (!validator.isEmail(email)) {
      errMessage.push("電子信箱 格式有誤");
      return appError(400, errMessage, next);
    }
    // 比對 資料庫email
    const isRegister = await User.findOne({ email });
    //成功註冊回傳資料，隱藏password
    if (!isRegister) {
      const data = {
        message: "註冊成功",
        email,
        name,
      };
      await User.create({
        name,
        email,
        password: await bcrypt.hash(password, 12),
      });
      handleSuccess(res, 200, data);
    } else {
      return appError(400, "此信箱已註冊過", next);
    }
  })
);

router.post(
  "/users/sign_in",
  handleErrorAsync(async (req, res, next) => {
    if (!req.body.user) {
      return appError(401, "資料格式錯誤", next);
    }
    const { email, password } = req.body.user;
    if (!email || !password) {
      return appError(401, "欄位未填寫正確", next);
    }
    if (!validator.isEmail(email)) {
      return appError(401, "電子信箱 格式有誤", next);
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return appError(401, "此電子信箱尚未註冊", next);
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return appError(401, "密碼有誤，請重新輸入", next);
    }
    generateSendJWT(user, 200, res);
  })
);

router.delete(
  "/users/sign_out",
  handleErrorAsync(isAuth),
  handleErrorAsync(async (req, res, next) => {
    handleSuccess(res, 200, null, "登出成功");
  })
);

module.exports = router;
