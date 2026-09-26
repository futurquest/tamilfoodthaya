const fs = require('fs');
let content = fs.readFileSync('client/src/pages/admin/ManageCateringPackages.tsx', 'utf8');

content = content.replace(
    /className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white\/15 bg-white\/10 px-5 text-sm font-extrabold text-white transition hover:bg-white\/15"/g,
    'className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-stone-50 px-5 text-sm font-extrabold text-slate-700 transition hover:bg-stone-100"'
);

fs.writeFileSync('client/src/pages/admin/ManageCateringPackages.tsx', content, 'utf8');
console.log('done');
