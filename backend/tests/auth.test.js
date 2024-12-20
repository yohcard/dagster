
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const UserModel = require('../database/models/user.model.js');
const authRouter = require('../routes/auth.api.js');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);

describe('POST /auth', () => {
  it('should create a user, authenticate them, and return a token', async () => {
    // Arrange
    const user = { email: 'test@gmail.com', password: 'Etml2024.' };
    const hashedPassword = await bcrypt.hash(user.password, 8);

    // Add user to the database
    await UserModel.create({
      email: user.email,
      password: hashedPassword,
    });

    // Act
    const response = await request(app).post('/auth').send(user);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.email).toBe(user.email);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should return 400 for invalid password', async () => {
    // Arrange
    const user = { email: 'test@gmail.com', password: 'Etml2024.' };
    const wrongPasswordUser = { email: 'test@gmail.com', password: 'wrongpassword' };
    const hashedPassword = await bcrypt.hash(user.password, 8);

    // Add user to the database
    await UserModel.create({
      email: user.email,
      password: hashedPassword,
    });

    // Act
    const response = await request(app).post('/auth').send(wrongPasswordUser);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid email', async () => {
    // Arrange
    const user = { email: 'test@gmail.com', password: 'Etml2024.' };
    const wrongEmailUser = { email: 'root@root.com', password: 'Etml2024.' };
    const hashedPassword = await bcrypt.hash(user.password, 8);

    // Add user to the database
    await UserModel.create({
      email: user.email,
      password: hashedPassword,
    });

    // Act
    const response = await request(app).post('/auth').send(wrongEmailUser);

    // Assert
    expect(response.status).toBe(400);
  });
});

