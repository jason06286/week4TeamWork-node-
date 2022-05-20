const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "user ID 未填寫"],
    },
    id: {
      type: String,
      unique: true,
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

//  加上下面這段
TodoSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    //  ret means return value which is single document here
    delete ret._id;
  },
});

const Todo = mongoose.model("todo", TodoSchema);

module.exports = Todo;
