import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Download, ExternalLink } from 'lucide-react';

export const ManageOrders = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Bestellingen Overzicht</h2>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download size={18} />
                        CSV Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-grow relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                placeholder="Zoek op order ID of klantnaam..."
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select className="px-4 py-2 border rounded-md outline-none">
                                <option>Alle Statussen</option>
                                <option>Bereiden</option>
                                <option>Betaald</option>
                                <option>Klaar</option>
                            </select>
                            <Button variant="outline"><Filter size={18} /></Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">ID</th>
                                    <th className="px-6 py-4 text-left">Klant</th>
                                    <th className="px-6 py-4 text-left">Items</th>
                                    <th className="px-6 py-4 text-left">Totaal</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-right">Actie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <OrderRow id="#12345" customer="J. de Vries" items="2x Mutton Kottu, 1x Mango Lassi" total="€ 42,50" status="Bereiden" color="text-blue-600 bg-blue-50" />
                                <OrderRow id="#12344" customer="A. Tamil" items="4x Chicken 65, 2x Masala Dosa" total="€ 58,00" status="Betaald" color="text-green-600 bg-green-50" />
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const OrderRow = ({ id, customer, items, total, status, color }: any) => (
    <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 font-bold text-gray-400">{id}</td>
        <td className="px-6 py-4">
            <div className="font-bold">{customer}</div>
            <div className="text-[10px] text-gray-400 uppercase">Vandaag, 18:30 afhalen</div>
        </td>
        <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{items}</td>
        <td className="px-6 py-4 font-bold">{total}</td>
        <td className="px-6 py-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
                {status}
            </span>
        </td>
        <td className="px-6 py-4 text-right">
            <button className="text-tamil-maroon hover:underline font-bold text-xs flex items-center gap-1 justify-end ml-auto">
                Details <ExternalLink size={14} />
            </button>
        </td>
    </tr>
);
