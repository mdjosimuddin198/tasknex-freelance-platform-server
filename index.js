require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.jeofvdx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("TaskNex_Task");
    const TaskNexCollection = database.collection("Tasks");

    // send data to monogdb

    app.post("/tasks", async (req, res) => {
      console.log("data form client side is ", req.body);
      const newTasks = req.body;
      const result = await TaskNexCollection.insertOne(newTasks);
      res.send(result);
    });

    // get data from monogdb for 6 data
    app.get("/tasks", async (req, res) => {
      //   const cursor = TaskNexCollection.find();
      //   const result = await cursor.toArray();
      const result = await TaskNexCollection.find()
        .sort({ deadline: 1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/alltasks", async (req, res) => {
      //   const cursor = TaskNexCollection.find();
      //   const result = await cursor.toArray();
      const result = await TaskNexCollection.find()
        .sort({ deadline: 1 })
        .toArray();
      res.send(result);
    });
    // get data by id
    app.get("/alltasks/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await TaskNexCollection.findOne(quary);
      res.send(result);
    });

    // update data
    app.put("/alltasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const opiton = { upsert: true };
      const updatePost = req.body;
      const updatedoc = {
        $set: updatePost,
      };
      const result = await TaskNexCollection.updateOne(
        filter,
        updatedoc,
        opiton
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tasknex server is running");
});

app.listen(port, () => {
  console.log(`TaskNex listening on port ${port}`);
});
