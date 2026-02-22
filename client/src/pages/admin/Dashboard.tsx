import { Card, CardContent } from '../../components/ui/Card';
import { Users, Euro, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
                <StatCard title="Totale Omzet" value="€ 4.250,00" icon={<Euro />} detail="+12% t.o.v. vorige maand" />
                <StatCard title="Nieuwe Leads" value="28" icon={<Users />} detail="8 vandaag" />
                <StatCard title="Conversie Rate" value="3.8%" icon={<TrendingUp />} detail="+0.5%" />
            </div>

            <div className="grid lg:grid-cols-1 gap-8">

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
