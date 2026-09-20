p = r'C:\Users\thanu\Documents\tamilfoodthaya\client\src\pages\admin\ManageLeads.tsx'
data = open(p, encoding='utf-8').read()
for k in ['admin.leads.package', 'admin.leads.guests', 'admin.leads.noRequests',
          'admin.leads.statusUpdated', 'admin.leads.updateFailed', 'admin.common.source',
          'admin.common.status', 'admin.common.actions', 'admin.common.search',
          'admin.common.delete', 'admin.common.edit']:
    print(k, '->', data.count(k))
