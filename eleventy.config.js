import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import pluginFilters from "./_config/filters.js";
import pluginGraph from "./_config/graph.js";
import metadata from "./_data/metadata.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	// Copy the contents of the `public` folder to the output folder
	eleventyConfig.addPassthroughCopy({
		"./public/": "/"
	});

	// Run Eleventy when these files change:
	eleventyConfig.addWatchTarget("css/**/*.css");
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page CSS bundle: adds all <style> content to the `css` bundle.
	// Deliberately no JavaScript bundle: zero browser scripts.
	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
		bundleHtmlContentFromSelector: "style",
	});

	// Markdown: wide tables and code blocks scroll inside their own region
	eleventyConfig.amendLibrary("md", (md) => {
		md.renderer.rules.table_open = () => '<div class="table-scroll" role="region" aria-label="Table" tabindex="0"><table>\n';
		md.renderer.rules.table_close = () => "</table></div>\n";
		let fence = md.renderer.rules.fence;
		md.renderer.rules.fence = (...args) => fence(...args).replace(/^<pre/, '<pre tabindex="0"');
	});

	// Official plugins
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

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

	// Image optimization
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		formats: ["avif", "webp", "auto"],
		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				loading: "lazy",
				decoding: "async",
			}
		},
		sharpOptions: {
			animated: true,
		},
	});

	// Filters and note graph
	eleventyConfig.addPlugin(pluginFilters);
	eleventyConfig.addPlugin(pluginGraph);

	// IDs on headings
	eleventyConfig.addPlugin(IdAttributePlugin);
};

export const config = {
	templateFormats: [
		"md",
		"njk",
		"html",
		"11ty.js",
	],

	markdownTemplateEngine: "njk",
	htmlTemplateEngine: "njk",

	dir: {
		input: "content",
		includes: "../_includes",
		data: "../_data",
		output: "_site"
	},
};
