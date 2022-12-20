const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-js");
const htmlmin = require("html-minifier");
const slugify = require("slugify");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const Image = require("@11ty/eleventy-img");
const EleventyFetch = require("@11ty/eleventy-fetch");

async function imageShortcode(src, alt, size) {
  let metadata = await Image(src, {
    widths: [size*1, size*1.5, size*2],
    formats: ["avif", "webp"],
    outputDir: "./_site/img",
  });

  let imageAttributes = {
    alt,
    sizes: size + 'px',
    loading: "lazy",
    decoding: "async",
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
}

async function isbnImageShortcode(isbn) {
  let res;

  try {
    res = await EleventyFetch('https://proud-frog-82.deno.dev/' + isbn, {
      duration: "1d",
      type: "json"
    });
  } catch (e) {
    console.log('Could not fetch ' + isbn);
    return '';
  }

  if (!res) {
    console.log('Not a good response for ' + isbn);
    return '';
  }

  const src = res.image;
  const options = {
    widths: [128, 128*1.5, 128*2],
    formats: ['avif', 'webp'],
    cacheOptions: {
      // if a remote image URL, this is the amount of time before it fetches a fresh copy
      duration: "1y",
      // project-relative path to the cache directory
      directory: ".cache",
      removeUrlQueryParams: false,
    },
    outputDir: "./_site/img",
  };

  let metadata;

  try {
    metadata = await Image(src, options);
  } catch (e) {
    return `
      <a href="${res.identifier}">
        <kb-book>
          <strong slot="name">${res.title}</strong>
        </kb-book>
      </a>
    `;
  }

  const imageAttributes = {
    alt: res.title,
    title: res.title,
    sizes: '128px',
    loading: 'lazy',
    decoding: 'async'
  };

  return `
    <a href="${res.identifier}">
      <kb-book isbn="${isbn}">
        ${Image.generateHTML(metadata, imageAttributes).replace('<picture>', '<picture slot="image">')}
      </kb-book>
    </a>
  `;
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  eleventyConfig.addNunjucksAsyncShortcode("isbnImage", isbnImageShortcode);
  eleventyConfig.addLiquidShortcode("isbnImage", isbnImageShortcode);
  eleventyConfig.addJavaScriptFunction("isbnImage", isbnImageShortcode);

  // Eleventy Navigation https://www.11ty.dev/docs/plugins/navigation/
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Configuration API: use eleventyConfig.addLayoutAlias(from, to) to add
  // layout aliases! Say you have a bunch of existing content using
  // layout: post. If you don’t want to rewrite all of those values, just map
  // post to a new file like this:
  // eleventyConfig.addLayoutAlias("post", "layouts/my_new_post_layout.njk");

  // Merge data instead of overriding
  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter("machineDate", dateObj => {
    return dateObj.toISOString();
  });

  // Minify CSS
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter("jsmin", function(code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log("UglifyJS error: ", minified.error);
      return code;
    }
    return minified.code;
  });

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (outputPath.indexOf(".html") > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });

  // Universal slug filter strips unsafe chars from URLs
  eleventyConfig.addFilter("slugify", function(str) {
    return slugify(str, {
      lower: true,
      replacement: "-",
      remove: /[*+~.·,()'"`´%!?¿:@]/g
    });
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("static/img");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("_includes/assets/");

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  let opts = {
    permalink: false
  };

  eleventyConfig.setLibrary("md", markdownIt(options)
    .use(markdownItAnchor, opts)
  );

  eleventyConfig.addFilter('bookFilter', function(collection, shelf) {
    if (!shelf) return collection;
    const filtered = collection.filter(item => item.data.shelf == shelf)
    return filtered;
  });

  return {
    templateFormats: ["md", "njk", "html", "liquid"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
