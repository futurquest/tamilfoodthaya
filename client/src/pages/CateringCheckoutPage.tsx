import { useState, useEffect, useMemo, type FocusEvent, type MouseEvent, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { getCateringPackage, createCateringOrder, api } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/Logo';
import { toast } from 'react-hot-toast';
import {
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    Users,
    Calendar,
    MapPin,
    ArrowRight,
    Music,
    Flower2,
    Wine,
    Baby,
    Camera,
    Tag,
    X,
    Mail,
    Phone,
    FileText
} from 'lucide-react';
import { SEO } from '../components/SEO';

interface Choice {
    name: string;
    priceModifier: number;
}
interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    choices: Choice[];
    image?: string;
}
interface Item {
    menuItem: MenuItem;
}
interface Category {
    name: string;
    description: string;
    minSelect: number;
    maxSelect: number;
    items: Item[];
}
interface Package {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    minGuests: number;
    maxGuests?: number;
    categories: Category[];
}

interface SelectedItemState {
    itemId: string;
    itemName: string;
    choiceName?: string;
    price: number;
}

interface Addon {
    _id: string;
    name: string;
    description: string;
    price: number;
    pricingType: 'fixed' | 'per_person';
    category: string;
}

const ADDON_ICONS: Record<string, ReactNode> = {
    entertainment: <Music size={18} className="text-purple-500" />,
    decoration: <Flower2 size={18} className="text-pink-500" />,
    service: <Wine size={18} className="text-blue-500" />,
    extra_time: <Baby size={18} className="text-green-500" />,
    other: <Camera size={18} className="text-amber-500" />
};

type Selections = Record<string, SelectedItemState[]>;

interface DishPreview {
    image: string;
    name: string;
    description: string;
    price: number;
    choices: Choice[];
    selectedChoice?: string;
    top: number;
    left: number;
}

