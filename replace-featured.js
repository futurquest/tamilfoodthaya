const fs = require('fs');
let content = fs.readFileSync('client/src/pages/admin/ManageCateringPackages.tsx', 'utf8');

// Remove tone="dark" from MetricCards
content = content.replace(/ tone="dark"/g, '');

// Update FeaturedPackagePanel background
content = content.replace(/className="rounded-2xl border border-white\/10 bg-white\/10 p-4"/g, 'className="rounded-2xl border border-slate-200 bg-stone-50 p-4"');

// Update text colors inside FeaturedPackagePanel
content = content.replace(/text-\(--brand-stone\)/g, 'text-slate-400');
content = content.replace(/text-\(--brand-surface-beige-soft\)/g, 'text-slate-500');
content = content.replace(/text-\(--brand-cream\)/g, 'text-slate-900');
content = content.replace(/text-white\/60/g, 'text-slate-400');

fs.writeFileSync('client/src/pages/admin/ManageCateringPackages.tsx', content, 'utf8');
console.log('done');
