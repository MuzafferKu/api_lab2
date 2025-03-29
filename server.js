const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

const SECRET_KEY = "your_super_secret_key"; 


app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

app.post("/token", (req, res) => {
  const token = jwt.sign({ user: "test_user" }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ access_token: token });
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded.user;
    next();
  });
}

app.get("/secure-data", authenticate, (req, res) => {
  res.json({ message: `Hello, ${req.user}! This is secure data.` });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});