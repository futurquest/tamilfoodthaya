import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../../hooks/useApi';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useForm } from 'react-hook-form';
import { useEffect, type ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { Spinner } from '../../components/ui/Spinner';
import {
    Store,
    Mail,
    Phone,
    MessageCircle,
    MapPin,
    Facebook,
    Instagram,
    Clock3,
    Settings as SettingsIcon,
    Power,
    CheckCircle2
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

const DAYS: Array<keyof BusinessHours> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

export const SettingsPage = () => {
    const queryClient = useQueryClient();

    const {
        data: settings,
        isLoading,
        isError
    } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings
    });

    const { register, handleSubmit, reset, watch } = useForm<SiteSettings>({
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
            toast.success('Settings saved successfully');
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

    const ordersEnabled = watch('ordersEnabled');

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
                <div className="admin-page-container max-w-[1080px]">
                    <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center">
                        <h3 className="text-lg font-semibold text-red-700">
                            Failed to load settings
                        </h3>
                        <p className="mt-2 text-sm text-red-600">
                            Please refresh and try again.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-container max-w-[1080px]">
                {/* Header */}
                <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Dashboard
                            </p>
                            <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[30px]">
                                <SettingsIcon size={24} className="text-slate-900" />
                                Site Settings
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Manage your restaurant contact details, social links, opening hours and online ordering.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <MetricCard
                                label="Info"
                                value="General"
                                icon={<Store size={16} />}
                            />
                            <MetricCard
                                label="Hours"
                                value="7 Days"
                                icon={<Clock3 size={16} />}
                            />
                            <MetricCard
                                label="Orders"
                                value={ordersEnabled ? 'Enabled' : 'Disabled'}
                                icon={<Power size={16} />}
                            />
                            <MetricCard
                                label="Status"
                                value="Ready"
                                icon={<CheckCircle2 size={16} />}
                            />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* General Info */}
                    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-5 md:p-6">
                            <SectionTitle
                                title="General Info"
                                subtitle="Basic business contact details shown across the website."
                            />

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <InputBlock
                                    label="Site Name"
                                    icon={<Store size={16} />}
                                    placeholder="Tamil Food Thaya"
                                    registration={register('siteName')}
                                />

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

                                <div className="md:col-span-2">
                                    <InputBlock
                                        label="Address"
                                        icon={<MapPin size={16} />}
                                        placeholder="Restaurant address"
                                        registration={register('address')}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Media */}
                    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-5 md:p-6">
                            <SectionTitle
                                title="Social Media"
                                subtitle="Add your public social links for the website footer and contact sections."
                            />

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <InputBlock
                                    label="Facebook URL"
                                    icon={<Facebook size={16} />}
                                    placeholder="https://facebook.com/..."
                                    registration={register('facebookUrl')}
                                />

                                <InputBlock
                                    label="Instagram URL"
                                    icon={<Instagram size={16} />}
                                    placeholder="https://instagram.com/..."
                                    registration={register('instagramUrl')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business Hours */}
                    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-5 md:p-6">
                            <SectionTitle
                                title="Business Hours"
                                subtitle="Set the opening hours shown on the website for each day."
                            />

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {DAYS.map((day) => (
                                    <InputBlock
                                        key={day}
                                        label={capitalize(day)}
                                        icon={<Clock3 size={16} />}
                                        placeholder="e.g. 12:00 - 22:00"
                                        registration={register(`businessHours.${day}`)}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders Toggle */}
                    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-5 md:p-6">
                            <SectionTitle
                                title="Online Orders"
                                subtitle="Enable or disable online order functionality for customers."
                            />

                            <div className="mt-5">
                                <ToggleCard
                                    title={
                                        ordersEnabled
                                            ? 'Online Orders Enabled'
                                            : 'Online Orders Disabled'
                                    }
                                    description="Toggle whether customers can place orders through the website."
                                    checked={Boolean(ordersEnabled)}
                                    inputProps={register('ordersEnabled')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="h-11 rounded-full border border-slate-900 bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MetricCard = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
                {icon}
                <p className="text-[11px] font-medium uppercase tracking-[0.18em]">
                    {label}
                </p>
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {title}
            </p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
    );
};

const InputBlock = ({
    label,
    icon,
    placeholder,
    registration
}: {
    label: string;
    icon?: ReactNode;
    placeholder?: string;
    registration: any;
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </span>
                )}

                <input
                    {...registration}
                    placeholder={placeholder}
                    className={`h-11 w-full rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100 ${
                        icon ? 'pl-11 pr-4' : 'px-4'
                    }`}
                />
            </div>
        </div>
    );
};

const ToggleCard = ({
    title,
    description,
    checked,
    inputProps
}: {
    title: string;
    description: string;
    checked: boolean;
    inputProps: any;
}) => {
    return (
        <label
            className={`flex w-full cursor-pointer items-center justify-between rounded-[22px] border px-4 py-4 text-left transition ${
                checked
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-stone-50'
            }`}
        >
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <p
                    className={`mt-1 text-xs leading-5 ${
                        checked ? 'text-slate-300' : 'text-slate-500'
                    }`}
                >
                    {description}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <input type="checkbox" className="sr-only" {...inputProps} />
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        checked ? 'bg-white text-slate-900' : 'bg-stone-100 text-slate-500'
                    }`}
                >
                    <Power size={16} />
                </div>
            </div>
        </label>
    );
};

const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);
