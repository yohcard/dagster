const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const TodoModel = require("../database/models/todo.model.js");
const UserModel = require("../database/models/user.model.js");
const todoRouter = require("../routes/todo.api.js");
const { key } = require("../env/keys");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/todo", todoRouter);

describe("GET /todo", () => {
  it("Should return all todos for a user", async () => {
    const user = await UserModel.create({
      email: "test@gmail.com",
      password: "Etml2024.",
    });

    const token = jsonwebtoken.sign({}, key, {
      subject: user._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    await TodoModel.create([
      { text: "Task 1", completed: false, user_id: user._id },
      { text: "Task 2", completed: false, user_id: user._id },
    ]);

    const response = await request(app)
      .get("/todo")
      .set("Cookie", `token=${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Task 1", completed: false }),
        expect.objectContaining({ text: "Task 2", completed: false }),
      ])
    );
  });

  it("Should return 404 if no todos are found for the user", async () => {
    const user = await UserModel.create({
      email: "test@gmail.com",
      password: "Etml2024.",
    });

    const token = jsonwebtoken.sign({}, key, {
      subject: user._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    const response = await request(app)
      .get("/todo")
      .set("Cookie", `token=${token}`)
      .expect(404);

    expect(response.body).toBe(null);
  });
});

describe("POST /todo/add", () => {
  it("Should create a new todo", async () => {
    const user = await UserModel.create({
      email: "test@gmail.com",
      password: "Etml2024.",
    });

    const token = jsonwebtoken.sign({}, key, {
      subject: user._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    const todo = { text: "New Task", completed: false };

    return request(app)
      .post("/todo/add")
      .set("Cookie", `token=${token}`)
      .send(todo)
      .expect(200);
  });

  it("Should return 400 if token is missing", async () => {
    return request(app)
      .post("/todo/add")
      .send({ text: "New Task" })
      .expect(400);
  });
});

describe("PATCH /todo/:id", () => {
  it("Should update a todo", async () => {
    const user = await UserModel.create({
      email: "test@gmail.com",
      password: "Etml2024.",
    });

    const token = jsonwebtoken.sign({}, key, {
      subject: user._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    const todo = await TodoModel.create({
      text: "Task to update",
      completed: false,
      user_id: user._id,
    });

    const updatedData = { text: "Updated Task", completed: true };

    return request(app)
      .patch(`/todo/${todo._id}`)
      .set("Cookie", `token=${token}`)
      .send(updatedData)
      .expect(200);
  });

  it("Should return 400 if ID is invalid", async () => {
    return request(app)
      .patch("/todo/invalid-id")
      .send({ text: "Updated Task" })
      .expect(400);
  });

  it("Should return 400 if MongoDB throws an error on update", async () => {
    jest
      .spyOn(TodoModel, "updateOne")
      .mockRejectedValueOnce(new Error("Update error"));

    const user = await UserModel.create({
      email: "test@gmail.com",
      password: "Etml2024.",
    });

    const token = jsonwebtoken.sign({}, key, {
      subject: user._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    const response = await request(app)
      .patch("/todo/somevalidid")
      .set("Cookie", `token=${token}`)
      .send({ text: "Updated Task" })
      .expect(400);

    expect(response.body).toBe(null);
  });
});

describe("DELETE /todo/:id", () => {
  it("Should delete a todo", async () => {
    const user = await UserModel.create({
      email: "test@gmail.com",
      password: "Etml2024.",
    });

    const token = jsonwebtoken.sign({}, key, {
      subject: user._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    const todo = await TodoModel.create({
      text: "Task to delete",
      completed: false,
      user_id: user._id,
    });

    const response = await request(app)
      .delete(`/todo/${todo._id}`)
      .set("Cookie", `token=${token}`)
      .expect(200);

    expect(response.body.message).toBe("Todo deleted successfully.");

    const deletedTodo = await TodoModel.findById(todo._id);
    expect(deletedTodo).toBeNull();
  });

  it("Should return 400 if ID is invalid", async () => {
    const response = await request(app).delete("/todo/invalid-id").expect(400);

    expect(response.body.message).toBe("Invalid ID format.");
  });

  it("Should return 404 if todo to delete is not found", async () => {
    const user = await UserModel.create({
      email: "test@gmail.com",
      password: "Etml2024.",
    });

    const token = jsonwebtoken.sign({}, key, {
      subject: user._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    const response = await request(app)
      .delete("/todo/64bcd7faeb4567890abcdef1") // ID valide mais inexistant
      .set("Cookie", `token=${token}`)
      .expect(404);

    expect(response.body.message).toBe("Todo not found.");
  });
});
