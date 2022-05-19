var express = require("express");
var router = express.Router();

const Todo = require("../models/todos");

const { appError } = require("../service/handleError");
const handleSuccess = require("../service/handleSuccess");
const handleErrorAsync = require("../service/handleErrorAsync");
const decoding = require("../service/decodingJWT");

router.get(
  "/",
  handleErrorAsync(async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const currentUser = await decoding(token);
    const user = currentUser.id;
    const todos = await Todo.find({ user }).select("id content completed_at");
    handleSuccess(res, 200, todos);
  })
);

router.post(
  "/",
  handleErrorAsync(async (req, res, next) => {
    if (!req.body.todo) {
      return appError(401, "資料格式錯誤", next);
    }
    const { content } = req.body.todo;
    if (!content) {
      return appError(401, "請輸入代辦事項", next);
    }
    const token = req.headers.authorization.split(" ")[1];
    const currentUser = await decoding(token);
    const user = currentUser.id;

    const newTodo = await Todo.create({
      user,
      content,
    });

    handleSuccess(res, 201, newTodo);
  })
);

router.delete(
  "/:id",
  handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;

    if (id.length !== 24) {
      return appError(401, "請確認ID是否正確", next);
    }
    const isDeleteTodo = await Todo.findByIdAndDelete(id);
    if (!isDeleteTodo) {
      return appError(401, "查無此ID", next);
    }

    handleSuccess(res, 201, null, "已刪除!!");
  })
);

router.put(
  "/:id",
  handleErrorAsync(async (req, res, next) => {
    if (!req.body.todo) {
      return appError(401, "資料格式錯誤", next);
    }
    const { id } = req.params;
    const { content } = req.body.todo;
    if (id.length !== 24) {
      return appError(401, "請確認ID是否正確", next);
    }
    if (!content) {
      return appError(401, "請輸入要修正的內容", next);
    }

    const newTodo = await Todo.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );
    if (!newTodo) {
      return appError(401, "查無此ID", next);
    }

    handleSuccess(res, 201, newTodo);
  })
);
router.patch(
  "/:id/toggle",
  handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    if (id.length !== 24) {
      return appError(401, "請確認ID是否正確", next);
    }

    const todo = await Todo.findById(id);
    if (!todo) {
      return appError(401, "請確認ID是否正確", next);
    }
    todo.completed_at = todo.completed_at ? null : new Date();
    await todo.save();
    handleSuccess(res, 201, todo);
  })
);

module.exports = router;
