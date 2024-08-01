const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");
const authMiddleware = (req, res, next) => {
  if (
    !req.headers.authorization ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded) {
      req.userId = decoded;
      next();
    }
  } catch (err) {
    return res.status(401).send({ error: "Unauthorized" });
  }
};

module.exports = { authMiddleware };
