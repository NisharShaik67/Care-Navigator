import fs from 'fs';
import path from 'path';

function getAllFiles(dir, exts = ['.jsx', '.js']) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
        files = files.concat(getAllFiles(full, exts));
      }
    } else if (exts.includes(path.extname(full))) {
      files.push(full);
    }
  }
  return files;
}

const files = getAllFiles('./src');

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find all JSX tags <ComponentName
  const jsxTagMatches = [...content.matchAll(/<([A-Z][a-zA-Z0-9_]*)/g)].map(m => m[1]);
  const uniqueTags = [...new Set(jsxTagMatches)];
  
  for (const tag of uniqueTags) {
    // Check if tag is declared or imported
    // matches: import ... tag ..., const tag =, function tag, class tag, let tag, var tag
    const isImported = new RegExp(`\\bimport\\b[\\s\\S]*?\\b${tag}\\b[\\s\\S]*?\\bfrom\\b`).test(content);
    const isDeclared = new RegExp(`\\b(const|let|var|function|class)\\s+${tag}\\b`).test(content);
    const isParam = new RegExp(`\\(\\s*${tag}\\s*\\)`).test(content);
    
    if (!isImported && !isDeclared && !isParam) {
      console.log(`MISSING IDENTIFIER: ${tag} in ${file}`);
    }
  }
}
console.log('Scan completed.');
