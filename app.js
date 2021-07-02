const express = require("express");
const path = require("path");
const morgan = require("morgan")("dev");
const PORT = process.env.PORT || 5000;
const CONCURRENCY = process.env.WEB_CONCURRENCY || 1;
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const logger = require("emberdyn-logger");
const topLevelRoutes = require("./routes/top-level-routes");
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const articleRoutes = require("./routes/articles");
const projectRoutes = require("./routes/projects");
const demoRoutes = require("./routes/demos");
const { resolveInclude } = require("ejs");

require("dotenv").config();
require("./config/db");

let app = express();

let string = "";
// DEFAULT CONFIGS
app.use(express.static(path.join(__dirname, "public"))); // PUBLIC STATIC DIRECTORY
app.use(express.urlencoded({ extended: true })); // EXTENDED URLENCODING FOR FORMS
app.set("views", path.join(__dirname, "views")); // set views directory
app.set("view engine", "ejs"); // set view engine
app.use(morgan); // VERBOSE CONSOLE LOGGING

const sessionStore = MongoStore.create({
	mongoUrl: process.env.DB_STRING,
});

app.use(
	session({
		secret: process.env.session_secret,
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
		},
	})
);

require("./config/strategies/localStrategy");
app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
	// DEBUGGING
	//console.log(req.session);
	next();
});

// Index Routing
app.use("/", topLevelRoutes);
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/articles", articleRoutes);
app.use("/projects", projectRoutes);
app.use("/demos", demoRoutes);

app.use((req, res) => {
	// must manually set 404 status code
	//res.status(404).sendFile(`${path}404.html`, { root });
	res.render("./pages/404");
});

app.listen(PORT, () => logger.system(`Listening on ${PORT}`));

require("./config/api/discord.js");
