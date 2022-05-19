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
    /**
     * #swagger.tags = ['Todos']
       #swagger.security = [{ "apiKeyAuth": [] }]
        * #swagger.summary = 'Todo 列表'
     * #swagger.responses[200] = {
          description: '自己的 TODO List',
          
        }
     * #swagger.responses[401] = {
          description: '未授權',
          
        }
     }
     */
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
    /**
     * #swagger.tags = ['Todos']
      #swagger.security = [{ "apiKeyAuth": [] }]
     * #swagger.summary = '新增 Todo'
      #swagger.parameters['body'] = {
            in: "body",
            type: "object",
            required: true,
            description: "資料格式",
            schema: { 
              "todo": {
                    "content": "string",
                  }
                }
            }
     * #swagger.responses[201] = {
          description: '該筆 TODO 資料',
          
        }
     * #swagger.responses[401] = {
          description: '未授權',
          
        }
    }
     */
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
    /**
     * #swagger.tags = ['Todos']
        #swagger.security = [{ "apiKeyAuth": [] }]
        * #swagger.summary = '刪除 Todo '
     * #swagger.responses[200] = {
          description: '已刪除',
          
        }
     * #swagger.responses[401] = {
          description: '未授權',
          
        }
    }
     */
    const { id } = req.params;
    if (id.length !== 24) {
      return appError(401, "請確認ID是否正確", next);
    }
    const isDelete = await Todo.findByIdAndDelete(id);
    console.log("isDelete :>> ", isDelete);
    if (!isDelete) {
      return appError(401, "查無此 id", next);
    }
    handleSuccess(res, 200, null, "已刪除");
  })
);

router.put(
  "/:id",
  handleErrorAsync(async (req, res, next) => {
    /**
     * #swagger.tags = ['Todos']
      #swagger.security = [{ "apiKeyAuth": [] }]
        * #swagger.summary = '修改 Todo'
      #swagger.parameters['body'] = {
            in: "body",
            type: "object",
            required: true,
            description: "資料格式",
            schema: { "todo": {
                            "content": "string",
                            } 
                  }
            }
     * #swagger.responses[200] = {
          description: '修改過的 TODO 資料',
          
        }
     * #swagger.responses[401] = {
          description: '未授權',
          
        }
    }
     */
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
    /**
      * #swagger.tags = ['Todos']
        #swagger.security = [{ "apiKeyAuth": [] }]
         * #swagger.summary = 'Todo 完成/已完成 切換'
      * #swagger.responses[200] = {
          description: 'Todo',
        }
      * #swagger.responses[401] = {
          description: '未授權',
        }
      }
      */
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
