const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'Frontend', 'views');
const outDir = path.join(__dirname, '..', 'React-Complier-Frontend', 'src', 'pages', 'converted');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const name = path.basename(f, '.html');
  const compName = name.replace(/[^a-zA-Z0-9]/g, '_');
  const html = fs.readFileSync(path.join(viewsDir, f), 'utf8');

  // Use JSON.stringify to safely embed the HTML into a JS string constant
  const htmlJsString = JSON.stringify(html);

  const component = `import React, { useEffect } from 'react';

export default function ${compName}(){
  useEffect(()=>{
    // Scripts in the original HTML may need manual migration
    // TODO: move inline scripts to React lifecycle or components
  }, []);

  const html = ${htmlJsString};

  return (
    <div className="legacy-html-page" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
`;

  const outFile = path.join(outDir, `${compName}.jsx`);
  fs.writeFileSync(outFile, component, 'utf8');
  console.log('Wrote', outFile);
});

console.log('Converted', files.length, 'HTML files to React components in', outDir);