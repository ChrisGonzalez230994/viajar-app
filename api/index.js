//requires
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const colors = require("colors");
const path = require("path");

require("dotenv").config();

//instances
const app = express();

// Configurar trust proxy para nginx SSL (IMPORTANTE)
app.set("trust proxy", true);

//express config
app.use(morgan("tiny"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());

//routes
app.use("/api/auth", require("./routes/users.js"));
app.use("/api/destinos", require("./routes/destinos.js"));
app.use("/api/reservas", require("./routes/reservas.js"));
app.use("/api/reseñas", require("./routes/reseñas.js"));

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "success", 
    message: "API Viajar-App funcionando correctamente",
    timestamp: new Date()
  });
});

module.exports = app;

//listener
app.listen(process.env.API_PORT, () => {
  console.log("API server listening on port " + process.env.API_PORT);
});

//Mongo Connection
const mongoUserName = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

var uri =
  "mongodb://" +
  mongoUserName +
  ":" +
  mongoPassword +
  "@" +
  mongoHost +
  ":" +
  mongoPort +
  "/" +
  mongoDatabase +
  "?authSource=admin";

console.log(uri);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: "admin",
};

mongoose.connect(uri, options).then(
  () => {
    console.log("\n");
    console.log("*******************************".green);
    console.log("✔ Mongo Successfully Connected!".green);
    console.log("*******************************".green);
    console.log("\n");
  },
  (err) => {
    console.log("\n");
    console.log("*******************************".red);
    console.log("    Mongo Connection Failed    ".red);
    console.log("*******************************".red);
    console.log("\n");
    console.log(err);
  }
);
