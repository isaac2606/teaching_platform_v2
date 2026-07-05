const fs = require('fs');
const path = require('path');

const dirs = [
    'c:\\Users\\Bestpc.tn\\teaching_platform_v2\\backend\\src\\controllers',
    'c:\\Users\\Bestpc.tn\\teaching_platform_v2\\backend\\src\\routes'
];

dirs.forEach(dir => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.ts')) {
            const filePath = path.join(dir, file);
            let content = fs.readFileSync(filePath, 'utf8');

            const regex = /catch\s*\(\s*err\s*\)\s*\{\s*(return\s+)?res\.status\((.*?)\)\.json\((.*?)\);?\s*\}/g;
            
            content = content.replace(regex, (match, ret, status, body) => {
                const returnStmt = ret || "";
                return `catch (err) {
    if (err instanceof Error) {
      ${returnStmt}res.status(${status}).json({ error: err.message });
    } else {
      ${returnStmt}res.status(500).json("An unknown error occurred");
    }
  }`;
            });

            fs.writeFileSync(filePath, content);
            console.log('Refactored ' + file);
        }
    });
});
