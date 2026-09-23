const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const srcDir = path.join(__dirname, 'src');
const indexHtml = path.join(__dirname, 'index.html');

function getAllFiles(dir, ext, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, ext, fileList);
        } else if (ext.test(filePath)) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

function getAllCodeFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllCodeFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const images = getAllFiles(publicDir, /\.(png|jpe?g|svg|webp|gif|avif)$/i);
const codeFiles = getAllCodeFiles(srcDir);
codeFiles.push(indexHtml);

let codeContent = '';
for (const file of codeFiles) {
    if (fs.existsSync(file)) {
        codeContent += fs.readFileSync(file, 'utf8') + '\n';
    }
}

const used = [];
const unused = [];

for (const img of images) {
    const basename = path.basename(img);
    if (codeContent.includes(basename)) {
        used.push(basename);
    } else {
        unused.push(basename);
    }
}

console.log('USED:');
console.log(used.join('\n'));
console.log('\nUNUSED:');
console.log(unused.join('\n'));
