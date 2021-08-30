const express = require("express");
const path = require("path");
const morgan = require("morgan")("dev");
const PORT = process.env.PORT || 5000;
const CONCURRENCY = process.env.WEB_CONCURRENCY || 1;
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const logger = require("emberdyn-logger");
const topRoutes = require("./routes/top");
//const accountRoutes = require("./routes/account");
const appsRoutes = require("./routes/apps");
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
//const articleRoutes = require("./routes/articles");
const binRoutes = require("./routes/bin");
//const publicRoutes = require("./routes/public");
//const protectedRoutes = require("./routes/protected");

//const projectRoutes = require("./routes/projects");
//const demoRoutes = require("./routes/demos");

require("ejs");
require("dotenv").config();
require("./config/db");
require("./config/strategies/localStrategy");
require("./config/api/discord.js");
require("./bin/highlife-dragtimes");
require("./config/cron.js");
let app = express();

let string = "";
// DEFAULT CONFIGS
app.use(express.static(path.join(__dirname, "public"))); // PUBLIC STATIC DIRECTORY

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

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true })); // EXTENDED URLENCODING FOR FORMS
app.use((req, res, next) => {
	// DEBUGGING
	//console.log(req.session);
	next();
});

// Index Routing
app.use("/", topRoutes);

//app.use("/public", publicRoutes);
//app.use("/account", accountRoutes);
app.use("/apps", appsRoutes);
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
//app.use("/articles", articleRoutes);
app.use("/bin", binRoutes);
//app.use("/protected", protectedRoutes);
//app.use("/projects", projectRoutes);
//app.use("/demos", demoRoutes);

app.use((req, res) => {
	// must manually set 404 status code
	//res.status(404).sendFile(`${path}404.html`, { root });
	res.render("pages/404", { referer: req.headers.referer });
});

app.listen(PORT, () => logger.system(`Listening on ${PORT}`));
