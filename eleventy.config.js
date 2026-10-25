import { IdAttributePlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

import pluginFilters from "./_config/filters.js";
import pluginGraph from "./_config/graph.js";
import metadata from "./_data/metadata.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy({ "./public/": "/" });

	// The stylesheet is inlined by base.njk, outside the includes folder.
	eleventyConfig.addWatchTarget("css/**/*.css");

	// Wide code blocks scroll; tabindex lets keyboard users scroll them.
	eleventyConfig.amendLibrary("md", (md) => {
		let fence = md.renderer.rules.fence;
		md.renderer.rules.fence = (...args) => fence(...args).replace(/^<pre/, '<pre tabindex="0"');
	});

	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom",
		outputPath: "/feed.xml",
		collection: {
			name: "posts",
			limit: 20,
		},
		metadata: {
			language: metadata.language,
			title: metadata.title,
			subtitle: metadata.description,
			base: metadata.url,
			author: metadata.author,
		}
	});
	eleventyConfig.addPlugin(pluginFilters);
	eleventyConfig.addPlugin(pluginGraph);
	eleventyConfig.addPlugin(IdAttributePlugin);
};

export const config = {
	templateFormats: ["md", "njk"],
	markdownTemplateEngine: "njk",
	dir: {
		input: "content",
		includes: "../_includes",
		data: "../_data",
		output: "_site"
	},
};
