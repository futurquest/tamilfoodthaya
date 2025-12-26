import { Card, CardContent } from '../../components/ui/Card';
import { ShoppingCart, Users, Euro, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
                <StatCard title="Totale Omzet" value="€ 4.250,00" icon={<Euro />} detail="+12% t.o.v. vorige maand" />
                <StatCard title="Bestellingen" value="142" icon={<ShoppingCart />} detail="12 ongelezen" />
                <StatCard title="Nieuwe Leads" value="28" icon={<Users />} detail="8 vandaag" />
                <StatCard title="Conversie Rate" value="3.8%" icon={<TrendingUp />} detail="+0.5%" />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h4 className="font-bold">Recente Bestellingen</h4>
                        <button className="text-tamil-maroon text-sm font-bold">Bekijk alles</button>
                    </div>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Order ID</th>
                                        <th className="px-6 py-4 text-left">Klant</th>
                                        <th className="px-6 py-4 text-left">Datum</th>
                                        <th className="px-6 py-4 text-left">Bedrag</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <TableRow id="#12345" customer="J. de Vries" date="24 Dec, 18:30" amount="€ 45,50" status="Bereiden" color="text-blue-600 bg-blue-50" />
                                    <TableRow id="#12344" customer="A. Tamil" date="24 Dec, 17:15" amount="€ 82,00" status="Betaald" color="text-green-600 bg-green-50" />
                                    <TableRow id="#12343" customer="M. van Dijk" date="23 Dec, 20:50" amount="€ 12,50" status="Klaar" color="text-purple-600 bg-purple-50" />
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h4 className="font-bold">Catering Leads (Nieuw)</h4>
                        <button className="text-tamil-maroon text-sm font-bold">Bekijk alles</button>
                    </div>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            <LeadRow name="Sarah Miller" event="Bruiloft" date="15 Aug 2026" guests="150" status="Nieuw" />
                            <LeadRow name="Robert Janssen" event="Bedrijfsfeest" date="12 Sep 2025" guests="60" status="Nieuw" />
                            <LeadRow name="Anjali Kumar" event="Verjaardag" date="28 Jan 2025" guests="25" status="In Behandeling" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, detail }: any) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-tamil-maroon/10 text-tamil-maroon rounded-lg">{icon}</div>
                <span className="text-sm font-medium text-gray-500">{title}</span>
            </div>
            <div className="text-3xl font-bold text-tamil-charcoal mb-1">{value}</div>
            <div className="text-[10px] font-bold text-green-600 uppercase tracking-wide">{detail}</div>
        </CardContent>
    </Card>
);

const TableRow = ({ id, customer, date, amount, status, color }: any) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 font-bold text-gray-500">{id}</td>
        <td className="px-6 py-4 font-semibold">{customer}</td>
        <td className="px-6 py-4 text-gray-400">{date}</td>
        <td className="px-6 py-4 font-bold">{amount}</td>
        <td className="px-6 py-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
                {status}
            </span>
        </td>
    </tr>
);

const LeadRow = ({ name, event, date, guests, status }: any) => (
    <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">{name[0]}</div>
            <div>
                <h5 className="font-bold text-sm">{name}</h5>
                <p className="text-xs text-gray-400">{event} • {date}</p>
            </div>
        </div>
        <div className="text-right">
            <div className="text-xs font-bold text-tamil-maroon">{guests} gasten</div>
            <div className="text-[10px] uppercase text-gray-400 mt-1 font-bold">{status}</div>
        </div>
    </div>
);
