import { useState } from 'react';
import { useMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../../hooks/useApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { MenuForm } from '../../components/admin/MenuForm';

export const ManageMenu = () => {
    const { menuItems, categories } = useMenu();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Weet u zeker dat u dit item wilt verwijderen?')) {
            await deleteMenuItem(id);
            menuItems.refetch();
        }
    };

    const handleSubmit = async (data: FormData) => {
        try {
            if (editingItem) {
                await updateMenuItem(editingItem._id, data);
            } else {
                await createMenuItem(data);
            }
            menuItems.refetch();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Er is een fout opgetreden.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Menu Beheer</h2>
                <Button className="gap-2" onClick={handleAdd}>
                    <Plus size={20} />
                    Nieuw Item
                </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                {categories.data?.map((cat: any) => (
                    <Card key={cat._id} className="bg-tamil-maroon text-white">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-xs uppercase font-bold opacity-70">{cat.type}</p>
                                <h4 className="font-bold text-lg">{cat.name}</h4>
                            </div>
                            <Edit size={16} className="opacity-50" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                                <tr className="text-left font-bold">
                                    <th className="px-6 py-4">Naam</th>
                                    <th className="px-6 py-4">Categorie</th>
                                    <th className="px-6 py-4">Prijs</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Acties</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {menuItems.data?.map((item: any) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
                                                    <img src={item.image} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold truncate max-w-[150px]">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{item.categoryId?.name}</td>
                                        <td className="px-6 py-4 font-bold">€{item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={item.stockCount < 10 ? 'text-orange-600 font-bold' : ''}>
                                                {item.stockCount} op voorraad
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.available ? (
                                                <span className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase">
                                                    <Eye size={14} /> Actief
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-400 font-bold text-[10px] uppercase">
                                                    <EyeOff size={14} /> Onzichtbaar
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-100 rounded text-gray-500"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && (
                <MenuForm
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    initialData={editingItem}
                />
            )}
        </div>
    );
};
