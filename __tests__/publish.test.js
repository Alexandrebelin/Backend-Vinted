const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const app = require("../app");

const Offer = require("../Models/Offer");
const { response } = require("../app");

describe("publish.js", () => {
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

    // Create an account
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
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("publish an offer", async () => {
    // Login
    const response2 = await request(app)
      .post("/user/login")
      .send({ email: "belin.alexandre@gmail.com", password: "Thomas77!!" });
    //Create an offer
    console.log(response2.body);
    const response3 = await request(app)
      .post("/offer/publish")
      .set(
        {
          Authorization: "Bearer " + response2.body.token,
        },
        "content-type",
        "multipart/form-data"
      )
      .field("title", "nike")
      .field("description", "hello")
      .field("price", 100)
      .field("size", "42")
      .field("brand", "nike")
      .field("condition", "new")
      .field("city", "paris")
      .field("color", "white")
      .attach("picture", "img/imgTest.jpg")
      .attach("picture", "img/imgTest2.jpg");

    console.log(response3.body);
    expect(response3.body._id).toBeDefined();
  });

  // it("update an offer", async () => {
  //   // Login
  //   const response2 = await request(app)
  //     .post("/user/login")
  //     .send({ email: "belin.alexandre@gmail.com", password: "Thomas77!!" });

  //   //Create an offer

  //   const response3 = await request(app)
  //     .post("/offer/publish")
  //     .set(
  //       {
  //         Authorization: "Bearer " + response2.body.token,
  //       },
  //       "content-type",
  //       "multipart/form-data"
  //     )
  //     .field("title", "addidas")
  //     .field("description", "b")
  //     .field("price", 80)
  //     .field("size", "42")
  //     .field("brand", "addidas")
  //     .field("condition", "new")
  //     .field("city", "paris")
  //     .field("color", "white")
  //     .attach("picture", "img/imgTest.jpg");

  //   // Modify the offer
  //   const id = response3.body._id;

  //   const response4 = await request(app)
  //     .put(`/offer/update/:${id}`)
  //     .set(
  //       {
  //         Authorization: "Bearer " + response2.body.token,
  //       },
  //       "content-type",
  //       "multipart/form-data"
  //     )
  //     .field({ title: "hello" })
  //     .field({ description: "hello" })
  //     .field({ price: 20 })
  //     .field({ brand: "nikeid" })
  //     .field({ size: "40" })
  //     .field({ condition: "old" })
  //     .field({ color: "red" })
  //     .field({ location: "nice" })
  //     .attach("picture", "img/imgTest2.jpg");

  //   expect(response4.body.name).toEqual("hello");
  //   expect(response4.body.description).toEqual("hello");
  //   expect(response4.body.price).toEqual(20);
  //   expect(response4.body.details[0].brand).toEqual("nikeid");
  //   expect(response4.body.details[1].size).toEqual("40");
  //   expect(response4.body.details[2].condition).toEqual("old");
  //   expect(response4.body.details[3].color).toEqual("red");
  //   expect(response4.body.details[4].location).toEqual("nice");
  // });

  // it("delete an offer", async () => {
  //   // Login
  //   const response2 = await request(app)
  //     .post("/user/login")
  //     .send({ email: "belin.alexandre@gmail.com", password: "Thomas77!!" });

  //   //Create an offer

  //   const response3 = await request(app)
  //     .post("/offer/publish")
  //     .set(
  //       {
  //         Authorization: "Bearer " + response2.body.token,
  //       },
  //       "content-type",
  //       "multipart/form-data"
  //     )
  //     .field("title", "addidas")
  //     .field("description", "b")
  //     .field("price", 80)
  //     .field("size", "42")
  //     .field("brand", "addidas")
  //     .field("condition", "new")
  //     .field("city", "paris")
  //     .field("color", "white")
  //     .attach("picture", "img/imgTest.jpg");
  //   console.log(response3.body);
  //   // Modify the offer
  //   const id = response3.body._id;

  //   const response4 = await request(app)
  //     .delete(`/offer/delete/:${id}`)
  //     .set({
  //       Authorization: "Bearer " + response2.body.token,
  //     });

  //   expect(response4.body).toEqual("Offer deleted succesfully !");
  // });
});
