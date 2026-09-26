const fs = require('fs');

const files = [
    'client/src/pages/admin/ManageLeads.tsx',
    'client/src/pages/admin/ManageMenu.tsx',
    'client/src/pages/admin/ManageUsers.tsx',
    'client/src/pages/admin/SettingsPage.tsx',
    'client/src/pages/admin/ViewMessages.tsx',
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // MetricCard / stat card backgrounds: dark glass -> light stone
    content = content.replace(
        /rounded-2xl border border-white\/10 bg-white\/10 px-4 py-3 shadow-sm/g,
        'rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 shadow-sm'
    );
    content = content.replace(
        /rounded-2xl border border-white\/10 bg-white\/10 px-4 py-3/g,
        'rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3'
    );
    content = content.replace(
        /rounded-2xl border border-white\/10 bg-white\/10 px-3\.5 py-3 shadow-sm md:px-4/g,
        'rounded-2xl border border-slate-200 bg-stone-50 px-3.5 py-3 shadow-sm md:px-4'
    );

    // Icon/label row colour inside stat cards
    content = content.replace(
        /className="flex items-center gap-2 text-\(--brand-stone\)"/g,
        'className="flex items-center gap-2 text-slate-400"'
    );
    content = content.replace(
        /className="flex items-center gap-1\.5 text-\[11px\] font-extrabold uppercase tracking-\[0\.16em\] text-\(--brand-stone\)"/g,
        'className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400"'
    );

    // Value text: white -> dark
    content = content.replace(
        /className="mt-2 truncate text-2xl font-extrabold tabular-nums text-white"/g,
        'className="mt-2 truncate text-2xl font-extrabold tabular-nums text-slate-900"'
    );
    content = content.replace(
        /className="mt-1 truncate text-sm font-extrabold text-white"/g,
        'className="mt-1 truncate text-sm font-extrabold text-slate-900"'
    );
    content = content.replace(
        /className="mt-1\.5 break-words leading-tight font-extrabold tabular-nums text-white fluid-value"/g,
        'className="mt-1.5 break-words leading-tight font-extrabold tabular-nums text-slate-900 fluid-value"'
    );

    // Divider inside stat cards
    content = content.replace(
        /border-t border-white\/10 pt-5/g,
        'border-t border-slate-200 pt-5'
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
}
