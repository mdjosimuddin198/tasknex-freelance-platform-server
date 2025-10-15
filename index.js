require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 5000;
const jobRouter = require("./routes/jobRoutes");
app.use(express.json());
app.use(
  cors({
    origin: ["https://tasknex-dcccf.web.app", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());

async function run() {
  try {
    app.use(jobRouter);

    app.use("/jwt_token", async (req, res) => {
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
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tasknex server is running");
});

app.listen(port, () => {
  console.log(`TaskNex listening on port ${port}`);
});
