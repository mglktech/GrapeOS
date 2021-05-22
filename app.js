const express = require("express");
const path = require("path");
const morgan = require("morgan")("dev");
const PORT = process.env.PORT || 5000;
const CONCURRENCY = process.env.WEB_CONCURRENCY || 1;

const apiRoutes = require("./routes/api");
const articleRoutes = require("./routes/articles");
const demoRoutes = require("./routes/demos");

let app = express();
// DEFAULT CONFIGS
app.use(express.static(path.join(__dirname, "public"))); // PUBLIC STATIC DIRECTORY
app.use(express.urlencoded({ extended: true })); // EXTENDED URLENCODING FOR FORMS
app.set("views", path.join(__dirname, "views")); // set views directory
app.set("view engine", "ejs"); // set view engine
app.use(morgan); // VERBOSE CONSOLE LOGGING

app.use(async (req, res, next) => {
	// DEBUGGING
	//console.log(req);
	next();
});

app.get("/", (req, res) => res.render("pages/index")); // Index Routing
app.get("/login", (req, res) => res.render("pages/login"));
app.use("/api", apiRoutes);
app.use("/articles", articleRoutes);
app.use("/demos", demoRoutes);

app.use((req, res) => {
	// must manually set 404 status code
	//res.status(404).sendFile(`${path}404.html`, { root });
	res.status(404).send("404 Page Not Found.");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
