const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

//Init Middleware
// old app.use(bodyParser.json());
app.use(express.json({ extended: false }));

app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));

app.get("/", (req, res) => res.send("API up"));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server runing on port ${PORT}`));
