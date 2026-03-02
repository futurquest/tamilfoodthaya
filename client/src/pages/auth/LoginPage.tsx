import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../hooks/useApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const LoginPage = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            const res = await loginUser(data);
            login(res.access_token, res.user);
            toast.success(`Welkom terug, ${res.user.username}!`);
            navigate(res.user.role === 'admin' ? '/admin/dashboard' : '/');
        } catch (error) {
            toast.error('Login mislukt. Controleer uw gegevens.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-950 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="Tamil Food Thaya" className="h-20 w-auto object-contain mx-auto mb-4" />
                    <h1 className="text-2xl font-extrabold text-white">Tamil Food Thaya</h1>
                    <p className="text-dark-400 text-sm mt-1">Sign in to your account</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6">Inloggen</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">Gebruikersnaam</label>
                            <input
                                {...register('username', { required: true })}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
                                placeholder="Uw gebruikersnaam"
                            />
                            {errors.username && <p className="text-red-400 text-xs mt-1">Verplicht veld</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">Wachtwoord</label>
                            <input
                                type="password"
                                {...register('password', { required: true })}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1">Verplicht veld</p>}
                        </div>
                        <button type="submit" className="btn-primary w-full mt-2" disabled={isSubmitting}>
                            {isSubmitting ? 'Even wachten...' : 'Inloggen'}
                        </button>
                    </form>
                    <p className="mt-5 text-center text-sm text-dark-400">
                        Nog geen account?{' '}
                        <Link to="/register" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                            Nu registreren
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
