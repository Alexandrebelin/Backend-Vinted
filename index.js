const app = require("./app");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/Vinted", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
