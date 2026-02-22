import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { getCateringPackage, createCateringOrder } from '../hooks/useApi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight, ChevronLeft, Users, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';

interface Choice { name: string; priceModifier: number; }
interface Item { name: string; description: string; basePrice: number; choices: Choice[]; }
interface Category { name: string; description: string; minSelect: number; maxSelect: number; items: Item[]; }
interface Package {
    _id: string; name: string; description: string; basePrice: number;
    minGuests: number; maxGuests?: number; categories: Category[];
}

interface SelectedItemState {
    itemName: string;
    choiceName?: string;
    price: number;
}

type Selections = Record<string, SelectedItemState[]>; // categoryName → selectedItems

export const CateringCheckoutPage = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0); // 0=selections, 1=details, 2=review
    const [selections, setSelections] = useState<Selections>({});
    const [guests, setGuests] = useState(50);
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [activeCatIdx, setActiveCatIdx] = useState(0);

    useEffect(() => {
        if (!packageId) { navigate('/catering'); return; }
        const load = async () => {
            try {
                const data = await getCateringPackage(packageId);
                setPkg(data);
                setGuests(data.minGuests);
                // Initialize selections
                const init: Selections = {};
                data.categories.forEach((cat: Category) => { init[cat.name] = []; });
                setSelections(init);
            } catch { toast.error('Package not found'); navigate('/catering'); }
            finally { setLoading(false); }
        };
        load();
    }, [packageId, navigate]);

    // Toggle item selection
    const toggleItem = (cat: Category, item: Item, choiceName?: string) => {
        const catSels = selections[cat.name] || [];
        const existingIdx = catSels.findIndex(s => s.itemName === item.name);

        if (existingIdx >= 0) {
            // Check if just changing choice
            if (choiceName !== undefined && catSels[existingIdx].choiceName !== choiceName) {
                const choice = item.choices.find(c => c.name === choiceName);
                const updated = [...catSels];
                updated[existingIdx] = {
                    itemName: item.name,
                    choiceName,
                    price: item.basePrice + (choice?.priceModifier || 0),
                };
                setSelections({ ...selections, [cat.name]: updated });
            } else {
                // Deselect
                setSelections({ ...selections, [cat.name]: catSels.filter((_, i) => i !== existingIdx) });
            }
        } else {
            // Select (check max)
            if (catSels.length >= cat.maxSelect) {
                toast.error(`Maximum ${cat.maxSelect} item(s) allowed for "${cat.name}"`);
                return;
            }
            const choice = choiceName ? item.choices.find(c => c.name === choiceName) : undefined;
            setSelections({
                ...selections,
                [cat.name]: [...catSels, {
                    itemName: item.name,
                    choiceName,
                    price: item.basePrice + (choice?.priceModifier || 0),
                }],
            });
        }
    };

    const isItemSelected = (catName: string, itemName: string) =>
        (selections[catName] || []).some(s => s.itemName === itemName);

    const getSelectedChoice = (catName: string, itemName: string) =>
        (selections[catName] || []).find(s => s.itemName === itemName)?.choiceName;

    // Price calculation
    const pricePerPerson = useMemo(() => {
        if (!pkg) return 0;
        let total = pkg.basePrice;
        Object.values(selections).forEach(items => {
            items.forEach(item => { total += item.price; });
        });
        return total;
    }, [pkg, selections]);

    const totalPrice = pricePerPerson * guests;

    // Validation
    const selectionErrors = useMemo(() => {
        if (!pkg) return [];
        const errors: string[] = [];
        pkg.categories.forEach(cat => {
            const count = (selections[cat.name] || []).length;
            if (count < cat.minSelect) {
                errors.push(`"${cat.name}" requires at least ${cat.minSelect} selection(s) (${count} selected)`);
            }
        });
        return errors;
    }, [pkg, selections]);

    const canProceedFromSelections = selectionErrors.length === 0;

    const canSubmit = customerInfo.name.length >= 2 && customerInfo.email.includes('@') &&
        customerInfo.phone.length >= 10 && eventDate && guests > 0;

    const handleSubmit = async () => {
        if (!pkg || !canSubmit) return;
        setSubmitting(true);
        try {
            const orderData = {
                packageId: pkg._id,
                selections: Object.entries(selections).map(([categoryName, selectedItems]) => ({
                    categoryName,
                    selectedItems,
                })),
                guests,
                eventDate,
                eventLocation,
                customerInfo,
            };
            await createCateringOrder(orderData);
            toast.success('Order placed successfully! We will contact you shortly.');
            navigate('/catering');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to place order');
        } finally { setSubmitting(false); }
    };

    if (loading) {
        return (
            <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-lg">Loading package...</div>
            </div>
        );
    }

    if (!pkg) return null;

    return (
        <div className="pt-24 pb-24">
            <SEO title={`${pkg.name} - Catering`} description={`Customize your ${pkg.name} catering package.`} />

            {/* Progress Indicator */}
            <section className="bg-tamil-charcoal text-white py-8">
                <Container>
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {['Choose Items', 'Event Details', 'Review & Order'].map((label, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                                    ${step >= i ? 'bg-tamil-gold text-tamil-charcoal' : 'bg-white/10 text-gray-500'}`}>
                                    {step > i ? <CheckCircle size={20} /> : i + 1}
                                </div>
                                <span className={`text-sm font-medium hidden md:inline ${step >= i ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                                {i < 2 && <ChevronRight size={18} className="text-gray-500 mx-2 hidden md:inline" />}
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-6">
                        <h1 className="text-3xl font-bold">{pkg.name}</h1>
                        <p className="text-gray-400 mt-1">{pkg.description}</p>
                    </div>
                </Container>
            </section>

            <Container className="mt-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {step === 0 && (
                                <motion.div key="selections" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    {/* Category Navigator */}
                                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                        {pkg.categories.map((cat, idx) => {
                                            const count = (selections[cat.name] || []).length;
                                            const isValid = count >= cat.minSelect;
                                            return (
                                                <button key={idx} onClick={() => setActiveCatIdx(idx)}
                                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all
                                                        ${activeCatIdx === idx ? 'bg-tamil-maroon text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                                                        ${isValid && activeCatIdx !== idx ? 'ring-2 ring-green-400' : ''}`}>
                                                    {cat.name}
                                                    <span className="ml-2 text-xs opacity-70">{count}/{cat.maxSelect}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Active Category Items */}
                                    {pkg.categories[activeCatIdx] && (() => {
                                        const cat = pkg.categories[activeCatIdx];
                                        return (
                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <h2 className="text-xl font-bold">{cat.name}</h2>
                                                        {cat.description && <p className="text-gray-500 text-sm">{cat.description}</p>}
                                                    </div>
                                                    <span className="text-sm text-gray-400">
                                                        Select {cat.minSelect}{cat.minSelect !== cat.maxSelect ? `–${cat.maxSelect}` : ''} item(s)
                                                    </span>
                                                </div>

                                                <div className="grid gap-3">
                                                    {cat.items.map((item, iIdx) => {
                                                        const selected = isItemSelected(cat.name, item.name);
                                                        const selectedChoice = getSelectedChoice(cat.name, item.name);
                                                        return (
                                                            <Card key={iIdx} className={`cursor-pointer transition-all ${selected ? 'ring-2 ring-tamil-maroon shadow-md' : 'hover:shadow-sm'}`}>
                                                                <CardContent className="p-4">
                                                                    <div className="flex justify-between items-start" onClick={() => item.choices.length === 0 ? toggleItem(cat, item) : undefined}>
                                                                        <div className="flex items-start gap-3 flex-grow">
                                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                                                                                ${selected ? 'border-tamil-maroon bg-tamil-maroon' : 'border-gray-300'}`}
                                                                                onClick={(e) => { e.stopPropagation(); if (item.choices.length === 0) toggleItem(cat, item); }}>
                                                                                {selected && <CheckCircle size={14} className="text-white" />}
                                                                            </div>
                                                                            <div>
                                                                                <h3 className="font-bold">{item.name}</h3>
                                                                                {item.description && <p className="text-gray-500 text-sm mt-0.5">{item.description}</p>}
                                                                            </div>
                                                                        </div>
                                                                        {item.basePrice > 0 && (
                                                                            <span className="text-tamil-maroon font-bold text-sm whitespace-nowrap ml-4">
                                                                                +€{item.basePrice.toFixed(2)} p.p.
                                                                            </span>
                                                                        )}
                                                                        {item.basePrice === 0 && (
                                                                            <span className="text-green-600 font-bold text-xs whitespace-nowrap ml-4">
                                                                                Included
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Choice options */}
                                                                    {item.choices.length > 0 && (
                                                                        <div className="mt-3 pl-9 flex flex-wrap gap-2">
                                                                            {item.choices.map((choice, cIdx) => (
                                                                                <button key={cIdx}
                                                                                    onClick={() => toggleItem(cat, item, choice.name)}
                                                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all
                                                                                        ${selected && selectedChoice === choice.name
                                                                                            ? 'bg-tamil-maroon text-white'
                                                                                            : 'bg-gray-100 text-gray-600 hover:bg-tamil-maroon/10'}`}>
                                                                                    {choice.name}
                                                                                    {choice.priceModifier > 0 && <span className="ml-1 opacity-70">+€{choice.priceModifier.toFixed(2)}</span>}
                                                                                    {choice.priceModifier < 0 && <span className="ml-1 opacity-70">-€{Math.abs(choice.priceModifier).toFixed(2)}</span>}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>

                                                {/* Category navigation */}
                                                <div className="flex justify-between mt-6">
                                                    <Button variant="outline" disabled={activeCatIdx === 0} onClick={() => setActiveCatIdx(activeCatIdx - 1)} className="gap-2">
                                                        <ChevronLeft size={18} />Previous
                                                    </Button>
                                                    {activeCatIdx < pkg.categories.length - 1 ? (
                                                        <Button onClick={() => setActiveCatIdx(activeCatIdx + 1)} className="gap-2">
                                                            Next<ChevronRight size={18} />
                                                        </Button>
                                                    ) : (
                                                        <Button disabled={!canProceedFromSelections} onClick={() => setStep(1)} className="gap-2">
                                                            Continue to Details<ArrowRight size={18} />
                                                        </Button>
                                                    )}
                                                </div>

                                                {selectionErrors.length > 0 && activeCatIdx === pkg.categories.length - 1 && (
                                                    <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                                                        <p className="text-red-700 text-sm font-bold mb-1">Please complete your selections:</p>
                                                        {selectionErrors.map((err, i) => <p key={i} className="text-red-600 text-xs">• {err}</p>)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 className="text-2xl font-bold mb-6">Event & Contact Details</h2>
                                    <Card>
                                        <CardContent className="p-6 space-y-5">
                                            <div className="grid md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Name *</label>
                                                    <input value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                        className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email *</label>
                                                    <input type="email" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                                        className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" />
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Phone *</label>
                                                    <input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                        className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Users size={14} />Number of Guests *</label>
                                                    <input type="number" value={guests} onChange={e => setGuests(parseInt(e.target.value) || 0)}
                                                        min={pkg.minGuests} max={pkg.maxGuests || 9999}
                                                        className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" />
                                                    <span className="text-[10px] text-gray-400 mt-1">Min {pkg.minGuests}{pkg.maxGuests ? `, max ${pkg.maxGuests}` : ''}</span>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Calendar size={14} />Event Date *</label>
                                                    <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                                                        className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1"><MapPin size={14} />Event Location</label>
                                                    <input value={eventLocation} onChange={e => setEventLocation(e.target.value)}
                                                        className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none" placeholder="Address or venue name" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Notes (optional)</label>
                                                <textarea value={customerInfo.notes} onChange={e => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                                    className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none min-h-[80px]"
                                                    placeholder="Dietary requirements, special requests..." />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <div className="flex justify-between mt-6">
                                        <Button variant="outline" onClick={() => setStep(0)} className="gap-2"><ChevronLeft size={18} />Back to Items</Button>
                                        <Button disabled={!canSubmit} onClick={() => setStep(2)} className="gap-2">Review Order<ArrowRight size={18} /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

                                    {/* Selections Summary */}
                                    <Card className="mb-4">
                                        <CardContent className="p-6">
                                            <h3 className="font-bold text-lg mb-4">Your Selections</h3>
                                            <div className="space-y-4">
                                                {Object.entries(selections).map(([catName, items]) => (
                                                    items.length > 0 && (
                                                        <div key={catName}>
                                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{catName}</h4>
                                                            <div className="space-y-1">
                                                                {items.map((item, i) => (
                                                                    <div key={i} className="flex justify-between text-sm py-1">
                                                                        <span>
                                                                            {item.itemName}
                                                                            {item.choiceName && <span className="text-gray-400 ml-1">({item.choiceName})</span>}
                                                                        </span>
                                                                        <span className="text-gray-500">
                                                                            {item.price > 0 ? `+€${item.price.toFixed(2)} p.p.` : 'Included'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Event Details Summary */}
                                    <Card className="mb-4">
                                        <CardContent className="p-6">
                                            <h3 className="font-bold text-lg mb-4">Event Details</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-gray-500">Name:</span> <strong>{customerInfo.name}</strong></div>
                                                <div><span className="text-gray-500">Email:</span> <strong>{customerInfo.email}</strong></div>
                                                <div><span className="text-gray-500">Phone:</span> <strong>{customerInfo.phone}</strong></div>
                                                <div><span className="text-gray-500">Guests:</span> <strong>{guests}</strong></div>
                                                <div><span className="text-gray-500">Date:</span> <strong>{eventDate}</strong></div>
                                                {eventLocation && <div><span className="text-gray-500">Location:</span> <strong>{eventLocation}</strong></div>}
                                            </div>
                                            {customerInfo.notes && <p className="text-sm text-gray-500 mt-3"><strong>Notes:</strong> {customerInfo.notes}</p>}
                                        </CardContent>
                                    </Card>

                                    <div className="flex justify-between mt-6">
                                        <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ChevronLeft size={18} />Back</Button>
                                        <Button onClick={handleSubmit} disabled={submitting} className="gap-2 px-8 py-3 text-lg">
                                            {submitting ? 'Placing Order...' : 'Place Order'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Price Sidebar */}
                    <div>
                        <Card className="sticky top-32">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4">Price Summary</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Base price</span>
                                        <span>€{pkg.basePrice.toFixed(2)} p.p.</span>
                                    </div>

                                    {Object.entries(selections).map(([catName, items]) =>
                                        items.filter(i => i.price > 0).map((item, i) => (
                                            <div key={`${catName}-${i}`} className="flex justify-between text-xs">
                                                <span className="text-gray-400 truncate max-w-[180px]">
                                                    + {item.itemName}{item.choiceName ? ` (${item.choiceName})` : ''}
                                                </span>
                                                <span className="text-gray-500">€{item.price.toFixed(2)}</span>
                                            </div>
                                        ))
                                    )}

                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between font-bold">
                                            <span>Per person</span>
                                            <span className="text-tamil-maroon">€{pricePerPerson.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-gray-500">
                                        <span>× {guests} guests</span>
                                    </div>

                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Total</span>
                                            <span className="text-tamil-maroon">€{totalPrice.toFixed(2)}</span>
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
