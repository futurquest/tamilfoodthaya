import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { getCateringPackage, createCateringOrder, api } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight, ChevronLeft, Users, Calendar, MapPin, ArrowRight, Music, Flower2, Wine, Baby, Camera, Tag, X } from 'lucide-react';
import { SEO } from '../components/SEO';

interface Choice { name: string; priceModifier: number; }
interface MenuItem { _id: string; name: string; description: string; price: number; choices: Choice[]; image?: string; }
interface Item { menuItem: MenuItem; }
interface Category { name: string; description: string; minSelect: number; maxSelect: number; items: Item[]; }
interface Package {
    _id: string; name: string; description: string; basePrice: number;
    minGuests: number; maxGuests?: number; categories: Category[];
}

interface SelectedItemState {
    itemId: string;
    itemName: string;
    choiceName?: string;
    price: number;
}

interface Addon {
    _id: string; name: string; description: string; price: number; pricingType: 'fixed' | 'per_person'; category: string;
}

const ADDON_ICONS: Record<string, React.ReactNode> = {
    entertainment: <Music size={20} className="text-purple-400" />,
    decoration: <Flower2 size={20} className="text-pink-400" />,
    service: <Wine size={20} className="text-blue-400" />,
    extra_time: <Baby size={20} className="text-green-400" />,
    other: <Camera size={20} className="text-gold-400" />,
};

type Selections = Record<string, SelectedItemState[]>;

