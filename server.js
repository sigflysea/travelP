const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use("/api/users", require("./routes/users"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));

app.get("/", (req, res) => res.send("API up"));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server runing on port ${PORT}`));
