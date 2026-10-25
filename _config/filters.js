import { DateTime } from "luxon";

// Internal collection names that must never appear as reader-facing topics.
const INTERNAL_TAGS = ["all", "posts"];

// Front matter dates are calendar days. YAML may hand us a Date (unquoted
// value, parsed at UTC midnight) or a "YYYY-MM-DD" string (quoted value).
// Both are read in UTC so the server's time zone never shifts the day.
function toDateTime(value) {
	if(value instanceof Date) {
		return DateTime.fromJSDate(value, { zone: "utc" });
	}
	if(typeof value === "string") {
		return DateTime.fromISO(value, { zone: "utc" });
	}
	throw new Error(`Expected a date, received ${JSON.stringify(value)}`);
}

export default function(eleventyConfig) {
	eleventyConfig.addFilter("readableDate", (value, format) => {
		return toDateTime(value).toFormat(format || "d LLLL yyyy");
	});

	eleventyConfig.addFilter("htmlDateString", (value) => {
		return toDateTime(value).toFormat("yyyy-LL-dd");
	});

	// True when `updated` falls on a later calendar day than `published`.
	eleventyConfig.addFilter("isLaterDay", (updated, published) => {
		if(!updated) {
			return false;
		}
		return toDateTime(updated).startOf("day") > toDateTime(published).startOf("day");
	});

	// Index dates: "12 Oct" in the year of the build, "30 Dec '25" otherwise.
	let buildYear = DateTime.utc().year;
	eleventyConfig.addFilter("listDate", (value) => {
		let date = toDateTime(value);
		return date.toFormat(date.year === buildYear ? "d LLL" : "d LLL ''yy");
	});

	// Reader-facing topics, alphabetical.
	eleventyConfig.addFilter("topicList", (collections) => {
		return Object.keys(collections)
			.filter(tag => !INTERNAL_TAGS.includes(tag) && collections[tag].length > 0)
			.sort((a, b) => a.localeCompare(b));
	});

	// When the raw was typed: "9 Oct, 22:15" in the year of the build,
	// "30 Dec '25, 14:02" otherwise.
	eleventyConfig.addFilter("rawAt", (value) => {
		let date = DateTime.fromISO(value, { zone: "utc" });
		return date.toFormat(date.year === DateTime.utc().year ? "d LLL, HH:mm" : "d LLL ''yy, HH:mm");
	});

	// <time datetime="…"> accepts a global date and time string.
	eleventyConfig.addFilter("htmlDatetimeString", (value) => {
		return DateTime.fromISO(value, { zone: "utc" }).toFormat("yyyy-LL-dd'T'HH:mm");
	});
};
