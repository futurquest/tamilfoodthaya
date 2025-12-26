import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const loginSchema = z.object({
    username: z.string().min(1, 'Gebruikersnaam is verplicht'),
    password: z.string().min(1, 'Wachtwoord is verplicht'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const AdminLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await axios.post('http://localhost:3000/auth/login', data);
            login(response.data.access_token, response.data.user);
            navigate('/admin/dashboard');
        } catch (error) {
            alert('Ongeldige inloggegevens.');
        }
    };

    return (
        <div className="min-h-screen bg-tamil-charcoal flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-tamil-maroon rounded-full flex items-center justify-center text-tamil-gold font-bold text-3xl mx-auto mb-4">T</div>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Tamil Food Thaya</h1>
                    <p className="text-gray-400 mt-2">Management Portal Login</p>
                </div>

                <Card>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Gebruikersnaam</label>
                                <input
                                    {...register('username')}
                                    className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none"
                                />
                                {errors.username && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.username.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Wachtwoord</label>
                                <input
                                    type="password"
                                    {...register('password')}
                                    className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none"
                                />
                                {errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.password.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Inloggen...' : 'Inloggen'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
