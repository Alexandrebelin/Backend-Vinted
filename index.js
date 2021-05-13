const app = require("./app");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
