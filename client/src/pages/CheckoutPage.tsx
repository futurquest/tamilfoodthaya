import { useEffect, useMemo, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    ShoppingBag,
    ShieldCheck
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';

const checkoutSchema = z.object({
    name: z.string().min(2, 'Naam is verplicht'),
    email: z.string().email('Ongeldig e-mailadres'),
    phone: z.string().min(10, 'Ongeldig telefoonnummer'),
    pickupTime: z.string().min(1, 'Selecteer een tijdstip'),
    notes: z.string().optional()
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
    const { cart, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            pickupTime: '',
            notes: ''
        }
    });

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/menu');
        }
    }, [cart.length, navigate]);

    const minPickupTime = useMemo(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }, []);

    const vatAmount = total * 0.09;

    const onSubmit = async (data: CheckoutForm) => {
        try {
            const order = {
                items: cart,
                total,
                customerInfo: data,
                pickupTime: new Date(data.pickupTime)
            };

            const response = await createOrder(order);

            if (response?.url) {
                clearCart();
                window.location.href = response.url;
                return;
            }

            alert('Geen betaal-link ontvangen. Probeer het opnieuw.');
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Er is een fout opgetreden bij het verwerken van uw bestelling.');
        }
    };

    if (cart.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white font-sans pt-28 pb-16">
            <SEO
                title="Afrekenen"
                description="Voltooi uw bestelling bij Tamil Food Thaya."
            />

            <Container>
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="border border-gray-200 bg-white rounded-2xl p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Checkout
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold text-gray-900">
                                    Afrekenen
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Vul uw gegevens in en kies een ophaaltijdstip om uw bestelling af te ronden.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <SmallStat label="Items" value={cart.length} />
                                <SmallStat label="Btw" value={`€${vatAmount.toFixed(2)}`} />
                                <SmallStat label="Totaal" value={`€${total.toFixed(2)}`} />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <Card className="border border-gray-200 rounded-2xl bg-white shadow-none">
                            <CardContent className="p-6">
                                <SectionTitle
                                    title="Klantgegevens"
                                    subtitle="Gebruik uw juiste gegevens voor bevestiging en afhalen."
                                />

                                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <InputField
                                            label="Volledige naam"
                                            icon={<User size={16} />}
                                            error={errors.name?.message}
                                            registration={register('name')}
                                            placeholder="Uw volledige naam"
                                        />

                                        <InputField
                                            label="E-mailadres"
                                            type="email"
                                            icon={<Mail size={16} />}
                                            error={errors.email?.message}
                                            registration={register('email')}
                                            placeholder="naam@email.com"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <InputField
                                            label="Telefoonnummer"
                                            icon={<Phone size={16} />}
                                            error={errors.phone?.message}
                                            registration={register('phone')}
                                            placeholder="Uw telefoonnummer"
                                        />

                                        <InputField
                                            label="Ophaaltijdstip"
                                            type="datetime-local"
                                            icon={<Calendar size={16} />}
                                            error={errors.pickupTime?.message}
                                            registration={register('pickupTime')}
                                            min={minPickupTime}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Opmerkingen
                                        </label>

                                        <div
                                            className={`rounded-xl border bg-white px-4 py-3 ${
                                                errors.notes
                                                    ? 'border-red-300'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                                <FileText size={16} />
                                                <span className="text-xs uppercase tracking-wide">
                                                    Extra info
                                                </span>
                                            </div>

                                            <textarea
                                                {...register('notes')}
                                                placeholder="Bijvoorbeeld allergieën, extra wensen of opmerking voor afhalen..."
                                                className="min-h-[120px] w-full resize-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600">
                                                <ShieldCheck size={18} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Veilige betaling
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    U wordt doorgestuurd naar de betaalpagina om uw bestelling af te ronden.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-11 w-full rounded-xl bg-black text-white hover:bg-gray-900 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Bezig...' : 'Doorgaan naar betalen'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 rounded-2xl bg-white shadow-none">
                            <CardContent className="p-6">
                                <SectionTitle
                                    title="Besteloverzicht"
                                    subtitle="Controleer uw bestelling voordat u betaalt."
                                />

                                <div className="mt-6 space-y-3">
                                    {cart.map((item) => (
                                        <div
                                            key={item.menuItemId}
                                            className="rounded-xl border border-gray-200 bg-white p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.quantity}x {item.name}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-sm font-semibold text-gray-900">
                                                    €{(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <SummaryRow
                                        label="Subtotaal"
                                        value={`€${total.toFixed(2)}`}
                                    />
                                    <SummaryRow
                                        label="Btw (9%, inbegrepen)"
                                        value={`€${vatAmount.toFixed(2)}`}
                                    />
                                    <div className="mt-3 border-t border-gray-200 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-semibold text-gray-900">
                                                Totaal
                                            </span>
                                            <span className="text-2xl font-semibold text-gray-900">
                                                €{total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
                                            <ShoppingBag size={18} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Afhaalbestelling
                                            </p>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Kies een tijdstip dat voor u past. Daarna gaat u verder naar betaling.
                                            </p>
                                        </div>
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

const SmallStat = ({
    label,
    value
}: {
    label: string;
    value: string | number;
}) => {
    return (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
        </div>
    );
};

const SectionTitle = ({
    title,
    subtitle
}: {
    title: string;
    subtitle: string;
}) => {
    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>
    );
};

const SummaryRow = ({
    label,
    value
}: {
    label: string;
    value: string;
}) => {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
    );
};

const InputField = ({
    label,
    type = 'text',
    icon,
    error,
    registration,
    placeholder,
    min
}: {
    label: string;
    type?: string;
    icon?: ReactNode;
    error?: string;
    registration: any;
    placeholder?: string;
    min?: string;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <div
                className={`relative rounded-xl border bg-white ${
                    error ? 'border-red-300' : 'border-gray-300'
                }`}
            >
                {icon && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}

                <input
                    type={type}
                    min={min}
                    placeholder={placeholder}
                    {...registration}
                    className={`h-11 w-full rounded-xl bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 ${
                        icon ? 'pl-10 pr-4' : 'px-4'
                    }`}
                />
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
};