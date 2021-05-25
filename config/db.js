const mongoose = require("mongoose");
/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 *
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 */

const conn = process.env.DB_STRING;

const connection = mongoose
	.connect(conn, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("Database Connected.");
		mongoose.set("useFindAndModify", false);
	})
	.catch((err) => {
		console.log(`Database Error: ${err}`);
	});

// Expose the connection
module.exports = connection;
