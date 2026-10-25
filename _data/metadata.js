const url = process.env.SITE_URL || "https://odjhey.com/";

export default {
	title: "the blog",
	headerTitle: "odjhey",
	description: "`brain | tail -h 10`",
	url: url.endsWith("/") ? url : `${url}/`,
	language: "en",
	repo: "https://github.com/odjhey/blog",
	branch: "master",
	github: "https://github.com/odjhey",
	email: "odjhey@gmail.com",
	author: {
		name: "odjhey",
		email: "odjhey@gmail.com",
		url: "https://odjhey.com",
	},
	nav: [
		{ url: "/blog/", title: "Blog" },
		{ url: "/tags/", title: "Tags" },
		{ url: "/about/", title: "About" },
	],
};
