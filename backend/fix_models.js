const fs = require('fs');
const path = require('path');

const modelsDir = 'c:\\Users\\Bestpc.tn\\teaching_platform_v2\\backend\\src\\models';
const files = fs.readdirSync(modelsDir);

files.forEach(file => {
    if (file.endsWith('.ts')) {
        const filePath = path.join(modelsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Fix literal \\n
        content = content.replace(/\\n/g, '');

        // Fix module.exports
        const modelName = file.replace('.ts', '');
        const exportRegex = new RegExp('module\\.exports\\s*=\\s*mongoose\\.model\\(.*?,\\s*([a-zA-Z0-9_]+)\\);?');
        content = content.replace(exportRegex, 'export default mongoose.model<I' + modelName + '>(\"' + modelName + '\", );');

        fs.writeFileSync(filePath, content);
        console.log('Fixed ' + file);
    }
});
