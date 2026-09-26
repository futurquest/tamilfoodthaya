/**
 * migrate-admin-ui.js
 * Replaces local component definitions in each admin page with imports from AdminUI.tsx
 */

const fs = require('fs');
const path = require('path');

const ADMIN_DIR = 'client/src/pages/admin';
const IMPORT_PATH = '../../components/AdminUI';

// Each entry: { name, regex to detect the component block start, end pattern }
// We'll do a simpler approach: detect the local `const X = ...` block and remove it,
// then inject the import at the top.

const COMPONENTS = ['MetricCard', 'InfoCard', 'SectionTitle', 'WorkspaceHeader', 'FilterSelect'];

const files = fs.readdirSync(ADMIN_DIR).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(ADMIN_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Find which shared components this file defines locally
    const locallyDefined = COMPONENTS.filter(name => {
        const pattern = new RegExp(`^const ${name}\\s*=`, 'm');
        return pattern.test(content);
    });

    if (locallyDefined.length === 0) continue;

    console.log(`\n${file}: found local → [${locallyDefined.join(', ')}]`);

    // Remove each local component definition block
    for (const name of locallyDefined) {
        // Match: const Name = ({ ... }) => (...); OR const Name = (...): ... => { ... };
        // Strategy: find "const Name = " then consume until we hit the next top-level "const " or "export " or EOF
        // We do this character by character to handle nesting properly
        const startPattern = new RegExp(`\\nconst ${name}\\s*=`);
        const startMatch = startPattern.exec(content);
        if (!startMatch) { console.log(`  ${name}: could not find start`); continue; }

        const blockStart = startMatch.index;
        let i = blockStart + startMatch[0].length;
        let depth = 0;
        let inString = false;
        let strChar = '';
        let foundEnd = false;
        
        // Walk forward tracking bracket depth to find where this declaration ends
        while (i < content.length) {
            const ch = content[i];
            
            if (inString) {
                if (ch === strChar && content[i - 1] !== '\\') inString = false;
            } else if (ch === '"' || ch === "'" || ch === '`') {
                inString = true;
                strChar = ch;
            } else if (ch === '(' || ch === '{' || ch === '[') {
                depth++;
            } else if (ch === ')' || ch === '}' || ch === ']') {
                depth--;
                if (depth < 0) {
                    // We've closed more than we opened — we went too far
                    i--;
                    break;
                }
            } else if (depth === 0 && ch === ';') {
                // Semicolon at top level = end of expression statement
                i++;
                foundEnd = true;
                break;
            }
            i++;
        }

        // Also consume any trailing newlines
        while (i < content.length && (content[i] === '\n' || content[i] === '\r')) i++;

        const removed = content.substring(blockStart, i);
        console.log(`  removing ${name} (${removed.length} chars)`);
        content = content.substring(0, blockStart) + content.substring(i);
    }

    // Inject import after existing imports (find last import line)
    const importLine = `import { ${locallyDefined.join(', ')} } from '${IMPORT_PATH}';`;

    // Find the last import statement line
    const lastImportMatch = [...content.matchAll(/^import .+;$/gm)].pop();
    if (lastImportMatch) {
        const insertAt = lastImportMatch.index + lastImportMatch[0].length;
        content = content.substring(0, insertAt) + '\n' + importLine + content.substring(insertAt);
        console.log(`  injected import: ${importLine}`);
    } else {
        // Fallback: prepend
        content = importLine + '\n' + content;
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ saved`);
    }
}

console.log('\nDone!');
