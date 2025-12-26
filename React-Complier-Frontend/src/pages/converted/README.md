This folder contains auto-generated React components created by `tools/html_to_react.js`.

- Files in this directory are generated and will override on each run of `npm run convert:html`.
- The generated components render the original HTML using `dangerouslySetInnerHTML` to preserve the exact look.
- After generation, manual work may be required to convert inline scripts into React lifecycles and to extract styles.
