const express = require("express");
const {
  getjobs,
  postjob,
  getjob,
  deletejob,
  updatejob,
} = require("../controllers/jobControllers");

const validToken = require("../middleware/auth");
const router = express.Router();

// get all jobs
router.get("/job", getjobs);

// post job
router.post("/job", validToken, postjob);

// get single job
router.get("/job/:id", validToken, getjob);

// updatejob
router.put("/job/:id", validToken, updatejob);

// delete job
router.delete("/job/:id", validToken, deletejob);

module.exports = router;
