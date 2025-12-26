import { useForm } from 'react-hook-form';
import { registerUser } from '../../hooks/useApi';
import { useNavigate, Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

export const RegisterPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            await registerUser(data);
            toast.success('Registratie succesvol! Controleer uw dashboard voor de PIN.');
            navigate('/verify-email', { state: { email: data.email } });
        } catch (error) {
            toast.error('Registratie mislukt. Probeer het opnieuw.');
        }
    };

    return (
        <div className="pt-32 pb-24 bg-gray-50 min-h-screen flex items-center justify-center">
            <Container>
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-bold mb-6 text-center">Registreren</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Gebruikersnaam</label>
                                <input {...register('username', { required: true })} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">E-mail</label>
                                <input type="email" {...register('email', {
                                    required: true,
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Ongeldig e-mailadres"
                                    }
                                })} className="w-full p-2 border rounded" />
                                {errors.email && <span className="text-red-500 text-xs">{String(errors.email.message || 'Verplicht veld')}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Wachtwoord</label>
                                <input type="password" {...register('password', { required: true, minLength: 6 })} className="w-full p-2 border rounded" />
                            </div>
                            <Button type="submit" className="w-full">Registreren</Button>
                        </form>
                        <p className="mt-4 text-center text-sm">
                            Al een account? <Link to="/login" className="text-tamil-maroon font-bold">Inloggen</Link>
                        </p>
                    </CardContent>
                </Card>
            </Container>
        </div>
    );
};
