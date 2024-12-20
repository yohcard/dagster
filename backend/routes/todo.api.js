const router = require("express").Router();
const ObjectId = require("mongodb").ObjectId;
const jsonwebtoken = require("jsonwebtoken");

const TodoModel = require("../database/models/todo.model");
const { keyPub } = require("../env/keys");

// create a new todo
router.post("/add", async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    const decodedToken = jsonwebtoken.verify(token, keyPub);
    if (ObjectId.isValid(decodedToken.sub)) {
      const body = req.body;
      const todo = new TodoModel({
        text: body.text,
        completed: false,
        user_id: new ObjectId(decodedToken.sub),
      });
      try {
        await todo.save();
        res.status(200).json(null);
      } catch (err) {
        console.error("CREATE TODO: ", err);
        res.status(400).json("Erreur lors de la création du todo");
      }
    } else {
      res.status(400).json(null);
    }
  } else {
    res.status(400).json(null);
  }
});

// update todo
router.patch("/:id", async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: req.body,
    };
    try {
      let result = await TodoModel.updateOne(query, updates);
      console.log(result);
      res.status(200).json(result);
    } catch (err) {
      console.error("UPDATE TODO: ", err);
      res.status(400).json(null);
    }
  } else {
    res.status(400).json(null);
  }
});

// delete todo
router.delete("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const query = { _id: new ObjectId(req.params.id) };

  try {
    const result = await TodoModel.findOneAndDelete(query);

    if (!result) {
      return res.status(404).json({ message: "Todo not found." });
    }

    res.status(200).json({ message: "Todo deleted successfully." });
  } catch (err) {
    console.error("DELETE TODO: ", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// get all todo of user
router.get("/", async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    const decodedToken = jsonwebtoken.verify(token, keyPub);
    if (ObjectId.isValid(decodedToken.sub)) {
      const query = { user_id: new ObjectId(decodedToken.sub) };
      try {
        const todos = await TodoModel.find(query).select("-__v").exec();
        if (todos && todos.length > 0) {
          res.status(200).json(todos);
        } else {
          res.status(404).json(null);
        }
      } catch (err) {
        console.error("GET ALL TODO: ", err);
        res.status(400).json(null);
      }
    } else {
      res.status(400).json(null);
    }
  } else {
    res.status(400).json(null);
  }
});

module.exports = router;
