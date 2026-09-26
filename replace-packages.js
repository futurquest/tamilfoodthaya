const fs = require('fs');
let content = fs.readFileSync('client/src/pages/admin/ManageCateringPackages.tsx', 'utf8');

content = content.replace(
    /<section className="overflow-hidden rounded-\[28px\] border border-\(--brand-outline-dark\) bg-\(--brand-night\) text-white shadow-\[0_28px_80px_var\(--brand-text-a24\)]">/g,
    '<section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">'
);

content = content.replace(
    /<div className="grid gap-6 p-5 md:p-6 xl:grid-cols-\[minmax\(0,1fr\)_420px\] xl:items-stretch">/g,
    '<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">'
);

content = content.replace(
    /border-\(--brand-accent-strong\)\/30 bg-\(--brand-accent-strong\)\/15 px-3 py-1\.5 text-xs font-extrabold text-\(--brand-accent-haze\)/g,
    'border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800'
);

content = content.replace(
    /admin-package-hero-title max-w-\[760px\] text-3xl font-extrabold tracking-tight md:text-\[44px\] md:leading-\[1\.03\]/g,
    'max-w-[760px] text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]'
);

content = content.replace(
    /border-white\/15 bg-white\/10 px-3 py-1\.5 text-xs font-extrabold text-white/g,
    'border-slate-200 bg-stone-50 px-3 py-1.5 text-xs font-extrabold text-slate-700'
);

content = content.replace(
    /admin-package-hero-copy mt-4 max-w-2xl text-sm font-semibold leading-6/g,
    'mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-500'
);

fs.writeFileSync('client/src/pages/admin/ManageCateringPackages.tsx', content, 'utf8');
console.log('done');
