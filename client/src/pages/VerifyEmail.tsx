import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../hooks/useApi';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { Card, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';

export const VerifyEmail = () => {
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Email not found. Please register again.');
            return;
        }

        setIsLoading(true);
        try {
            await verifyEmail({ email, pin });
            toast.success('Email successfully verified! You can now login.');
            navigate('/login');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) {
        return (
            <Container className="pt-32 pb-12 flex justify-center">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h2 className="text-xl font-bold mb-4">Error</h2>
                        <p className="mb-4">No email provided for verification.</p>
                        <Button onClick={() => navigate('/register')}>Go to Register</Button>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="pt-32 pb-12 flex justify-center">
            <Card className="w-full max-w-md">
                <CardContent className="p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-tamil-charcoal">Verify Email</h1>
                        <p className="text-gray-500 text-sm mt-2">
                            Enter the 6-digit PIN sent to {email}.<br />
                            (Check the server console for the mock PIN)
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Verification PIN</label>
                            <input
                                type="text"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-tamil-maroon outline-none"
                                maxLength={6}
                                placeholder="123456"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};
