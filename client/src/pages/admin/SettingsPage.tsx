import { useEffect, type ReactNode } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../../hooks/useApi';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    Facebook,
    Globe2,
    Instagram,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Power,
    RotateCcw,
    Save,
    Settings as SettingsIcon,
    Store,
    UtensilsCrossed
} from 'lucide-react';

type BusinessHours = {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
};

type SiteSettings = {
    siteName: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    facebookUrl: string;
    instagramUrl: string;
    ordersEnabled: boolean;
    businessHours: BusinessHours;
};

type SettingsSection = 'identity' | 'contact' | 'hours' | 'orders';

const DEFAULT_SETTINGS: SiteSettings = {
    siteName: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    facebookUrl: '',
    instagramUrl: '',
    ordersEnabled: true,
    businessHours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
    }
};

const DAYS: Array<{ key: keyof BusinessHours; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
];

export const SettingsPage = () => {
    const queryClient = useQueryClient();

    const {
        data: settings,
        isLoading,
        isError,
        refetch
    } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings
    });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { isDirty }
    } = useForm<SiteSettings>({
        defaultValues: DEFAULT_SETTINGS
    });

    useEffect(() => {
        if (!settings) return;

        const normalized: SiteSettings = {
            ...DEFAULT_SETTINGS,
            ...settings,
            businessHours: {
                ...DEFAULT_SETTINGS.businessHours,
                ...(settings.businessHours || {})
            }
        };

        reset(normalized);
    }, [settings, reset]);

    const mutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Settings saved');
        },
        onError: () => {
            toast.error('Failed to save settings');
        }
    });

    const onSubmit = (data: SiteSettings) => {
        const payload: SiteSettings = {
            ...DEFAULT_SETTINGS,
            ...data,
            ordersEnabled: Boolean(data.ordersEnabled),
            businessHours: {
                ...DEFAULT_SETTINGS.businessHours,
                ...(data.businessHours || {})
            }
        };

        mutation.mutate(payload);
    };

    const values = watch();
    const ordersEnabled = Boolean(values.ordersEnabled);
    const completedContactFields = [
        values.email,
        values.phone,
        values.whatsapp,
        values.address
    ].filter(Boolean).length;
    const filledHours = Object.values(values.businessHours || {}).filter(Boolean).length;
    const hasSocialLinks = Boolean(values.facebookUrl || values.instagramUrl);

    if (isLoading) {
        return (
            <div className="admin-loading-state">
                <Spinner size="lg" />
                <p>Loading site settings...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="admin-page">
                <div className="admin-page-container min-w-0 max-w-[1180px]">
                    <ErrorState onRetry={() => refetch()} />
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-container min-w-0 max-w-[1180px]">
                <section className="admin-command-hero rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Settings
                            </p>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[40px]">
                                Site Settings
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                Control public restaurant details, contact channels, opening
                                hours and online ordering availability.
                            </p>
                        </div>

                        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                            <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-(--brand-stone)">
                                <SettingsIcon size={13} />
                                Save status
                            </p>
                            <p className="mt-1 truncate text-sm font-extrabold text-white">
                                {mutation.isPending
                                    ? 'Saving changes'
                                    : isDirty
                                    ? 'Unsaved changes'
                                    : 'All changes saved'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-5">
                        <MetricCard label="Brand" value={values.siteName ? 'Set' : 'Missing'} icon={<Store size={15} />} />
                        <MetricCard label="Contact" value={`${completedContactFields}/4`} icon={<Phone size={15} />} />
                        <MetricCard label="Hours" value={`${filledHours}/7`} icon={<Clock3 size={15} />} />
                        <MetricCard label="Social" value={hasSocialLinks ? 'Linked' : 'Empty'} icon={<Globe2 size={15} />} />
                        <MetricCard label="Orders" value={ordersEnabled ? 'Enabled' : 'Paused'} icon={<Power size={15} />} />
                    </div>
                </section>

                <form onSubmit={handleSubmit(onSubmit)} className="grid min-w-0 gap-5 xl:grid-cols-[230px_minmax(0,1fr)_300px] xl:items-start">
                    <SettingsNav />

                    <div className="min-w-0 space-y-5">
                        <SettingsCard
                            id="identity"
                            icon={<Store size={18} />}
                            title="Business Identity"
                            subtitle="The public-facing restaurant name and address shown across the website."
                        >
                            <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
                                <InputBlock
                                    label="Site name"
                                    icon={<Store size={16} />}
                                    placeholder="Tamil Food Thaya"
                                    registration={register('siteName')}
                                />

                                <InputBlock
                                    label="Address"
                                    icon={<MapPin size={16} />}
                                    placeholder="Restaurant address"
                                    registration={register('address')}
                                />
                            </div>
                        </SettingsCard>

                        <SettingsCard
                            id="contact"
                            icon={<MessageCircle size={18} />}
                            title="Contact Channels"
                            subtitle="Keep phone, email, WhatsApp and social links consistent for customer support."
                        >
                            <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
                                <InputBlock
                                    label="Email"
                                    icon={<Mail size={16} />}
                                    placeholder="info@example.com"
                                    registration={register('email')}
                                />

                                <InputBlock
                                    label="Phone"
                                    icon={<Phone size={16} />}
                                    placeholder="+31 ..."
                                    registration={register('phone')}
                                />

                                <InputBlock
                                    label="WhatsApp"
                                    icon={<MessageCircle size={16} />}
                                    placeholder="+31 ..."
                                    registration={register('whatsapp')}
                                />

                                <InputBlock
                                    label="Facebook URL"
                                    icon={<Facebook size={16} />}
                                    placeholder="https://facebook.com/..."
                                    registration={register('facebookUrl')}
                                />

                                <div className="2xl:col-span-2">
                                    <InputBlock
                                        label="Instagram URL"
                                        icon={<Instagram size={16} />}
                                        placeholder="https://instagram.com/..."
                                        registration={register('instagramUrl')}
                                    />
                                </div>
                            </div>
                        </SettingsCard>

                        <SettingsCard
                            id="hours"
                            icon={<Clock3 size={18} />}
                            title="Business Hours"
                            subtitle="Use clear customer-facing text such as 12:00 - 22:00 or Closed."
                        >
                            <div className="grid min-w-0 gap-3 2xl:grid-cols-2">
                                {DAYS.map((day) => (
                                    <InputBlock
                                        key={day.key}
                                        label={day.label}
                                        icon={<Clock3 size={16} />}
                                        placeholder="12:00 - 22:00"
                                        registration={register(`businessHours.${day.key}`)}
                                    />
                                ))}
                            </div>
                        </SettingsCard>

                        <SettingsCard
                            id="orders"
                            icon={<UtensilsCrossed size={18} />}
                            title="Online Orders"
                            subtitle="Pause ordering when the kitchen is closed for maintenance or special events."
                        >
                            <ToggleCard
                                title={ordersEnabled ? 'Online orders enabled' : 'Online orders paused'}
                                description="Controls whether customers can place orders through the website."
                                checked={ordersEnabled}
                                inputProps={register('ordersEnabled')}
                            />
                        </SettingsCard>
                    </div>

                    <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
                        <OperationsPreview values={values} />

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                                <CheckCircle2 size={17} className="text-emerald-700" />
                                Readiness
                            </div>
                            <div className="mt-4 space-y-3">
                                <ReadinessLine label="Business name" complete={Boolean(values.siteName)} />
                                <ReadinessLine label="Contact details" complete={completedContactFields >= 3} />
                                <ReadinessLine label="Opening hours" complete={filledHours === 7} />
                                <ReadinessLine label="Order availability" complete />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--brand-text) px-5 text-sm font-bold text-white transition hover:bg-(--brand-ink-coal) focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save size={16} />
                                {mutation.isPending ? 'Saving...' : 'Save settings'}
                            </button>

                            <button
                                type="button"
                                onClick={() => reset()}
                                disabled={!isDirty || mutation.isPending}
                                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RotateCcw size={15} />
                                Reset changes
                            </button>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
};

const SettingsNav = () => {
    const items: Array<{ id: SettingsSection; label: string; icon: ReactNode }> = [
        { id: 'identity', label: 'Identity', icon: <Store size={15} /> },
        { id: 'contact', label: 'Contact', icon: <MessageCircle size={15} /> },
        { id: 'hours', label: 'Hours', icon: <Clock3 size={15} /> },
        { id: 'orders', label: 'Orders', icon: <Power size={15} /> }
    ];

    return (
        <nav className="hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm xl:sticky xl:top-6 xl:block">
            {items.map((item) => (
                <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-amber-50 hover:text-amber-800"
                >
                    {item.icon}
                    {item.label}
                </a>
            ))}
        </nav>
    );
};

const SettingsCard = ({
    id,
    icon,
    title,
    subtitle,
    children
}: {
    id: SettingsSection;
    icon: ReactNode;
    title: string;
    subtitle: string;
    children: ReactNode;
}) => (
    <section id={id} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--brand-surface-dim) text-amber-800">
                {icon}
            </span>
            <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
                <p className="mt-1 max-w-[70ch] text-sm font-medium leading-6 text-slate-500">
                    {subtitle}
                </p>
            </div>
        </div>

        <div className="mt-5">{children}</div>
    </section>
);

