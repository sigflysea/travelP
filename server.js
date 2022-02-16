const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.get("/", (req, res) => res.send("API up"));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server runing on port ${PORT}`));
