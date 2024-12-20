const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const UserModel = require("../database/models/user.model");
const userRouter = require("../routes/user.api.js"); // Chemin adapté pour le router des utilisateurs
const { key } = require("../env/keys");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRouter);

describe("User API Tests", () => {
  it("Should create a user", async () => {
    const user = { email: "test@gmail.com", password: "Etml2024." };

    const response = await request(app)
      .post("/api/user/add")
      .send(user)
      .expect(200);

    expect(response.body).toHaveProperty("email", user.email);

    const userInDb = await UserModel.findOne({ email: user.email });
    expect(userInDb).not.toBeNull();
    expect(userInDb.email).toBe(user.email);
  });

  it("Should return current user with a valid token", async () => {
    const user = { email: "test@gmail.com", password: "Etml2024." };

    const newUser = await UserModel.create(user);

    const token = jsonwebtoken.sign({}, key, {
      subject: newUser._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    return request(app)
      .get("/api/user")
      .set("Cookie", `token=${token}`)
      .expect(200);
  });

  it("Should return 400 for expired token", async () => {
    const expiredToken = jsonwebtoken.sign({}, key, {
      subject: "someUserId",
      expiresIn: -60, // expires immediately
      algorithm: "RS256",
    });

    return request(app)
      .get("/api/user")
      .set("Cookie", `token=${expiredToken}`)
      .expect(400);
  });

  it("Should not allow creating the same user twice", async () => {
    const user = { email: "test@gmail.com", password: "Etml2024." };

    await request(app).post("/api/user/add").send(user).expect(200);

    await request(app).post("/api/user/add").send(user).expect(400);

    const userInDb = await UserModel.find({ email: user.email });
    expect(userInDb).toHaveLength(1);
  });

  it("Should return 400 for current user without token", async () => {
    await request(app).get("/api/user").expect(400);
  });

  it("Should allow a user to delete their own account", async () => {
    const user = { email: "test@gmail.com", password: "Etml2024." };

    const newUser = await UserModel.create(user);

    const token = jsonwebtoken.sign({}, key, {
      subject: newUser._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    const response = await request(app)
      .delete("/api/user/delete")
      .set("Cookie", `token=${token}`)
      .expect(200);

    const userInDb = await UserModel.findById(newUser._id);
    expect(userInDb).toBeNull();
  });

  it("Should allow a user to delete their own account", async () => {
    const user = { email: "test@gmail.com", password: "Etml2024." };

    const newUser = await UserModel.create(user);

    const response = await request(app).delete("/api/user/delete").expect(400);

    const userInDb = await UserModel.findById(newUser._id);
    expect(userInDb).not.toBeNull();
  });

  it("Should allow an authenticated user to update their information", async () => {
    const user = { email: "test@gmail.com", password: "Etml2024." };
    const updatedData = { email: "updated@gmail.com", name: "Updated User" };

    const newUser = await UserModel.create(user);

    const token = jsonwebtoken.sign({}, key, {
      subject: newUser._id.toString(),
      expiresIn: 60 * 60 * 24 * 30 * 6,
      algorithm: "RS256",
    });

    const response = await request(app)
      .patch("/api/user/edit")
      .set("Cookie", `token=${token}`)
      .send(updatedData)
      .expect(200);
    expect(response.body).toHaveProperty("email", updatedData.email);
    expect(response.body).toHaveProperty("name", updatedData.name);
    expect(response.body).not.toHaveProperty("password");

    const userInDb = await UserModel.findById(newUser._id).exec();
    expect(userInDb.email).toBe(updatedData.email);
    expect(userInDb.name).toBe(updatedData.name);
  });
  it("Should return 400 for delete without token", async () => {
    return request(app).delete("/api/user/delete").expect(400);
  });

  it("Should return 400 for edit without token", async () => {
    const updatedData = { email: "updated@gmail.com", name: "Updated User" };

    return request(app).patch("/api/user/edit").send(updatedData).expect(400);
  });

  it("Should return 400 for invalid email format", async () => {
    const user = { email: "invalidEmail", password: "Etml2024." };

    return request(app).post("/api/user/add").send(user).expect(400);
  });
  /*
    it('Should return 400 if user not found for edit', async () => {
        const user = { email: "test@gmail.com", password: "Etml2024.", _id: new mongoose.Types.ObjectId(), id: "1" };

        const updatedData = { email: "updated@gmail.com", name: "Updated User" };
        
   

        const token = jsonwebtoken.sign({}, key, {
            subject: user._id.toString(),
            expiresIn: 60 * 60 * 24 * 30 * 6,
            algorithm: 'RS256'
        });
    
        const response = await request(app)
            .patch("/api/user/edit")
            .set("Cookie", `token=${token}`)
            .send(updatedData)
            .expect(400);
    });
    
    it('Should return 400 for get user if user not found', async () => {
        const user = { email: "test@gmail.com", password: "Etml2024." };

        const token = jsonwebtoken.sign({}, key, {
            subject: user._id.toString(),
            expiresIn: 60 * 60 * 24 * 30 * 6,
            algorithm: 'RS256'
        });
    
        const response = await request(app)
            .get('/api/user')
            .set('Cookie', `token=${token}`)
            .expect(400);
    });
    */
  it("Should return 400 for get user if token is invalid", async () => {
    const token = "invalidToken";

    return request(app)
      .get("/api/user")
      .set("Cookie", `token=${token}`)
      .expect(400);
  });
});
