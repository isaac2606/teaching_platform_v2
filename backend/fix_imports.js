const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

let count = 0;
walk('./src').forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  // Match any import ending in .js inside quotes
  let newC = c.replace(/(from\s+['"].*?)\.js(['"])/g, '$1$2');
  if (c !== newC) {
    fs.writeFileSync(file, newC);
    console.log('Fixed', file);
    count++;
  }
});
console.log('Total fixed:', count);
