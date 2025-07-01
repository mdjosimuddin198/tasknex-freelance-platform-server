require("dotenv").config();
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 5000;

app.use(express.json());
app.use(
  cors({
    origin: ["https://tasknex-dcccf.web.app"],
    credentials: true,
  })
);
app.use(cookieParser());

const validToken = (req, res, next) => {
  const token = req?.cookies?.AccessToken;
  // console.log("i am inside in logger mideleware", token);
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.decoded = decoded;
    next();
  });
};

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
    const bidsCollection = database.collection("bids");

    // send data to monogdb

    app.post("/alltasks", async (req, res) => {
      console.log("data form client side is ", req.body);
      const newTasks = req.body;
      const result = await TaskNexCollection.insertOne(newTasks);
      res.send(result);
    });

    // get data from monogdb for 6 data
    // app.get("/alltasks", async (req, res) => {
    //   //   const cursor = TaskNexCollection.find();
    //   //   const result = await cursor.toArray();
    //   const result = await TaskNexCollection.find()
    //     .sort({ deadline: 1 })
    //     .limit(6)
    //     .toArray();
    //   res.send(result);
    // });

    app.get("/alltasks", async (req, res) => {
      const limit = parseInt(req.query.limit);
      let cursor = TaskNexCollection.find().sort({ deadline: 1 });

      if (!isNaN(limit)) {
        cursor = cursor.limit(limit);
      }

      const result = await cursor.toArray();
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
    app.get("/alltasks/:id", validToken, async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await TaskNexCollection.findOne(quary);
      res.send(result);
    });

    // update data
    app.put("/alltasks/:id", validToken, async (req, res) => {
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

    app.delete("/alltasks/:id", validToken, async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await TaskNexCollection.deleteOne(quary);
      res.send(result);
    });

    // get  bit from database
    app.get("/bids/:jobId", validToken, async (req, res) => {
      const jobId = req.params.jobId;

      try {
        const bids = await bidsCollection.find({ jobId }).toArray();
        const count = bids.length;

        res.json({ count });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get bid count" });
      }
    });

    // Create Bid API
    app.post("/bids/:jobId/:userId", validToken, async (req, res) => {
      const jobId = req.params.jobId;
      const userId = req.params.userId;

      try {
        // Check if user already bid on this job
        const existingBid = await bidsCollection.findOne({ jobId, userId });

        if (existingBid) {
          return res
            .status(400)
            .json({ message: "You have already bid on this job." });
        }

        // If not, insert the bid
        const result = await bidsCollection.insertOne({ jobId, userId });
        res.status(200).json({ message: "Bid placed successfully." });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to place bid." });
      }
    });

    app.get("/bids", async (req, res) => {
      const result = await bidsCollection.find().toArray();
      res.send(result);
    });

    // post bids to db
    app.post("/bids/:userId", validToken, async (req, res) => {
      const userId = req.params.userId;
      try {
        const result = await bidsCollection.findOneAndUpdate(
          { userId },
          { $inc: { count: 1 } },
          { returnDocument: "after", upsert: true }
        );
        res.json({ message: "Bid added", count: result.value?.count });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to increase bid" });
      }
    });

    app.post("/jwt_token", async (req, res) => {
      const { userEmail } = req.body;
      const userInfo = userEmail;
      const token = jwt.sign({ userInfo }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("AccessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.send({ message: "successfull" });
    });

    // clear cookies
    app.post("/api/logout", (req, res) => {
      res.clearCookie("AccessToken", {
        httpOnly: true,
        secure: true, // যদি তোমার অ্যাপ production এ থাকে তাহলে true করো
        sameSite: "none",
        path: "/",
      });
      res.json({ message: "Logout successful." });
    });

    // Send a ping to confirm a successful connection

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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