const MetricCard = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
}) => (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-(--brand-stone)">
            {icon}
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em]">{label}</p>
        </div>
        <p className="mt-2 truncate text-2xl font-extrabold tabular-nums text-white">{value}</p>
    </div>
);

const InputBlock = ({
    label,
    icon,
    placeholder,
    registration
}: {
    label: string;
    icon?: ReactNode;
    placeholder?: string;
    registration: UseFormRegisterReturn;
}) => (
    <div className="min-w-0 rounded-2xl bg-(--brand-surface-dim) p-4">
        <label className="mb-2 block text-sm font-bold text-slate-800">{label}</label>
        <div className="relative">
            {icon && (
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {icon}
                </span>
            )}
            <input
                {...registration}
                placeholder={placeholder}
                className={`h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 ${
                    icon ? 'pl-11 pr-4' : 'px-4'
                }`}
            />
        </div>
    </div>
);

const ToggleCard = ({
    title,
    description,
    checked,
    inputProps
}: {
    title: string;
    description: string;
    checked: boolean;
    inputProps: UseFormRegisterReturn;
}) => (
    <label
        className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition focus-within:ring-4 focus-within:ring-amber-100 ${
            checked
                ? 'border-(--brand-text) bg-(--brand-text) text-white'
                : 'border-slate-200 bg-(--brand-surface-dim) text-slate-700 hover:bg-amber-50'
        }`}
    >
        <div className="min-w-0">
            <p className="text-sm font-extrabold">{title}</p>
            <p className={`mt-1 text-xs font-semibold leading-5 ${checked ? 'text-stone-200' : 'text-slate-500'}`}>
                {description}
            </p>
        </div>

        <div className="flex items-center gap-3">
            <input type="checkbox" className="sr-only" {...inputProps} />
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${checked ? 'bg-white text-slate-900' : 'bg-white text-slate-500'}`}>
                <Power size={16} />
            </span>
        </div>
    </label>
);

