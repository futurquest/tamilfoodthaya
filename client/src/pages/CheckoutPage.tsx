import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../hooks/useApi';
import { SEO } from '../components/SEO';

const checkoutSchema = z.object({
    name: z.string().min(2, 'Naam is verplicht'),
    email: z.string().email('Ongeldig e-mailadres'),
    phone: z.string().min(10, 'Ongeldig telefoonnummer'),
    pickupTime: z.string().min(1, 'Selecteer een tijdstip'),
    notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
    const { cart, total, clearCart } = useCart();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema)
    });

    const onSubmit = async (data: CheckoutForm) => {
        try {
            const order = {
                items: cart,
                total,
                customerInfo: data,
                pickupTime: new Date(data.pickupTime),
            };

            const response = await createOrder(order);
            if (response.url) {
                clearCart();
                window.location.href = response.url; // Redirect to Stripe
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Er is een fout opgetreden bij het verwerken van uw bestelling.');
        }
    };

    if (cart.length === 0) {
        navigate('/menu');
        return null;
    }

    return (
        <div className="pt-32 pb-24 bg-gray-50 min-h-screen">
            <SEO title="Afrekenen" description="Voltooi uw bestelling bij Tamil Food Thaya." />
            <Container>
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* ... keeping the rest same ... */}
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-bold mb-8">Gegevens & Ophalen</h1>
                        <Card>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputField label="Volledige Naam" name="name" register={register} error={errors.name?.message} />
                                        <InputField label="E-mailadres" name="email" type="email" register={register} error={errors.email?.message} />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputField label="Telefoonnummer" name="phone" register={register} error={errors.phone?.message} />
                                        <InputField label="Ophaaltijdstip" name="pickupTime" type="datetime-local" register={register} error={errors.pickupTime?.message} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-tamil-charcoal mb-2 uppercase tracking-wide">Opmerkingen (optioneel)</label>
                                        <textarea
                                            {...register('notes')}
                                            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-tamil-maroon outline-none min-h-[100px]"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full py-4 text-lg" disabled={isSubmitting}>
                                        {isSubmitting ? 'Bezig...' : 'Doorgaan naar Betalen (iDEAL)'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-8 text-tamil-charcoal">Besteloverzicht</h2>
                        <Card className="sticky top-32">
                            <CardContent className="p-6">
                                <div className="space-y-4 mb-6">
                                    {cart.map((item) => (
                                        <div key={item.menuItemId} className="flex justify-between items-start text-sm">
                                            <div className="flex-grow">
                                                <span className="font-bold">{item.quantity}x</span> {item.name}
                                            </div>
                                            <span className="font-semibold ml-4">€{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotaal</span>
                                        <span>€{total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Btw (9%)</span>
                                        <span>€{(total * 0.09).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold border-t pt-4 mt-4">
                                        <span>Totaal</span>
                                        <span>€{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    );
};

const InputField = ({ label, name, type = 'text', register, error }: any) => (
    <div>
        <label className="block text-sm font-bold text-tamil-charcoal mb-2 uppercase tracking-wide">{label}</label>
        <input
            type={type}
            {...register(name)}
            className={`w-full px-4 py-3 rounded-md border ${error ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-tamil-maroon outline-none transition-all`}
        />
        {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
);
