const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// database connection
const url = "mongodb://localhost:27017";
const clint = new MongoClient(url);
async function dbConnect() {
  try {
    await clint.connect();
    console.log("Database connection successfull");
  } catch (error) {
    console.log("something worng!!!");
  }
}
dbConnect();

// create collections
const services = clint.db("dailyFood").collection("services");

// route handle
app.get("/", (req, res) => {
  res.send("hello world");
});

// add services
app.post("/api/add-service", async (req, res) => {
  try {
    const createService = await services.insertOne(req.body);
    if (createService.acknowledged) {
      res.send({
        success: true,
        data: createService,
      });
    } else {
      res.send({
        success: false,
        err: "something worng try again",
      });
    }
  } catch (err) {
    console.log(err, err.message);
    res.send({
      success: false,
      err: err.message,
    });
  }
});

// listening the server
app.listen("5000", () => {
  console.log("listen server on 5000 port");
});
