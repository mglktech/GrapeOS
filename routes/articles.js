const express = require("express");
const router = express.Router();
//const marked = require("marked");
//const markdown = require("markdown").markdown;
const fs = require("fs");
const hljs = require("highlight.js");
const md = require("markdown-it")({
	html: true,
	linkify: true,
	typographer: false,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (__) {}
		}

		return ""; // use external default escaping
	},
}).use(require("markdown-it-checkbox"));

// const createDomPurify = require("dompurify");
// const { JSDOM } = require("jsdom");
// const dompurify = createDomPurify(new JSDOM.window());

router.get("/test", function (req, res) {
	var path = __dirname + "/markdown/test_.md";
	let file = fs.readFileSync(path);
	let content = md.render(file.toString());
	res.render("./pages/articles-test.ejs", { article: content });
});

module.exports = router;