const OperationsPreview = ({ values }: { values: SiteSettings }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
            <Globe2 size={17} className="text-amber-700" />
            Public preview
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-(--brand-surface-dim) p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Restaurant
            </p>
            <p className="mt-1 text-lg font-extrabold text-slate-950">
                {values.siteName || 'Tamil Food Thaya'}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {values.address || 'Restaurant address'}
            </p>
        </div>

        <div className="mt-4 space-y-3 text-xs font-semibold text-slate-500">
            <PreviewLine label="Email" value={values.email || 'No email'} />
            <PreviewLine label="Phone" value={values.phone || 'No phone'} />
            <PreviewLine label="WhatsApp" value={values.whatsapp || 'No WhatsApp'} />
            <PreviewLine label="Orders" value={values.ordersEnabled ? 'Enabled' : 'Paused'} />
        </div>
    </div>
);

const ReadinessLine = ({
    label,
    complete
}: {
    label: string;
    complete: boolean;
}) => (
    <div className="flex items-center justify-between gap-3 text-xs font-bold">
        <span className="text-slate-600">{label}</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${complete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
            {complete ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {complete ? 'Ready' : 'Needs info'}
        </span>
    </div>
);

const PreviewLine = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
        <span>{label}</span>
        <span className="min-w-0 truncate text-right font-extrabold text-slate-800">{value}</span>
    </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
            <p>Settings could not be loaded.</p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-2 font-extrabold underline decoration-red-300 underline-offset-4"
            >
                Try again
            </button>
        </div>
    </div>
);