export const CateringCheckoutPage = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

    const currentLang = i18n.language?.split('-')[0] || 'nl';
    const stepLabels = t('cateringCheckout.steps', { returnObjects: true }) as string[];

    const getLabel = (translations: any, fallback: string | undefined) =>
        translations?.[currentLang] || translations?.nl || fallback || '';

    const [pkg, setPkg] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState<Selections>({});
    const [guests, setGuests] = useState(50);
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [activeCatIdx, setActiveCatIdx] = useState(0);

    const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
    const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());

    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState<{
        code: string;
        discountValue: number;
        discountType: string;
    } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [dishPreview, setDishPreview] = useState<DishPreview | null>(null);

    useEffect(() => {
        if (!packageId) {
            navigate('/catering');
            return;
        }

        const load = async () => {
            try {
                const data = await getCateringPackage(packageId);
                setPkg(data);
                setGuests(data.minGuests);

                const initialSelections: Selections = {};
                data.categories.forEach((cat: Category) => {
                    initialSelections[cat.name] = [];
                });
                setSelections(initialSelections);
            } catch {
                toast.error('Package not found');
                navigate('/catering');
            } finally {
                setLoading(false);
            }
        };

        load();

        api.get('/addons')
            .then((r) => {
                const data = Array.isArray(r.data) ? r.data : r.data?.data || [];
                setAvailableAddons(data);
            })
            .catch(() => {});
    }, [packageId, navigate]);

    useEffect(() => {
        if (user) {
            setCustomerInfo((prev) => ({
                ...prev,
                name: prev.name || user.name || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || ''
            }));
        }
    }, [user]);

    const toggleItem = (cat: Category, itemObj: Item, choiceName?: string) => {
        const menuItem = itemObj.menuItem;
        if (!menuItem) return;

        const catSelections = selections[cat.name] || [];
        const existingIndex = catSelections.findIndex((s) => s.itemName === menuItem.name);

        if (existingIndex >= 0) {
            if (
                choiceName !== undefined &&
                catSelections[existingIndex].choiceName !== choiceName
            ) {
                const choice = menuItem.choices?.find((c) => c.name === choiceName);
                const updated = [...catSelections];
                updated[existingIndex] = {
                    itemId: menuItem._id,
                    itemName: menuItem.name,
                    choiceName,
                    price: menuItem.price + (choice?.priceModifier || 0)
                };
                setSelections({ ...selections, [cat.name]: updated });
            } else {
                setSelections({
                    ...selections,
                    [cat.name]: catSelections.filter((_, i) => i !== existingIndex)
                });
            }
        } else {
            if (catSelections.length >= cat.maxSelect) {
                toast.error(`Maximum ${cat.maxSelect} item(s) allowed for "${cat.name}"`);
                return;
            }

            const choice = choiceName
                ? menuItem.choices?.find((c) => c.name === choiceName)
                : undefined;

            setSelections({
                ...selections,
                [cat.name]: [
                    ...catSelections,
                    {
                        itemId: menuItem._id,
                        itemName: menuItem.name,
                        choiceName,
                        price: menuItem.price + (choice?.priceModifier || 0)
                    }
                ]
            });
        }
    };

    const isItemSelected = (catName: string, itemName: string) =>
        (selections[catName] || []).some((s) => s.itemName === itemName);

    const getSelectedChoice = (catName: string, itemName: string) =>
        (selections[catName] || []).find((s) => s.itemName === itemName)?.choiceName;

    const toggleAddon = (id: string) => {
        setSelectedAddonIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectedAddons = availableAddons.filter((a) => selectedAddonIds.has(a._id));

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;

        setCouponLoading(true);
        try {
            const res = await api.post('/coupons/validate', {
                code: couponCode.trim(),
                orderTotal: totalPriceBeforeDiscount
            });

            setCouponApplied({
                code: res.data.code,
                discountValue: res.data.discountValue,
                discountType: res.data.discountType
            });
            toast.success('Coupon applied');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Invalid coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setCouponApplied(null);
        setCouponCode('');
    };

    const goToCategory = (index: number) => {
        const nextIndex = Math.max(0, Math.min(index, pkg ? pkg.categories.length - 1 : 0));
        setActiveCatIdx(nextIndex);

        window.setTimeout(() => {
            document
                .getElementById('catering-items-panel')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    const showDishPreview = (
        event: MouseEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>,
        item: MenuItem,
        name: string,
        description: string,
        selectedChoice?: string
    ) => {
        if (!item.image) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const cardWidth = 340;
        const cardHeight = 390;
        const viewportPadding = 16;
        const preferredLeft = rect.right + 18;
        const left = Math.min(
            Math.max(viewportPadding, preferredLeft),
            window.innerWidth - cardWidth - viewportPadding
        );
        const top = Math.min(
            Math.max(88, rect.top - 16),
            window.innerHeight - cardHeight - viewportPadding
        );

        setDishPreview({
            image: item.image,
            name,
            description,
            price: item.price,
            choices: item.choices || [],
            selectedChoice,
            top,
            left
        });
    };

    const pricePerPerson = useMemo(() => {
        if (!pkg) return 0;

        let total = pkg.basePrice;
        Object.values(selections).forEach((items) => {
            items.forEach((item) => {
                total += item.price;
            });
        });
        return total;
    }, [pkg, selections]);

    const addonTotal = useMemo(() => {
        return selectedAddons.reduce(
            (sum, a) => sum + (a.pricingType === 'per_person' ? a.price * guests : a.price),
            0
        );
    }, [selectedAddons, guests]);

    const totalPriceBeforeDiscount = pricePerPerson * guests + addonTotal;

    const couponDiscount = useMemo(() => {
        if (!couponApplied) return 0;

        if (couponApplied.discountType === 'percentage') {
            return (
                Math.round(
                    ((totalPriceBeforeDiscount * couponApplied.discountValue) / 100) * 100
                ) / 100
            );
        }

        return Math.min(couponApplied.discountValue, totalPriceBeforeDiscount);
    }, [totalPriceBeforeDiscount, couponApplied]);

    const totalPrice = Math.max(0, totalPriceBeforeDiscount - couponDiscount);

    const selectionErrors = useMemo(() => {
        if (!pkg) return [];

        const errors: string[] = [];
        pkg.categories.forEach((cat) => {
            const count = (selections[cat.name] || []).length;
            if (count < cat.minSelect) {
                errors.push(
                    `"${getLabel((cat as any).nameTranslations, cat.name)}" requires at least ${cat.minSelect} selection(s)`
                );
            }
        });
        return errors;
    }, [pkg, selections, currentLang]);

    const canProceedFromSelections = selectionErrors.length === 0;

    const canSubmit =
        (user ||
            (customerInfo.name.length >= 2 &&
                customerInfo.email.includes('@') &&
                customerInfo.phone.length >= 10)) &&
        eventDate &&
        guests > 0;

    const handleSubmit = async () => {
        if (!pkg || !canSubmit) return;

        setSubmitting(true);
        try {
            const orderData = {
                packageId: pkg._id,
                selections: Object.entries(selections).map(([categoryName, selectedItems]) => ({
                    categoryName,
                    selectedItems
                })),
                addons: selectedAddons.map((a) => ({
                    addonId: a._id,
                    name: a.name,
                    price: a.price,
                    pricingType: a.pricingType
                })),
                couponCode: couponApplied?.code,
                guests,
                eventDate,
                eventLocation,
                customerInfo
            };

            await createCateringOrder(orderData);
            toast.success('Order placed successfully');
            navigate('/catering');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white pt-24 pb-16">
                <PageLoader full={false} hint={t('cateringCheckout.loading')} />
            </div>
        );
    }

    if (!pkg) return null;

    const activeCategory = pkg.categories[activeCatIdx];

    return (
        <div className="catering-checkout min-h-screen bg-white font-sans pt-24 pb-16 text-gray-900">
            <SEO
                title={`${pkg.name} - Catering`}
                description={`Customize your ${pkg.name} catering package.`}
            />

            <section className="border-b border-gray-200 bg-white">
                <Container>
                    <div className="mx-auto max-w-6xl py-8">
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t('cateringCheckout.packageLabel')}
                            </p>

                            <h1 className="mt-2 text-3xl font-semibold text-gray-900 md:text-4xl">
                                {getLabel((pkg as any).nameTranslations, pkg.name)}
                            </h1>

                            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
                                {getLabel((pkg as any).descriptionTranslations, pkg.description)}
                            </p>

                            <div className="mt-6 border-t border-gray-200 pt-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    {stepLabels.map((label, i) => (
                                        <div
                                            key={label}
                                            className="flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                                                    step >= i
                                                        ? 'bg-black text-white'
                                                        : 'border border-gray-300 bg-white text-gray-500'
                                                }`}
                                            >
                                                {step > i ? <CheckCircle size={18} /> : i + 1}
                                            </div>

                                            <span
                                                className={`text-sm ${
                                                    step >= i ? 'text-gray-900' : 'text-gray-500'
                                                }`}
                                            >
                                                {label}
                                            </span>

                                            {i < stepLabels.length - 1 && (
                                                <ChevronRight
                                                    size={16}
                                                    className="text-gray-400"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <Container>
                <div className="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        {step === 0 && activeCategory && (
                            <div className="space-y-4">
                                <div className="space-y-4">
                                    <Card className="rounded-2xl border border-gray-200 bg-white shadow-none">
                                        <CardContent className="p-4">
                                            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900">
                                                        {t('cateringCheckout.categoriesTitle')}
                                                    </h2>
                                                    <p className="text-sm text-gray-600">
                                                        {t('cateringCheckout.categoriesHelp')}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium text-gray-500">
                                                    {activeCatIdx + 1} of {pkg.categories.length}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                                {pkg.categories.map((cat, idx) => {
                                                    const count = (selections[cat.name] || []).length;
                                                    const isValid = count >= cat.minSelect;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => goToCategory(idx)}
                                                            aria-current={
                                                                activeCatIdx === idx ? 'step' : undefined
                                                            }
                                                            className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm font-semibold leading-snug transition ${
                                                                activeCatIdx === idx
                                                                    ? 'border-black bg-black text-white'
                                                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                            } ${
                                                                isValid && activeCatIdx !== idx
                                                                    ? 'border-green-500 bg-green-50 text-green-800'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <span>
                                                                {getLabel(
                                                                    (cat as any).nameTranslations,
                                                                    cat.name
                                                                )}
                                                            </span>
                                                            <span className={`rounded-full px-2 py-1 text-xs ${
                                                                activeCatIdx === idx
                                                                    ? 'bg-white/15 text-white'
                                                                    : isValid
                                                                      ? 'bg-green-100 text-green-800'
                                                                      : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                {count}/{cat.maxSelect}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div id="catering-items-panel" className="scroll-mt-28">
                                        <Card className="rounded-2xl border border-gray-200 bg-white shadow-none">
                                            <CardContent className="p-6">
                                            <div>
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                    <div>
                                                        <h2 className="text-2xl font-semibold text-gray-900">
                                                            {getLabel(
                                                                (activeCategory as any).nameTranslations,
                                                                activeCategory.name
                                                            )}
                                                        </h2>
                                                        {(activeCategory.description ||
                                                            (activeCategory as any)
                                                                .descriptionTranslations) && (
                                                            <p className="mt-1 text-sm text-gray-600">
                                                                {getLabel(
                                                                    (activeCategory as any)
                                                                        .descriptionTranslations,
                                                                    activeCategory.description
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span className="text-sm text-gray-500">
                                                        Select {activeCategory.minSelect}
                                                        {activeCategory.minSelect !==
                                                        activeCategory.maxSelect
                                                            ? `–${activeCategory.maxSelect}`
                                                            : ''}{' '}
                                                        item(s)
                                                    </span>
                                                </div>

                                                {selectionErrors.length > 0 && (
                                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                                                        <p className="text-sm font-medium text-red-700">
                                                            {t('cateringCheckout.completeRequired')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4">
                                                <div className="space-y-3">
                                                    {activeCategory.items.map((itemObj, iIdx) => {
                                                        const item = itemObj.menuItem;
                                                        if (!item) return null;

                                                        const selected = isItemSelected(
                                                            activeCategory.name,
                                                            item.name
                                                        );
                                                        const selectedChoice = getSelectedChoice(
                                                            activeCategory.name,
                                                            item.name
                                                        );
                                                        const itemName = getLabel(
                                                            (item as any).nameTranslations,
                                                            item.name
                                                        );
                                                        const itemDescription = getLabel(
                                                            (item as any).descriptionTranslations,
                                                            item.description
                                                        );

                                                        return (
                                                            <Card
                                                                key={iIdx}
                                                                className={`overflow-visible rounded-2xl border-2 bg-white shadow-none transition ${
                                                                    selected
                                                                        ? 'border-black bg-gray-50 ring-2 ring-black/10'
                                                                        : 'border-gray-200 hover:border-gray-400'
                                                                }`}
                                                            >
                                                                <CardContent className="p-4">
                                                                    <div
                                                                        className="flex items-start justify-between gap-4"
                                                                        onClick={() =>
                                                                            !item.choices ||
                                                                            item.choices.length === 0
                                                                                ? toggleItem(
                                                                                      activeCategory,
                                                                                      itemObj
                                                                                  )
                                                                                : undefined
                                                                        }
                                                                    >
                                                                        <div className="flex flex-grow items-start gap-3">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (
                                                                                        !item.choices ||
                                                                                        item.choices.length === 0
                                                                                    ) {
                                                                                        toggleItem(
                                                                                            activeCategory,
                                                                                            itemObj
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border transition ${
                                                                                    selected
                                                                                        ? 'border-black bg-black text-white'
                                                                                        : 'border-gray-300 bg-white text-transparent'
                                                                                }`}
                                                                            >
                                                                                <CheckCircle size={14} />
                                                                            </button>

                                                                            {item.image && (
                                                                                <div
                                                                                    className="relative z-30 shrink-0"
                                                                                    onMouseEnter={(event) =>
                                                                                        showDishPreview(
                                                                                            event,
                                                                                            item,
                                                                                            itemName,
                                                                                            itemDescription,
                                                                                            selectedChoice
                                                                                        )
                                                                                    }
                                                                                    onMouseLeave={() => setDishPreview(null)}
                                                                                    onFocus={(event) =>
                                                                                        showDishPreview(
                                                                                            event,
                                                                                            item,
                                                                                            itemName,
                                                                                            itemDescription,
                                                                                            selectedChoice
                                                                                        )
                                                                                    }
                                                                                    onBlur={() => setDishPreview(null)}
                                                                                    tabIndex={0}
                                                                                    aria-label={`Preview ${itemName}`}
                                                                                >
                                                                                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-gray-200">
                                                                                        <img
                                                                                            src={item.image}
                                                                                            alt={itemName}
                                                                                            className="h-full w-full object-cover"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            <div>
                                                                                <h3 className="font-medium text-gray-900">
                                                                                    {itemName}
                                                                                </h3>

                                                                                {itemDescription && (
                                                                                    <p className="mt-1 text-sm text-gray-600">
                                                                                        {itemDescription}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="shrink-0 text-right">
                                                                            {item.price > 0 ? (
                                                                                <span className="text-sm font-medium text-gray-900">
                                                                                    +€{item.price.toFixed(2)} p.p.
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-xs font-medium text-green-600">
                                                                                    Included
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {item.choices && item.choices.length > 0 && (
                                                                        <div className="mt-3 flex flex-wrap gap-2 pl-9">
                                                                            {item.choices.map((choice, cIdx) => (
                                                                                <button
                                                                                    key={cIdx}
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        toggleItem(
                                                                                            activeCategory,
                                                                                            itemObj,
                                                                                            choice.name
                                                                                        )
                                                                                    }
                                                                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                                                                        selected &&
                                                                                        selectedChoice ===
                                                                                            choice.name
                                                                                            ? 'border-black bg-black text-white'
                                                                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                                                    }`}
                                                                                >
                                                                                    {choice.name}
                                                                                    {choice.priceModifier > 0 && (
                                                                                        <span className="ml-1 opacity-70">
                                                                                            +€{choice.priceModifier.toFixed(2)}
                                                                                        </span>
                                                                                    )}
                                                                                    {choice.priceModifier < 0 && (
                                                                                        <span className="ml-1 opacity-70">
                                                                                            -€
                                                                                            {Math.abs(
                                                                                                choice.priceModifier
                                                                                            ).toFixed(2)}
                                                                                        </span>
                                                                                    )}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="sticky bottom-3 z-10 mt-5 flex justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
                                                <Button
                                                    variant="outline"
                                                    disabled={activeCatIdx === 0}
                                                    onClick={() => goToCategory(activeCatIdx - 1)}
                                                    className="gap-2"
                                                >
                                                    <ChevronLeft size={18} />
                                                    {t('cateringCheckout.previous')}
                                                </Button>

                                                {activeCatIdx < pkg.categories.length - 1 ? (
                                                    <Button
                                                        onClick={() =>
                                                            goToCategory(activeCatIdx + 1)
                                                        }
                                                        className="gap-2 bg-black text-white hover:bg-gray-900"
                                                    >
                                                        {t('cateringCheckout.next')}
                                                        <ChevronRight size={18} />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        disabled={!canProceedFromSelections}
                                                        onClick={() => setStep(1)}
                                                        className="gap-2 bg-black text-white hover:bg-gray-900"
                                                    >
                                                        {t('cateringCheckout.chooseAddons')}
                                                        <ArrowRight size={18} />
                                                    </Button>
                                                )}
                                            </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-4">
                                <Card className="rounded-2xl border border-gray-200 bg-white shadow-none">
                                    <CardContent className="p-6">
                                        <h2 className="text-2xl font-semibold text-gray-900">
                                            {t('cateringCheckout.optionalAddons')}
                                        </h2>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Select any extras to make your event more special.
                                        </p>

                                        {availableAddons.length === 0 ? (
                                            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-500">
                                                <p className="font-medium">No add-ons available yet.</p>
                                                <p className="mt-1 text-sm">
                                                    You can proceed without extras.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mt-6 grid gap-3">
                                                {availableAddons.map((addon) => {
                                                    const selected = selectedAddonIds.has(addon._id);

                                                    return (
                                                        <button
                                                            key={addon._id}
                                                            type="button"
                                                            onClick={() => toggleAddon(addon._id)}
                                                            className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                                                                selected
                                                                    ? 'border-black bg-gray-50 ring-2 ring-black/10'
                                                                    : 'border-gray-200 bg-white hover:border-gray-400'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                                                                        {ADDON_ICONS[addon.category] ||
                                                                            ADDON_ICONS.other}
                                                                    </div>

                                                                    <div>
                                                                        <h4 className="font-medium text-gray-900">
                                                                            {getLabel(
                                                                                (addon as any)
                                                                                    .nameTranslations,
                                                                                addon.name
                                                                            )}
                                                                        </h4>
                                                                        <p className="mt-0.5 text-sm text-gray-600">
                                                                            {getLabel(
                                                                                (addon as any)
                                                                                    .descriptionTranslations,
                                                                                addon.description
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="ml-4 flex shrink-0 items-center gap-3">
                                                                    <div className="text-right">
                                                                        <span className="font-medium text-gray-900">
                                                                            €{addon.price}
                                                                        </span>
                                                                        <span className="ml-1 text-xs text-gray-500">
                                                                            {addon.pricingType === 'per_person'
                                                                                ? '/pp'
                                                                                : 'fixed'}
                                                                        </span>
                                                                    </div>

                                                                    <div
                                                                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                                                            selected
                                                                                ? 'border-black bg-black text-white'
                                                                                : 'border-gray-300 bg-white text-transparent'
                                                                        }`}
                                                                    >
                                                                        <CheckCircle size={14} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div className="mt-6 flex justify-between">
                                            <Button
                                                variant="outline"
                                                onClick={() => setStep(0)}
                                                className="gap-2"
                                            >
                                                <ChevronLeft size={18} />
                                                {t('cateringCheckout.backToItems')}
                                            </Button>

                                            <Button
                                                onClick={() => setStep(2)}
                                                className="gap-2 bg-black text-white hover:bg-gray-900"
                                            >
                                                Continue to Details
                                                <ArrowRight size={18} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <Card className="rounded-2xl border border-gray-200 bg-white shadow-none">
                                    <CardContent className="space-y-5 p-6">
                                        <h2 className="text-2xl font-semibold text-gray-900">
                                            Event & Contact Details
                                        </h2>

                                        <div className="grid gap-5 md:grid-cols-2">
                                            <DetailField
                                                label="Full Name *"
                                                icon={<Users size={14} />}
                                                value={customerInfo.name}
                                                onChange={(value) =>
                                                    setCustomerInfo({
                                                        ...customerInfo,
                                                        name: value
                                                    })
                                                }
                                                placeholder={user?.name || ''}
                                            />

                                            <DetailField
                                                label="Email *"
                                                icon={<Mail size={14} />}
                                                type="email"
                                                value={customerInfo.email}
                                                onChange={(value) =>
                                                    setCustomerInfo({
                                                        ...customerInfo,
                                                        email: value
                                                    })
                                                }
                                                placeholder={user?.email || ''}
                                            />
                                        </div>

                                        <div className="grid gap-5 md:grid-cols-2">
                                            <DetailField
                                                label="Phone *"
                                                icon={<Phone size={14} />}
                                                value={customerInfo.phone}
                                                onChange={(value) =>
                                                    setCustomerInfo({
                                                        ...customerInfo,
                                                        phone: value
                                                    })
                                                }
                                                placeholder={user?.phone || ''}
                                            />

                                            <DetailField
                                                label="Number of Guests *"
                                                icon={<Users size={14} />}
                                                type="number"
                                                value={String(guests)}
                                                onChange={(value) =>
                                                    setGuests(parseInt(value) || 0)
                                                }
                                                placeholder=""
                                                min={String(pkg.minGuests)}
                                                max={String(pkg.maxGuests || 9999)}
                                            />
                                        </div>

                                        <div className="grid gap-5 md:grid-cols-2">
                                            <DetailField
                                                label="Event Date *"
                                                icon={<Calendar size={14} />}
                                                type="date"
                                                value={eventDate}
                                                onChange={setEventDate}
                                                placeholder=""
                                            />

                                            <DetailField
                                                label="Event Location"
                                                icon={<MapPin size={14} />}
                                                value={eventLocation}
                                                onChange={setEventLocation}
                                                placeholder="Address or venue name"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                                <FileText size={14} />
                                                Notes
                                            </label>
                                            <textarea
                                                value={customerInfo.notes}
                                                onChange={(e) =>
                                                    setCustomerInfo({
                                                        ...customerInfo,
                                                        notes: e.target.value
                                                    })
                                                }
                                                className="min-h-[110px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black"
                                                placeholder="Dietary requirements, special requests..."
                                            />
                                        </div>

                                        <div className="flex justify-between">
                                            <Button
                                                variant="outline"
                                                onClick={() => setStep(1)}
                                                className="gap-2"
                                            >
                                                <ChevronLeft size={18} />
                                                {t('cateringCheckout.backToAddons')}
                                            </Button>

                                            <Button
                                                disabled={!canSubmit}
                                                onClick={() => setStep(3)}
                                                className="gap-2 bg-black text-white hover:bg-gray-900"
                                            >
                                                {t('cateringCheckout.reviewOrder')}
                                                <ArrowRight size={18} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <Card className="rounded-2xl border border-gray-200 bg-white shadow-none">
                                    <CardContent className="p-6">
                                        <h2 className="text-2xl font-semibold text-gray-900">
                                            {t('cateringCheckout.reviewTitle')}
                                        </h2>

                                        <div className="mt-6 space-y-5">
                                            <div>
                                                <h3 className="mb-3 text-lg font-medium text-gray-900">
                                                    {t('cateringCheckout.yourSelections')}
                                                </h3>

                                                <div className="space-y-4">
                                                    {Object.entries(selections).map(
                                                        ([catName, items]) =>
                                                            items.length > 0 && (
                                                                <div key={catName}>
                                                                    <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                                                                        {catName}
                                                                    </h4>
                                                                    <div className="space-y-1">
                                                                        {items.map((item, i) => (
                                                                            <div
                                                                                key={i}
                                                                                className="flex justify-between gap-3 py-1 text-sm"
                                                                            >
                                                                                <span className="text-gray-800">
                                                                                    {item.itemName}
                                                                                    {item.choiceName && (
                                                                                        <span className="ml-1 text-gray-500">
                                                                                            ({item.choiceName})
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                                <span className="text-gray-700">
                                                                                    {item.price > 0
                                                                                        ? `+€${item.price.toFixed(2)} p.p.`
                                                                                        : 'Included'}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )
                                                    )}
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 pt-5">
                                                <h3 className="mb-3 text-lg font-medium text-gray-900">
                                                    {t('cateringCheckout.eventDetails')}
                                                </h3>

                                                <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
                                                    <div>
                                                        <span className="text-gray-500">Name:</span>{' '}
                                                        <strong>
                                                            {customerInfo.name || user?.name || ''}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Email:</span>{' '}
                                                        <strong>
                                                            {customerInfo.email || user?.email || ''}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Phone:</span>{' '}
                                                        <strong>
                                                            {customerInfo.phone || user?.phone || ''}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Guests:</span>{' '}
                                                        <strong>{guests}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Date:</span>{' '}
                                                        <strong>{eventDate}</strong>
                                                    </div>
                                                    {eventLocation && (
                                                        <div>
                                                            <span className="text-gray-500">
                                                                Location:
                                                            </span>{' '}
                                                            <strong>{eventLocation}</strong>
                                                        </div>
                                                    )}
                                                </div>

                                                {customerInfo.notes && (
                                                    <p className="mt-4 text-sm text-gray-600">
                                                        <strong className="text-gray-800">Notes:</strong>{' '}
                                                        {customerInfo.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-between">
                                            <Button
                                                variant="outline"
                                                onClick={() => setStep(2)}
                                                className="gap-2"
                                            >
                                                <ChevronLeft size={18} />
                                                {t('cateringCheckout.back')}
                                            </Button>

                                            <Button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="gap-2 bg-black px-8 text-white hover:bg-gray-900"
                                            >
                                                {submitting ? t('cateringCheckout.placing') : t('cateringCheckout.placeOrder')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    <div className="self-start lg:sticky lg:top-24">
                        <Card className="rounded-2xl border border-gray-200 bg-white shadow-none">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {t('cateringCheckout.priceSummary')}
                                </h3>

                                <div className="mt-5 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('cateringCheckout.basePrice')}</span>
                                        <span className="text-gray-900">
                                            €{pkg.basePrice.toFixed(2)} p.p.
                                        </span>
                                    </div>

                                    {Object.entries(selections).map(([catName, items]) =>
                                        items
                                            .filter((i) => i.price > 0)
                                            .map((item, i) => {
                                                const resolvedCat = pkg.categories.find(
                                                    (c) => c.name === catName
                                                );

                                                const resolvedItemName = resolvedCat
                                                    ? getLabel(
                                                          (
                                                              resolvedCat.items.find(
                                                                  (x) =>
                                                                      x.menuItem.name === item.itemName
                                                              )?.menuItem as any
                                                          )?.nameTranslations,
                                                          item.itemName
                                                      )
                                                    : item.itemName;

                                                return (
                                                    <div
                                                        key={`${catName}-${i}`}
                                                        className="flex justify-between text-xs"
                                                    >
                                                        <span className="max-w-[180px] truncate text-gray-600">
                                                            + {resolvedItemName}
                                                            {item.choiceName
                                                                ? ` (${item.choiceName})`
                                                                : ''}
                                                        </span>
                                                        <span className="text-gray-700">
                                                            €{item.price.toFixed(2)}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                    )}

                                    {selectedAddons.length > 0 && (
                                        <div className="mt-3 border-t border-gray-200 pt-3">
                                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Add-ons
                                            </p>

                                            {selectedAddons.map((a) => (
                                                <div
                                                    key={a._id}
                                                    className="flex justify-between py-0.5 text-xs"
                                                >
                                                    <span className="max-w-[180px] truncate text-gray-600">
                                                        {getLabel((a as any).nameTranslations, a.name)}
                                                    </span>
                                                    <span className="text-gray-700">
                                                        €
                                                        {(
                                                            a.pricingType === 'per_person'
                                                                ? a.price * guests
                                                                : a.price
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-3 border-t border-gray-200 pt-3">
                                        <div className="flex justify-between font-medium text-gray-900">
                                            <span>{t('cateringCheckout.perPerson')}</span>
                                            <span>€{pricePerPerson.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-gray-500">
                                        <span>× {guests} guests</span>
                                    </div>

                                    <div className="mt-3 border-t border-gray-200 pt-3">
                                        {!couponApplied ? (
                                            <div className="flex gap-2">
                                                <input
                                                    value={couponCode}
                                                    onChange={(e) =>
                                                        setCouponCode(e.target.value.toUpperCase())
                                                    }
                                                    className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono tracking-wider text-gray-900 outline-none focus:border-black"
                                                    placeholder="COUPON CODE"
                                                    onKeyDown={(e) =>
                                                        e.key === 'Enter' && applyCoupon()
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={applyCoupon}
                                                    disabled={couponLoading}
                                                    className="flex items-center gap-1 rounded-xl bg-black px-3 py-2 text-xs font-medium text-white hover:bg-gray-900"
                                                >
                                                    <Tag size={12} />
                                                    {t('cateringCheckout.apply')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2">
                                                <div className="text-xs">
                                                    <span className="font-mono font-medium text-green-700">
                                                        {couponApplied.code}
                                                    </span>
                                                    <span className="ml-2 text-green-600">
                                                        -€{couponDiscount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={removeCoupon}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-xl font-semibold text-gray-900">
                                            <span>{t('checkout.total')}</span>
                                            <span>€{totalPrice.toFixed(2)}</span>
                                        </div>

                                        {couponApplied && (
                                            <div className="mt-1 flex justify-between text-xs text-green-600">
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
            </Container>

            {dishPreview && (
                <div
                    className="pointer-events-none fixed z-[9999] hidden w-[340px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-2xl ring-1 ring-black/10 md:block"
                    style={{ top: dishPreview.top, left: dishPreview.left }}
                >
                    <img
                        src={dishPreview.image}
                        alt={dishPreview.name}
                        className="h-44 w-full object-cover"
                    />
                    <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <h4 className="text-lg font-extrabold leading-snug text-gray-900">
                                {dishPreview.name}
                            </h4>
                            {dishPreview.price > 0 ? (
                                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-800">
                                    +â‚¬{dishPreview.price.toFixed(2)}
                                </span>
                            ) : (
                                <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                                    Included
                                </span>
                            )}
                        </div>

                        {dishPreview.description && (
                            <p className="mt-2 max-h-24 overflow-hidden text-sm leading-6 text-gray-600">
                                {dishPreview.description}
                            </p>
                        )}

                        {dishPreview.choices.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {dishPreview.choices.map((choice, cIdx) => (
                                    <span
                                        key={cIdx}
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            dishPreview.selectedChoice === choice.name
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {choice.name}
                                        {choice.priceModifier !== 0 && (
                                            <span className="ml-1 opacity-70">
                                                {choice.priceModifier > 0 ? '+' : '-'}â‚¬
                                                {Math.abs(choice.priceModifier).toFixed(2)}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailField = ({
    label,
    icon,
    value,
    onChange,
    placeholder,
    type = 'text',
    min,
    max
}: {
    label: string;
    icon: ReactNode;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    min?: string;
    max?: string;
}) => {
    return (
        <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                {icon}
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                max={max}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-black"
            />
        </div>
    );
};
