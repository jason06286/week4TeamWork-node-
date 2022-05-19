const mongoose = require("mongoose");
require("dotenv").config();

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

// 連接資料庫
mongoose
  .connect(DB)
  // .connect("mongodb://localhost:27017/todolist")
  .then(() => {
    console.log("資料庫連線成功");
  })
  .catch((error) => {
    console.log(error);
  });
