import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../hooks/useApi';
import { SEO } from '../components/SEO';
import { ShieldCheck, Mail } from 'lucide-react';
import FluidBackground from '../components/FluidBackground';
import { useFeedback } from '../context/FeedbackContext';
import { Logo } from '../components/Logo';

export const VerifyEmail = () => {
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();
    const { show } = useFeedback();
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            show({ type: 'error', message: 'Email not found. Please register again.' });
            return;
        }

        setIsLoading(true);
        try {
            await verifyEmail({ email, pin });
            show({ type: 'success', message: t('auth.verify.success', 'Email successfully verified! You can now login.') });
            navigate('/login');
        } catch (error: any) {
            console.error(error);
            show({ type: 'error', message: error.response?.data?.message || t('auth.verify.failed', 'Verification failed') });
        } finally {
            setIsLoading(false);
        }
    };

    const back = !email ? (
        <div className="auth-page">
            <SEO title="Verify Email" description="Verify your Tamil Food Thaya email address." />
            <FluidBackground intensity={0.5} parallaxStrength={6} deepParallax={10} />
            <div className="auth-card surface">
                <div className="auth-copy auth-copy--login">
                    <img className="auth-copy__photo" src="/hero-catering.jpg" alt="A buffet of Tamil dishes ready to share" width="1536" height="1024" decoding="async" />
                    <Logo />
                    <h1>Nothing to verify.</h1>
                    <p>No email address was provided. Head back to registration to create your account.</p>
                </div>
                <div className="auth-form">
                    <p className="auth-error">No email provided for verification.</p>
                    <button type="button" className="btn-primary" onClick={() => navigate('/register')}>
                        {t('auth.verify.goRegister', 'Go to Register')}
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    if (back) return back;

    return (
        <div className="auth-page">
            <SEO title="Verify Email" description="Verify your Tamil Food Thaya email address." />
            <FluidBackground intensity={0.5} parallaxStrength={6} deepParallax={10} />
            <div className="auth-card auth-card--wide surface">
                <div className="auth-copy auth-copy--login">
                    <img className="auth-copy__photo" src="/hero-catering.jpg" alt="A buffet of Tamil dishes ready to share" width="1536" height="1024" decoding="async" />
                    <Logo />
                    <h1>Check your inbox.</h1>
                    <p>We sent a 6-digit PIN to confirm your email. Enter it below to unlock the kitchen.</p>

                    <div className="verify-hint">
                        <Mail size={16} />
                        <span>{email}</span>
                    </div>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <label>
                        {t('auth.verify.pinLabel', 'Verification PIN')}
                        <span>
                            <ShieldCheck size={17} />
                            <input
                                type="text"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength={6}
                                placeholder="123456"
                                required
                                autoComplete="one-time-code"
                            />
                        </span>
                    </label>

                    <p className="verify-note">{t('auth.verify.pinHint', 'Check the server console for the mock PIN.')}</p>

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? t('auth.verify.verifying', 'Verifying...') : t('auth.verify.submit', 'Verify')}
                    </button>

                    <p className="auth-switch">
                        {t('auth.verify.rightEmail', 'Wrong address?')}{' '}
                        <button type="button" onClick={() => navigate('/register')}>
                            {t('auth.verify.registerAgain', 'Register again')}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};
