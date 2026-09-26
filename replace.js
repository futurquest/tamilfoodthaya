const fs = require('fs');
let content = fs.readFileSync('client/src/pages/admin/Dashboard.tsx', 'utf8');

content = content.replace(
    /revenueDetail:\s*`\$\{activeBookings\}\s*\$\{activeBookings === 1 \? t\('admin\.dashboard\.bookingsOne'\) : t\('admin\.dashboard\.bookingsOther'\)\}`,/g,
    `revenueDetail: activeBookings === 1 ? t('admin.dashboard.bookingsOne', { count: activeBookings }) : t('admin.dashboard.bookingsOther', { count: activeBookings }),`
);

content = content.replace(
    /newLeadsDetail:\s*`\$\{inProgress\}\s*\$\{t\('admin\.dashboard\.leadsInProgress'\)\}`,/g,
    `newLeadsDetail: t('admin.dashboard.leadsInProgress', { count: inProgress }),`
);

content = content.replace(
    /ordersDetail:\s*`\$\{reviewCount\}\s*\$\{t\('admin\.dashboard\.needReview'\)\}`,/g,
    `ordersDetail: t('admin.dashboard.needReview', { count: reviewCount }),`
);

content = content.replace(
    /conversionDetail:\s*`\$\{completedLeads\} of \$\{totalLeads\}\s*\$\{t\('admin\.dashboard\.leadsCompleted'\)\}`/g,
    `conversionDetail: t('admin.dashboard.leadsCompleted', { count: \`\${completedLeads} of \${totalLeads}\` as any })`
);

fs.writeFileSync('client/src/pages/admin/Dashboard.tsx', content, 'utf8');
console.log('done');
