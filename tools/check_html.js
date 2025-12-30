const fs = require("fs");
const path = require("path");
const viewsDir = path.join(__dirname, "..", "Frontend", "views");
const files = fs.readdirSync(viewsDir).filter((f) => f.endsWith(".html"));
const problems = [];
files.forEach((f) => {
  const full = path.join(viewsDir, f);
  const content = fs.readFileSync(full, "utf8");
  const missing = [];
  if (!content.includes("</html>")) missing.push("</html>");
  if (!content.includes("</body>")) missing.push("</body>");
  if (
    (content.match(/<script[\s>]/g) || []).length !==
    (content.match(/<\/script>/g) || []).length
  )
    missing.push("script tag mismatch");
  if (missing.length) problems.push({ file: f, missing });
});
if (problems.length) {
  console.log("Found problems:");
  problems.forEach((p) => console.log(p.file, p.missing.join(", ")));
  process.exit(2);
} else {
  console.log("All HTML files look structurally OK.");
}
