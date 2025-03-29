const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit"); 
const cors = require("cors"); 

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080', 
  optionsSuccessStatus: 200
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again later"
});

app.use(limiter);

const SECRET_KEY = process.env.JWT_SECRET || "your_super_secret_key";

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

app.post("/token", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  

  const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: "1h" });
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
  res.json({ 
    message: `Hello, ${req.user}! This is secure data.`,
    timestamp: new Date()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});