export const CateringCheckoutPage = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] || 'nl';
    const getLabel = (translations: any, fallback: string | undefined) => translations?.[currentLang] || translations?.nl || fallback || '';

    const [pkg, setPkg] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0); // 0=menu selections, 1=add-ons, 2=details, 3=review
    const [selections, setSelections] = useState<Selections>({});
    const [guests, setGuests] = useState(50);
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', notes: '' });
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [activeCatIdx, setActiveCatIdx] = useState(0);
    // Add-ons
    const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
    const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());
    // Coupon
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState<{ code: string; discountValue: number; discountType: string } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    useEffect(() => {
        if (!packageId) { navigate('/catering'); return; }
        const load = async () => {
            try {
                const data = await getCateringPackage(packageId);
                setPkg(data);
                setGuests(data.minGuests);
                const init: Selections = {};
                data.categories.forEach((cat: Category) => { init[cat.name] = []; });
                setSelections(init);
            } catch { toast.error('Package not found'); navigate('/catering'); }
            finally { setLoading(false); }
        };
        load();
        // Load add-ons
        api.get('/addons').then(r => {
            const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
            setAvailableAddons(data);
        }).catch(() => { });
    }, [packageId, navigate]);

    // Pre-fill user info if logged in
    useEffect(() => {
        if (user) {
            setCustomerInfo(prev => ({
                ...prev,
                name: prev.name || user.name || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || '',
            }));
        }
    }, [user]);

    // Toggle item selection
    const toggleItem = (cat: Category, itemObj: Item, choiceName?: string) => {
        const menuItem = itemObj.menuItem;
        if (!menuItem) return;

        const catSels = selections[cat.name] || [];
        const existingIdx = catSels.findIndex(s => s.itemName === menuItem.name);

        if (existingIdx >= 0) {
            // Check if just changing choice
            if (choiceName !== undefined && catSels[existingIdx].choiceName !== choiceName) {
                const choice = menuItem.choices?.find(c => c.name === choiceName);
                const updated = [...catSels];
                updated[existingIdx] = {
                    itemId: menuItem._id,
                    itemName: menuItem.name,
                    choiceName,
                    price: menuItem.price + (choice?.priceModifier || 0),
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
            const choice = choiceName ? menuItem.choices?.find(c => c.name === choiceName) : undefined;
            setSelections({
                ...selections,
                [cat.name]: [...catSels, {
                    itemId: menuItem._id,
                    itemName: menuItem.name,
                    choiceName,
                    price: menuItem.price + (choice?.priceModifier || 0),
                }],
            });
        }
    };

    const isItemSelected = (catName: string, itemName: string) =>
        (selections[catName] || []).some(s => s.itemName === itemName);

    const getSelectedChoice = (catName: string, itemName: string) =>
        (selections[catName] || []).find(s => s.itemName === itemName)?.choiceName;

    // Add-on helpers
    const toggleAddon = (id: string) => {
        setSelectedAddonIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const selectedAddons = availableAddons.filter(a => selectedAddonIds.has(a._id));

    // Coupon
    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const res = await api.post('/coupons/validate', { code: couponCode.trim(), orderTotal: totalPriceBeforeDiscount });
            setCouponApplied({ code: res.data.code, discountValue: res.data.discountValue, discountType: res.data.discountType });
            toast.success(`Coupon applied!`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Invalid coupon');
        } finally { setCouponLoading(false); }
    };
    const removeCoupon = () => { setCouponApplied(null); setCouponCode(''); };

    // Price calculation
    const pricePerPerson = useMemo(() => {
        if (!pkg) return 0;
        let total = pkg.basePrice;
        Object.values(selections).forEach(items => {
            items.forEach(item => { total += item.price; });
        });
        return total;
    }, [pkg, selections]);

    // Add-on total (fixed or per_person)
    const addonTotal = useMemo(() => {
        return selectedAddons.reduce((sum, a) => sum + (a.pricingType === 'per_person' ? a.price * guests : a.price), 0);
    }, [selectedAddons, guests]);

    const totalPriceBeforeDiscount = pricePerPerson * guests + addonTotal;

    const couponDiscount = useMemo(() => {
        if (!couponApplied) return 0;
        if (couponApplied.discountType === 'percentage') {
            return Math.round((totalPriceBeforeDiscount * couponApplied.discountValue / 100) * 100) / 100;
        }
        return Math.min(couponApplied.discountValue, totalPriceBeforeDiscount);
    }, [totalPriceBeforeDiscount, couponApplied]);

    const totalPrice = Math.max(0, totalPriceBeforeDiscount - couponDiscount);

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

    const canSubmit = (user || (customerInfo.name.length >= 2 && customerInfo.email.includes('@') && customerInfo.phone.length >= 10)) &&
        eventDate && guests > 0;

    const handleSubmit = async () => {
        if (!pkg || !canSubmit) return;
        setSubmitting(true);
        try {
            const orderData = {
                packageId: pkg._id,
                selections: Object.entries(selections).map(([categoryName, selectedItems]) => ({ categoryName, selectedItems })),
                addons: selectedAddons.map(a => ({ addonId: a._id, name: a.name, price: a.price, pricingType: a.pricingType })),
                couponCode: couponApplied?.code,
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
        <div className="pt-24 pb-24 bg-dark-900 text-white min-h-screen">
            <SEO title={`${pkg.name} - Catering`} description={`Customize your ${pkg.name} catering package.`} />

            {/* Progress Indicator */}
            <section className="bg-dark-950 border-b border-dark-800 py-8">
                <Container>
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {['Choose Items', 'Add-ons', 'Event Details', 'Review & Order'].map((label, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                                    ${step >= i ? 'bg-primary-500 text-dark-950' : 'bg-dark-800 text-dark-500 border border-dark-700'}`}>
                                    {step > i ? <CheckCircle size={20} /> : i + 1}
                                </div>
                                <span className={`text-sm font-medium hidden md:inline ${step >= i ? 'text-white' : 'text-dark-500'}`}>{label}</span>
                                {i < 3 && <ChevronRight size={18} className="text-dark-600 mx-2 hidden md:inline" />}
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-6">
                        <h1 className="text-3xl font-bold text-white">{getLabel((pkg as any).nameTranslations, pkg.name)}</h1>
                        <p className="text-dark-400 mt-1">{getLabel((pkg as any).descriptionTranslations, pkg.description)}</p>
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
                                                        ${activeCatIdx === idx ? 'bg-primary-500 text-dark-950' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}
                                                        ${isValid && activeCatIdx !== idx ? 'ring-2 ring-green-500' : ''}`}>
                                                    {getLabel((cat as any).nameTranslations, cat.name)}
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
                                                        <h2 className="text-xl font-bold">{getLabel((cat as any).nameTranslations, cat.name)}</h2>
                                                        {((cat as any).descriptionTranslations || cat.description) && <p className="text-gray-500 text-sm">{getLabel((cat as any).descriptionTranslations, cat.description)}</p>}
                                                    </div>
                                                    <span className="text-sm text-gray-400">
                                                        Select {cat.minSelect}{cat.minSelect !== cat.maxSelect ? `–${cat.maxSelect}` : ''} item(s)
                                                    </span>
                                                </div>

                                                <div className="grid gap-3">
                                                    {cat.items.map((itemObj, iIdx) => {
                                                        const item = itemObj.menuItem;
                                                        if (!item) return null;
                                                        const selected = isItemSelected(cat.name, item.name);
                                                        const selectedChoice = getSelectedChoice(cat.name, item.name);
                                                        return (
                                                            <Card key={iIdx} className={`admin-card cursor-pointer transition-all ${selected ? 'ring-2 ring-primary-500 shadow-md' : 'hover:shadow-sm'}`}>
                                                                <CardContent className="p-4">
                                                                    <div className="flex justify-between items-start" onClick={() => !item.choices || item.choices.length === 0 ? toggleItem(cat, itemObj) : undefined}>
                                                                        <div className="flex items-start gap-3 flex-grow">
                                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                                                                                ${selected ? 'border-primary-500 bg-primary-500' : 'border-dark-600'}`}
                                                                                onClick={(e) => { e.stopPropagation(); if (!item.choices || item.choices.length === 0) toggleItem(cat, itemObj); }}>
                                                                                {selected && <CheckCircle size={14} className="text-white" />}
                                                                            </div>
                                                                            {item.image && (
                                                                                <div className="relative group">
                                                                                    <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                                                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                                                                    </div>
                                                                                    {/* Hover Popout Image */}
                                                                                    <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-200">
                                                                                        <div className="bg-white p-2 rounded-lg shadow-xl border border-gray-100">
                                                                                            <img src={item.image} alt={item.name} className="w-48 h-48 rounded object-cover" />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <h3 className="font-bold text-white">{getLabel((item as any).nameTranslations, item.name)}</h3>
                                                                                {((item as any).descriptionTranslations || item.description) && <p className="text-dark-500 text-sm mt-0.5">{getLabel((item as any).descriptionTranslations, item.description)}</p>}
                                                                            </div>
                                                                        </div>
                                                                        {item.price > 0 && (
                                                                            <span className="text-primary-500 font-bold text-sm whitespace-nowrap ml-4">
                                                                                +€{item.price.toFixed(2)} p.p.
                                                                            </span>
                                                                        )}
                                                                        {item.price === 0 && (
                                                                            <span className="text-green-600 font-bold text-xs whitespace-nowrap ml-4">
                                                                                Included
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Choice options */}
                                                                    {item.choices && item.choices.length > 0 && (
                                                                        <div className="mt-3 pl-9 flex flex-wrap gap-2">
                                                                            {item.choices.map((choice, cIdx) => (
                                                                                <button key={cIdx}
                                                                                    onClick={() => toggleItem(cat, itemObj, choice.name)}
                                                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all
                                                                                        ${selected && selectedChoice === choice.name
                                                                                            ? 'bg-primary-500 text-dark-950'
                                                                                            : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>
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
                                                            Choose Add-ons<ArrowRight size={18} />
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

                            {/* ── Step 1: Add-ons ── */}
                            {step === 1 && (
                                <motion.div key="addons" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 className="text-2xl font-bold mb-2">Optional Add-ons</h2>
                                    <p className="text-gray-500 text-sm mb-6">Select any extras to make your event more special. Prices are reflected in the summary.</p>
                                    {availableAddons.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                                            <p className="font-semibold">No add-ons available yet.</p>
                                            <p className="text-sm mt-1">You can proceed without any extras.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {availableAddons.map(addon => {
                                                const selected = selectedAddonIds.has(addon._id);
                                                return (
                                                    <button
                                                        key={addon._id}
                                                        onClick={() => toggleAddon(addon._id)}
                                                        className={`text-left w-full border rounded-2xl p-4 transition-all duration-200 ${selected ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/50' : 'border-dark-700 bg-dark-800 hover:border-dark-600 hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-primary-500/20' : 'bg-dark-700'}`}>
                                                                    {ADDON_ICONS[addon.category] || ADDON_ICONS.other}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-white">{getLabel((addon as any).nameTranslations, addon.name)}</h4>
                                                                    <p className="text-xs text-dark-400 mt-0.5">{getLabel((addon as any).descriptionTranslations, addon.description)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                                                <div className="text-right">
                                                                    <span className="font-bold text-primary-500">€{addon.price}</span>
                                                                    <span className="text-xs text-dark-500 ml-1">{addon.pricingType === 'per_person' ? '/pp' : 'fixed'}</span>
                                                                </div>
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-primary-500 bg-primary-500' : 'border-dark-600'}`}>
                                                                    {selected && <CheckCircle size={14} className="text-white" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="flex justify-between mt-6">
                                        <Button variant="outline" onClick={() => setStep(0)} className="gap-2"><ChevronLeft size={18} />Back to Items</Button>
                                        <Button onClick={() => setStep(2)} className="gap-2">Continue to Details<ArrowRight size={18} /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 className="text-2xl font-bold mb-6">Event & Contact Details</h2>
                                    <Card className="admin-card">
                                        <CardContent className="p-6 space-y-5">
                                            <div className="grid md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-dark-500 mb-1 uppercase tracking-wider">Full Name *</label>
                                                    <input value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                        placeholder={user?.name || ''}
                                                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 text-white rounded-md focus:ring-2 focus:ring-primary-500 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-dark-500 mb-1 uppercase tracking-wider">Email *</label>
                                                    <input type="email" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                                        placeholder={user?.email || ''}
                                                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 text-white rounded-md focus:ring-2 focus:ring-primary-500 outline-none" />
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-dark-500 mb-1 uppercase tracking-wider">Phone *</label>
                                                    <input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                        placeholder={user?.phone || ''}
                                                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 text-white rounded-md focus:ring-2 focus:ring-primary-500 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-dark-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Users size={14} />Number of Guests *</label>
                                                    <input type="number" value={guests} onChange={e => setGuests(parseInt(e.target.value) || 0)}
                                                        min={pkg.minGuests} max={pkg.maxGuests || 9999}
                                                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 text-white rounded-md focus:ring-2 focus:ring-primary-500 outline-none" />
                                                    <span className="text-[10px] text-dark-400 mt-1">Min {pkg.minGuests}{pkg.maxGuests ? `, max ${pkg.maxGuests}` : ''}</span>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-dark-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Calendar size={14} />Event Date *</label>
                                                    <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 text-white rounded-md focus:ring-2 focus:ring-primary-500 outline-none [color-scheme:dark]" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-dark-500 mb-1 uppercase tracking-wider flex items-center gap-1"><MapPin size={14} />Event Location</label>
                                                    <input value={eventLocation} onChange={e => setEventLocation(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 text-white rounded-md focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Address or venue name" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-dark-500 mb-1 uppercase tracking-wider">Notes (optional)</label>
                                                <textarea value={customerInfo.notes} onChange={e => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 text-white rounded-md focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px]"
                                                    placeholder="Dietary requirements, special requests..." />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <div className="flex justify-between mt-6">
                                        <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ChevronLeft size={18} />Back to Add-ons</Button>
                                        <Button disabled={!canSubmit} onClick={() => setStep(3)} className="gap-2">Review Order<ArrowRight size={18} /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

                                    {/* Selections Summary */}
                                    <Card className="admin-card mb-4">
                                        <CardContent className="p-6">
                                            <h3 className="font-bold text-lg mb-4 text-white">Your Selections</h3>
                                            <div className="space-y-4">
                                                {Object.entries(selections).map(([catName, items]) => (
                                                    items.length > 0 && (
                                                        <div key={catName}>
                                                            <h4 className="text-sm font-bold text-dark-500 uppercase tracking-wider mb-2">{catName}</h4>
                                                            <div className="space-y-1">
                                                                {items.map((item, i) => (
                                                                    <div key={i} className="flex justify-between text-sm py-1">
                                                                        <span className="text-white">
                                                                            {item.itemName}
                                                                            {item.choiceName && <span className="text-dark-500 ml-1">({item.choiceName})</span>}
                                                                        </span>
                                                                        <span className="text-primary-500">
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
                                    <Card className="admin-card mb-4">
                                        <CardContent className="p-6">
                                            <h3 className="font-bold text-lg mb-4 text-white">Event Details</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-dark-400">
                                                <div><span className="text-dark-600">Name:</span> <strong className="text-white">{customerInfo.name || user?.name || ''}</strong></div>
                                                <div><span className="text-dark-600">Email:</span> <strong className="text-white">{customerInfo.email || user?.email || ''}</strong></div>
                                                <div><span className="text-dark-600">Phone:</span> <strong className="text-white">{customerInfo.phone || user?.phone || ''}</strong></div>
                                                <div><span className="text-dark-600">Guests:</span> <strong className="text-white">{guests}</strong></div>
                                                <div><span className="text-dark-600">Date:</span> <strong className="text-white">{eventDate}</strong></div>
                                                {eventLocation && <div><span className="text-dark-600">Location:</span> <strong className="text-white">{eventLocation}</strong></div>}
                                            </div>
                                            {customerInfo.notes && <p className="text-sm text-dark-500 mt-3"><strong>Notes:</strong> {customerInfo.notes}</p>}
                                        </CardContent>
                                    </Card>

                                    <div className="flex justify-between mt-6">
                                        <Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ChevronLeft size={18} />Back</Button>
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
                        <Card className="admin-card sticky top-32">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4 text-white">Price Summary</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-dark-500">Base price</span>
                                        <span className="text-white">€{pkg.basePrice.toFixed(2)} p.p.</span>
                                    </div>

                                    {Object.entries(selections).map(([catName, items]) =>
                                        items.filter(i => i.price > 0).map((item, i) => {
                                            const resolvedCat = pkg.categories.find(c => c.name === catName);
                                            const resolvedItemName = resolvedCat ? getLabel((resolvedCat.items.find(x => x.menuItem.name === item.itemName)?.menuItem as any)?.nameTranslations, item.itemName) : item.itemName;
                                            return (
                                                <div key={`${catName}-${i}`} className="flex justify-between text-xs">
                                                    <span className="text-dark-400 truncate max-w-[180px]">
                                                        + {resolvedItemName}{item.choiceName ? ` (${item.choiceName})` : ''}
                                                    </span>
                                                    <span className="text-dark-400">€{item.price.toFixed(2)}</span>
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* Addons */}
                                    {selectedAddons.length > 0 && (
                                        <>
                                            <div className="border-t border-dark-700 pt-3 mt-3">
                                                <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Add-ons</p>
                                                {selectedAddons.map(a => (
                                                    <div key={a._id} className="flex justify-between text-xs py-0.5">
                                                        <span className="text-dark-400 truncate max-w-[180px]">{getLabel((a as any).nameTranslations, a.name)}</span>
                                                        <span className="text-dark-400">€{(a.pricingType === 'per_person' ? a.price * guests : a.price).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between font-bold text-white">
                                            <span>Per person</span>
                                            <span className="text-primary-500">€{pricePerPerson.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-dark-500">
                                        <span>× {guests} guests</span>
                                    </div>

                                    {/* Coupon input */}
                                    <div className="border-t border-dark-700 pt-3 mt-3">
                                        {!couponApplied ? (
                                            <div className="flex gap-2">
                                                <input
                                                    value={couponCode}
                                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                    className="flex-1 text-xs bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 outline-none focus:border-primary-500 font-mono tracking-wider text-white"
                                                    placeholder="COUPON CODE"
                                                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                                />
                                                <button onClick={applyCoupon} disabled={couponLoading} className="text-xs bg-primary-500 hover:bg-primary-600 text-dark-950 font-bold px-3 py-2 flex items-center gap-1 rounded-lg">
                                                    <Tag size={12} /> Apply
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-green-900/20 border border-green-800 rounded-lg px-3 py-2">
                                                <div className="text-xs">
                                                    <span className="font-mono font-bold text-green-400">{couponApplied.code}</span>
                                                    <span className="text-green-500 ml-2">-€{couponDiscount.toFixed(2)}</span>
                                                </div>
                                                <button onClick={removeCoupon} className="text-red-400 hover:text-red-500"><X size={14} /></button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Total</span>
                                            <span className="text-primary-500">€{totalPrice.toFixed(2)}</span>
                                        </div>
                                        {couponApplied && (
                                            <div className="flex justify-between text-xs text-green-500 mt-0.5">
                                                <span>Coupon discount</span>
                                                <span>-€{couponDiscount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container >
        </div >
    );
};
