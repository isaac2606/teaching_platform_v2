const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Bestpc.tn\\teaching_platform_v2\\backend\\src\\routes';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\((['"].+?['"])\);?/g, 'import $1 from $2;');
        content = content.replace(/const\s+\{\s*([a-zA-Z0-9_,\s]+)\s*\}\s*=\s*require\((['"].+?['"])\);?/g, 'import { $1 } from $2;');

        content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);?/g, 'export default $1;');

        const newFilePath = path.join(dir, file.replace('.js', '.ts'));
        fs.writeFileSync(newFilePath, content);
        fs.unlinkSync(filePath);
        console.log('Refactored ' + file);
    }
});
