import { useForm } from 'react-hook-form';
import { registerUser } from '../../hooks/useApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const RegisterPage = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            await registerUser(data);
            toast.success('Registratie succesvol! Controleer uw e-mail voor de PIN.');
            navigate('/verify-email', { state: { email: data.email } });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registratie mislukt. Probeer het opnieuw.';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-950 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="Tamil Food Thaya" className="h-20 w-auto object-contain mx-auto mb-4" />
                    <h1 className="text-2xl font-extrabold text-white">Tamil Food Thaya</h1>
                    <p className="text-dark-400 text-sm mt-1">Create your account</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6">Registreren</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-1.5">Naam</label>
                                <input
                                    {...register('name', { required: 'Naam is verplicht' })}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                                    placeholder="Uw naam"
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{String(errors.name.message)}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-1.5">Gebruikersnaam</label>
                                <input
                                    {...register('username', { required: 'Gebruikersnaam is verplicht' })}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                                    placeholder="username"
                                />
                                {errors.username && <p className="text-red-400 text-xs mt-1">{String(errors.username.message)}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">Telefoonnummer</label>
                            <input
                                {...register('phone', { required: 'Telefoonnummer is verplicht' })}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                                placeholder="0612345678"
                            />
                            {errors.phone && <p className="text-red-400 text-xs mt-1">{String(errors.phone.message)}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">E-mail</label>
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'E-mail is verplicht',
                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Ongeldig e-mailadres' }
                                })}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                                placeholder="uw@email.com"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{String(errors.email.message)}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">Adres</label>
                            <input
                                {...register('address')}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                                placeholder="Straat 123, Stad"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">Wachtwoord</label>
                            <input
                                type="password"
                                {...register('password', { required: 'Wachtwoord is verplicht', minLength: { value: 6, message: 'Minimaal 6 tekens' } })}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1">{String(errors.password.message)}</p>}
                        </div>

                        <button type="submit" className="btn-primary w-full mt-4" disabled={isSubmitting}>
                            {isSubmitting ? 'Bezig...' : 'Account aanmaken'}
                        </button>
                    </form>
                    <p className="mt-5 text-center text-sm text-dark-400">
                        Al een account?{' '}
                        <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                            Inloggen
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
