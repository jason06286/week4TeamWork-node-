const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "user ID 未填寫"],
    },
    content: {
      type: String,
      required: [true, "請輸入貼文內容"],
    },
    completed_at: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

const Todo = mongoose.model("todo", TodoSchema);

module.exports = Todo;
