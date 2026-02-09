const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\Home\\Desktop\\backend.Manal\\admin-frontend';
const outputFile = 'c:\\Users\\Home\\Desktop\\backend.Manal\\ADMIN_FRONTEND_DUMP.txt';

const ignoreDirs = ['node_modules', '.next', '.git', 'dist', 'build', '.vscode'];
const ignoreFiles = ['package-lock.json', 'yarn.lock', 'README.md', 'next-env.d.ts'];

// We also want to skip standard UI components to focus on logic and app structure
const skipUiComponents = true;

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (ignoreDirs.includes(file)) return;
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (ignoreFiles.includes(file)) return;
            // Filter primarily for code files
            if (!file.match(/\.(ts|tsx|js|jsx|css)$/)) return;

            const fullPath = path.join(dirPath, file);

            // heuristic to skip standard Shadcn UI components if desired
            if (skipUiComponents && fullPath.includes('components\\ui')) {
                return;
            }

            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

const allFiles = getAllFiles(rootDir);
let content = `DUMP DATE: ${new Date().toISOString()}\n\n`;

allFiles.forEach(file => {
    try {
        const fileContent = fs.readFileSync(file, 'utf8');
        content += `--------------------------------------------------------------------------------\n`;
        content += `FILE: ${file}\n`;
        content += `--------------------------------------------------------------------------------\n`;
        content += fileContent + `\n\n`;
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});

fs.writeFileSync(outputFile, content);
console.log(`Dump created at ${outputFile} with ${allFiles.length} files.`);
