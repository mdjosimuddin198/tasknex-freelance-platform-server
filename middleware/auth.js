const jwt = require("jsonwebtoken");
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

module.exports = validToken;
