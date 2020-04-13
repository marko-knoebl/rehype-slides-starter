const fs = require("fs");

const unified = require("unified");
const remarkParse = require("remark-parse");
const { remarkInclude } = require("@karuga/remark-include");
const remarkRehype = require("remark-rehype");
const rehypeRaw = require("rehype-raw");
const rehypeHighlight = require("rehype-highlight");
const rehypeInline = require("rehype-inline");
const rehypeStringify = require("rehype-stringify");
const vfile = require("vfile");

const rehypeSlides = require("@karuga/rehype-slides");

const processor = unified()
  .use(remarkParse) // parse markdown string
  .use(remarkInclude) // process any @include directives
  .use(remarkRehype, { allowDangerousHtml: true }) // convert to HTML
  .use(rehypeRaw) // parse again to get inner HTML elements
  // convert to a presentation (slides are delimited by headings)
  .use(rehypeSlides, { preset: "headings_compact" })
  .use(rehypeHighlight) // highlight code blocks
  .use(rehypeInline) // bundle assets (images)
  .use(rehypeStringify);

for (let entrypoint of fs.readdirSync("entrypoints")) {
  const input = vfile({
    contents: fs.readFileSync(`entrypoints/${entrypoint}`),
    path: `entrypoints/${entrypoint}`
  });
  const topic = entrypoint.slice(0, entrypoint.length - 3);
  processor.process(input).then(result => {
    fs.writeFileSync(`dist/${topic}.html`, result.toString());
  });
}
