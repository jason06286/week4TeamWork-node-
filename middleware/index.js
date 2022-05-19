const jwt = require("jsonwebtoken");

const User = require("../models/users");

const { appError } = require("../service/handleError");
const decoding = require("../service/decodingJWT");

const isAuth = async (req, res, next) => {
  let token;
  if (!req.headers.authorization) {
    return appError(401, "未帶入token", next);
  }
  if (!req.headers.authorization.startsWith("Bearer")) {
    return appError(401, "格式錯誤", next);
  }
  token = req.headers.authorization.split(" ")[1];

  // 驗證token 正確性
  const decoded = await decoding(token);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return appError(401, "未授權", next);
  }
  next();
};

module.exports = {
  isAuth,
};
