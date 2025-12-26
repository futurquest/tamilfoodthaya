import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../../hooks/useApi';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Spinner } from '../../components/ui/Spinner';

export const SettingsPage = () => {
    const queryClient = useQueryClient();
    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings
    });

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        if (settings) {
            reset(settings);
            // Handle nested objects manually if reset doesn't work perfectly for them
            if (settings.businessHours) {
                setValue('businessHours.monday', settings.businessHours.monday);
                setValue('businessHours.tuesday', settings.businessHours.tuesday);
                setValue('businessHours.wednesday', settings.businessHours.wednesday);
                setValue('businessHours.thursday', settings.businessHours.thursday);
                setValue('businessHours.friday', settings.businessHours.friday);
                setValue('businessHours.saturday', settings.businessHours.saturday);
                setValue('businessHours.sunday', settings.businessHours.sunday);
            }
        }
    }, [settings, reset, setValue]);

    const mutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Instellingen opgeslagen!');
        },
        onError: () => {
            toast.error('Opslaan mislukt.');
        }
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-tamil-charcoal mb-6">Site Settings</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-xl font-bold mb-4">General Info</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Site Name</label>
                                <input {...register('siteName')} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Email</label>
                                <input {...register('email')} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Phone</label>
                                <input {...register('phone')} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">WhatsApp</label>
                                <input {...register('whatsapp')} className="w-full p-2 border rounded" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold mb-1">Address</label>
                                <input {...register('address')} className="w-full p-2 border rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-xl font-bold mb-4">Social Media</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Facebook URL</label>
                                <input {...register('facebookUrl')} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Instagram URL</label>
                                <input {...register('instagramUrl')} className="w-full p-2 border rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-xl font-bold mb-4">Business Hours</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                <div key={day}>
                                    <label className="block text-sm font-bold mb-1 capitalize">{day}</label>
                                    <input {...register(`businessHours.${day}`)} className="w-full p-2 border rounded" placeholder="e.g. 12:00 - 22:00" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" {...register('ordersEnabled')} id="ordersEnabled" className="w-4 h-4" />
                            <label htmlFor="ordersEnabled" className="font-bold">Enable Online Orders</label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
