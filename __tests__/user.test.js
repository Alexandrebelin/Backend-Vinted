const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const app = require("../app");

const User = require("../Models/User");
const { response } = require("../app");

describe("user.js", () => {
  let mongoServer;

  beforeEach(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(
      mongoUri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      (err) => {
        if (err) console.log(err);
      }
    );
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("create a new user", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          email: "belin.alexandre@gmail.com",
          phone: "0643647991",
          password: "Thomas77!!",
          username: "alex",
        })
      );
    expect(response.statusCode).toEqual(200);
    expect(response.body._id).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(response.body.account.phone).toEqual(newUser.phone);
    expect(response.body.account.username).toEqual(newUser.username);
  });

  it("create an account with a not secured password", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          email: "belin.alexandre@gmail.com",
          phone: "0643647991",
          password: "Alex",
          username: "alex",
        })
      );
    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({ error: "Password not strong enought" });
  });

  it("create an account without username", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          email: "belin.alexandre@gmail.com",
          phone: "0643647991",
          password: "Thomas77!!",
        })
      );
    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({ error: "Missing parameters" });
  });

  it("create an account without email", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          phone: "0643647991",
          password: "Thomas77!!",
          username: "alex",
        })
      );
    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({ error: "Missing parameters" });
  });

  it("create an account without password", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          email: "belin.alexandre@gmail.com",
          phone: "0643647991",
          username: "alex",
        })
      );
    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({ error: "Missing parameters" });
  });

  it("create an account alredy in database", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          email: "belin.alexandre@gmail.com",
          phone: "0643647991",
          password: "Thomas77!!",
          username: "alex",
        })
      );

    const response2 = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          email: "belin.alexandre@gmail.com",
          phone: "0643647991",
          password: "Thomas77!!",
          username: "alex",
        })
      );

    expect(response2.statusCode).toEqual(404);
    expect(response2.body).toEqual({ error: "Email already exists" });
  });

  it("connect sucesfully", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          email: "belin.alexandre@gmail.com",
          phone: "0643647991",
          password: "Thomas77!!",
          username: "alex",
        })
      );

    const response2 = await request(app)
      .post("/user/login")
      .send({ email: "belin.alexandre@gmail.com", password: "Thomas77!!" });

    const user = await User.findOne({ email: "belin.alexandre@gmail.com" });
    const newHash = SHA256("Thomas77!!" + user.salt).toString(encBase64);

    expect(user.hash).toEqual(newHash);
    expect(response2.body._id).toBeDefined();
  });

  it("connect with the wrong password", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          email: "belin.alexandre@gmail.com",
          phone: "0643647991",
          password: "Thomas77!!",
          username: "alex",
        })
      );

    const response2 = await request(app)
      .post("/user/login")
      .send({ email: "belin.alexandre@gmail.com", password: "azerty" });
    const user = await User.findOne({ email: "belin.alexandre@gmail.com" });
    const newHash = SHA256("azerty" + user.salt).toString(encBase64);

    expect(user.hash).not.toEqual(newHash);
    expect(response2.body).toEqual({ error: "Unauthorized" });
  });

  it("connect with the wrong email", async () => {
    const response = await request(app)
      .post("/user/signup")
      .send(
        (newUser = {
          email: "belin.alexandre@gmail.com",
          phone: "0643647991",
          password: "Thomas77!!",
          username: "alex",
        })
      );

    const response2 = await request(app)
      .post("/user/login")
      .send({ email: "belin.tom@gmail.com", password: "Thomas77!!" });
    const user = await User.findOne({ email: "belin.alexandre@gmail.com" });
    const newHash = SHA256("Thomas77!!" + user.salt).toString(encBase64);

    expect(response2.body).toEqual({ error: "Unauthorized" });
  });
});
