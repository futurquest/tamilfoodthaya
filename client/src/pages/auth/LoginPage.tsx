import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../hooks/useApi';
import { useNavigate, Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

export const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
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
        <div className="pt-32 pb-24 bg-gray-50 min-h-screen flex items-center justify-center">
            <Container>
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-bold mb-6 text-center">Inloggen</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Gebruikersnaam</label>
                                <input {...register('username', { required: true })} className="w-full p-2 border rounded" />
                                {errors.username && <span className="text-red-500 text-xs">Verplicht veld</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Wachtwoord</label>
                                <input type="password" {...register('password', { required: true })} className="w-full p-2 border rounded" />
                                {errors.password && <span className="text-red-500 text-xs">Verplicht veld</span>}
                            </div>
                            <Button type="submit" className="w-full">Login</Button>
                        </form>
                        <p className="mt-4 text-center text-sm">
                            Nog geen account? <Link to="/register" className="text-tamil-maroon font-bold">Nu registreren</Link>
                        </p>
                    </CardContent>
                </Card>
            </Container>
        </div>
    );
};
