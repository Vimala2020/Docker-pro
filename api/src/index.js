const express = require("express");
const redis = require("redis");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

// Redis client
const redisClient = redis.createClient({ url: `redis://${process.env.REDIS_HOST}:6379` });
redisClient.connect().catch(console.error);

// Dummy MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb://mongo:27017/appdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB connection error:", err));

app.get("/api/hello", async (req, res) => {
    const cached = await redisClient.get("hello");
    if (cached) return res.json({ source: "cache", message: cached });

    const message = "Hello from API!";
    await redisClient.set("hello", message, { EX: 10 });
    res.json({ source: "server", message });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
