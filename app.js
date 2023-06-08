const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
   origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
   res.json({ message: "Welcome to bezkoder application." });
});

require("./src/routes/user.routes.js")(app);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}.`);
});
