const { ObjectId } = require("mongodb");
const client = require("../models/db");

const database = client.db("TaskNex_Task");
const TaskNexCollection = database.collection("Tasks");

const getjobs = async (req, res) => {
  const limit = parseInt(req.query.limit);
  let cursor = TaskNexCollection.find().sort({ _id: -1 });

  if (!isNaN(limit)) {
    cursor = cursor.limit(limit);
  }

  const result = await cursor.toArray();
  res.send(result);
};

const postjob = async (req, res) => {
  console.log("data form client side is ", req.body);
  const newTasks = req.body;
  const result = await TaskNexCollection.insertOne(newTasks);
  res.send(result);
};

const getjob = async (req, res) => {
  const id = req.params.id;
  const quary = { _id: new ObjectId(id) };
  const result = await TaskNexCollection.findOne(quary);
  res.send(result);
};

const updatejob = async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const opiton = { upsert: true };
  const updatePost = req.body;
  const updatedoc = {
    $set: updatePost,
  };
  const result = await TaskNexCollection.updateOne(filter, updatedoc, opiton);
  res.send(result);
};

const deletejob = async (req, res) => {
  const id = req.params.id;
  const quary = { _id: new ObjectId(id) };
  const result = await TaskNexCollection.deleteOne(quary);
  res.send(result);
};
module.exports = { getjobs, postjob, getjob, updatejob, deletejob };
