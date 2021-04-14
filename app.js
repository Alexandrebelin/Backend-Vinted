const express = require("express");
const formidable = require("express-formidable");
const mongoSanitize = require("express-mongo-sanitize");

const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();
app.use(formidable());
app.use(cors());
app.use(limiter);

app.disable("x-powered-by");
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const userRoutes = require("./Routes/user");
const publishRoutes = require("./Routes/publish");
app.use(userRoutes);
app.use(publishRoutes);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This road does not exist" });
});

module.exports = app;
