const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Bestpc.tn\\teaching_platform_v2\\backend\\src\\middleware';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // imports
        content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\((['"].+?['"])\);?/g, 'import  from ;');
        content = content.replace(/const\s+\{\s*([a-zA-Z0-9_,\s]+)\s*\}\s*=\s*require\((['"].+?['"])\);?/g, 'import {  } from ;');

        if (!content.includes('NextFunction')) {
            content = 'import { Request, Response, NextFunction } from "express";\n' + content;
        }

        // typing middleware function parameters
        content = content.replace(/\(req\s*,\s*res\s*,\s*next\)/g, '(req: Request, res: Response, next: NextFunction)');
        
        // Fix module.exports
        content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+)/g, 'export default ');
        content = content.replace(/module\.exports\s*=\s*\{/g, 'export {');

        const newFilePath = path.join(dir, file.replace('.js', '.ts'));
        fs.writeFileSync(newFilePath, content);
        fs.unlinkSync(filePath);
        console.log('Refactored ' + file);
    }
});
