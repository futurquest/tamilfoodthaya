import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerUser } from '../../hooks/useApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

export const RegisterPage = () => {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const [showPw, setShowPw] = useState(false);

    const onSubmit = async (data: any) => {
        try {
            await registerUser(data);
            toast.success(t('auth.register.registerSuccess', 'Registration successful! Check your email for the PIN.'));
            navigate('/verify-email', { state: { email: data.email } });
        } catch (error: any) {
            const message = error.response?.data?.message || t('auth.register.registerError', 'Registration failed. Please try again.');
            toast.error(message);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .rp-page {
                    font-family: 'DM Sans', sans-serif;
                    min-height: 100vh;
                    background: #f0ede8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                }

                /* Decorative blobs */
                .rp-blob {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                }
                .rp-blob-1 {
                    width: 90px; height: 90px;
                    background: #e8a020;
                    top: 8%; left: 18%;
                    opacity: 0.85;
                }
                .rp-blob-2 {
                    width: 70px; height: 70px;
                    background: #e8a020;
                    bottom: 10%; right: 14%;
                    opacity: 0.85;
                }

                /* Starburst SVG */
                .rp-star {
                    position: absolute;
                    bottom: 9%; left: 14%;
                    pointer-events: none;
                    opacity: 0.7;
                }

                /* ── Main card ── */
                .rp-card {
                    background: #fff;
                    border-radius: 28px;
                    width: 100%;
                    max-width: 920px;
                    min-height: 600px;
                    display: flex;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06);
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                }

                /* ── Left: form ── */
                .rp-form-side {
                    flex: 0 0 46%;
                    padding: 44px 48px 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    overflow-y: auto;
                    max-height: 600px;
                }

                .rp-welcome {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(38px, 5vw, 56px);
                    font-weight: 700;
                    color: #1a1209;
                    line-height: 1.05;
                    margin-bottom: 6px;
                }
                .rp-welcome em { font-style: italic; color: #e8a020; }

                .rp-tagline {
                    font-size: 13.5px;
                    color: #b8a898;
                    font-weight: 300;
                    margin-bottom: 28px;
                    line-height: 1.5;
                }

                /* Input fields */
                .rp-field { position: relative; margin-bottom: 14px; }
                .rp-field-icon {
                    position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
                    color: #c8bfb4; pointer-events: none;
                    display: flex; align-items: center;
                }
                .rp-input {
                    width: 100%;
                    padding: 14px 16px 14px 42px;
                    background: #f5f2ee;
                    border: 1.5px solid transparent;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #1a1209;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }
                .rp-input::placeholder { color: #c0b5a8; }
                .rp-input:focus {
                    border-color: #e8a020;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(232,160,32,0.1);
                }
                .rp-input.err { border-color: #ef4444; }
                .rp-error { font-size: 11.5px; color: #ef4444; margin-top: 4px; padding-left: 4px; }

                .rp-pw-eye {
                    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: #c0b5a8; padding: 4px;
                    display: flex; align-items: center;
                    transition: color 0.2s;
                }
                .rp-pw-eye:hover { color: #6b5a3a; }

                /* Submit */
                .rp-submit {
                    width: 100%;
                    margin-top: 6px;
                    padding: 15px;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    background: #1a1209;
                    color: #f5efe4;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14.5px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 16px rgba(26,18,9,0.18);
                }
                .rp-submit:hover:not(:disabled) {
                    background: #2e2010;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(26,18,9,0.25);
                }
                .rp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

                @keyframes rp-spin { to { transform: rotate(360deg); } }
                .rp-spinner {
                    width: 16px; height: 16px; border-radius: 50%;
                    border: 2px solid rgba(245,239,228,0.3);
                    border-top-color: #f5efe4;
                    animation: rp-spin 0.7s linear infinite;
                    flex-shrink: 0;
                }

                /* Login link */
                .rp-login {
                    margin-top: 16px;
                    text-align: center;
                    font-size: 13px; color: #b8a898;
                }
                .rp-login a {
                    color: #b87a10; font-weight: 600;
                    text-decoration: none; transition: color 0.2s;
                }
                .rp-login a:hover { color: #e8a020; }

                /* ── Right: image panel ── */
                .rp-img-side {
                    flex: 1;
                    position: relative;
                    margin: 14px 14px 14px 0;
                    border-radius: 20px;
                    overflow: hidden;
                    min-height: 460px;
                }
                .rp-img-bg {
                    position: absolute; inset: 0;
                    background-image: url('https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1000&auto=format&fit=crop&q=85');
                    background-size: cover;
                    background-position: center;
                }
                .rp-img-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(
                        160deg,
                        rgba(184,122,16,0.55) 0%,
                        rgba(232,160,32,0.3) 40%,
                        rgba(10,8,6,0.55) 100%
                    );
                }
                .rp-img-grain {
                    position: absolute; inset: 0; opacity: 0.04; pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    background-size: 200px;
                }

                /* Brand pill top of image */
                .rp-img-brand {
                    position: absolute; top: 20px; left: 20px;
                    display: flex; align-items: center; gap: 8px; z-index: 2;
                    background: rgba(255,255,255,0.14);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 100px;
                    padding: 6px 14px 6px 8px;
                }
                .rp-img-brand-dot {
                    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
                    background: linear-gradient(135deg, #b87a10, #e8a020);
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Playfair Display', serif; font-weight: 700;
                    font-size: 13px; color: #0c0a08;
                }
                .rp-img-brand-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 13.5px; font-weight: 700; color: #fff;
                }
                .rp-img-brand-name em { font-style: italic; color: #f5c842; }

                /* Caption bottom of image */
                .rp-img-caption {
                    position: absolute; bottom: 0; left: 0; right: 0;
                    padding: 0 26px 28px; z-index: 2;
                    background: linear-gradient(to top, rgba(10,8,6,0.75) 0%, transparent 100%);
                }
                .rp-img-tag {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: rgba(232,160,32,0.18); border: 1px solid rgba(232,160,32,0.35);
                    border-radius: 100px; padding: 4px 12px; margin-bottom: 10px;
                    font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
                    text-transform: uppercase; color: #f5c842;
                }
                .rp-img-tag-dot {
                    width: 5px; height: 5px; border-radius: 50%; background: #e8a020;
                    animation: rp-pulse 2s ease-in-out infinite;
                }
                @keyframes rp-pulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(232,160,32,0.5); }
                    50%      { box-shadow: 0 0 0 4px rgba(232,160,32,0); }
                }
                .rp-img-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 22px; font-weight: 700; color: #f5efe4;
                    line-height: 1.2;
                }
                .rp-img-title em { font-style: italic; color: #e8a020; }

                /* Two-column fields */
                .rp-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 4px;
                }

                /* Responsive */
                @media (max-width: 760px) {
                    .rp-img-side { display: none; }
                    .rp-form-side { flex: 1; padding: 44px 32px; }
                    .rp-card { max-width: 480px; min-height: auto; }
                    .rp-row { grid-template-columns: 1fr; }
                }
                @media (max-width: 480px) {
                    .rp-form-side { padding: 36px 24px; }
                    .rp-welcome { font-size: 36px; }
                }
            `}</style>

            <div className="rp-page">
                {/* Decorative blobs */}
                <div className="rp-blob rp-blob-1" />
                <div className="rp-blob rp-blob-2" />

                {/* Starburst */}
                <svg className="rp-star" width="72" height="72" viewBox="0 0 72 72" fill="none">
                    {[0,22.5,45,67.5,90,112.5,135,157.5].map((deg, i) => (
                        <line
                            key={i}
                            x1="36" y1="36"
                            x2={36 + 32 * Math.cos((deg * Math.PI) / 180)}
                            y2={36 + 32 * Math.sin((deg * Math.PI) / 180)}
                            stroke="#e8a020" strokeWidth="5" strokeLinecap="round"
                        />
                    ))}
                </svg>

                {/* ── Card ── */}
                <div className="rp-card">

                    {/* Left: Form */}
                    <div className="rp-form-side">
                        <h1 className="rp-welcome">{t('auth.register.welcome', 'Get Started')} <em>{t('auth.register.with', 'with Tamil Food Thaya')}</em></h1>
                        <p className="rp-tagline">{t('auth.register.tagline', 'Create an account to order and track your events.')}</p>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>

                            {/* Name and Username */}
                            <div className="rp-row">
                                <div className="rp-field">
                                    <span className="rp-field-icon"><User size={16} /></span>
                                    <input
                                        {...register('name', { required: t('form.required', 'Required') })}
                                        className={`rp-input${errors.name ? ' err' : ''}`}
                                        placeholder={t('form.name', 'Name')}
                                        autoComplete="name"
                                    />
                                    {errors.name && <p className="rp-error">{String(errors.name.message)}</p>}
                                </div>
                                <div className="rp-field">
                                    <span className="rp-field-icon"><User size={16} /></span>
                                    <input
                                        {...register('username', { required: t('form.required', 'Required') })}
                                        className={`rp-input${errors.username ? ' err' : ''}`}
                                        placeholder={t('auth.login.username', 'Username')}
                                        autoComplete="username"
                                    />
                                    {errors.username && <p className="rp-error">{String(errors.username.message)}</p>}
                                </div>
                            </div>

                            {/* Phone and Email */}
                            <div className="rp-row">
                                <div className="rp-field">
                                    <span className="rp-field-icon"><Phone size={16} /></span>
                                    <input
                                        {...register('phone', { required: t('form.required', 'Required') })}
                                        className={`rp-input${errors.phone ? ' err' : ''}`}
                                        placeholder={t('form.phone', 'Phone')}
                                        autoComplete="tel"
                                    />
                                    {errors.phone && <p className="rp-error">{String(errors.phone.message)}</p>}
                                </div>
                                <div className="rp-field">
                                    <span className="rp-field-icon"><Mail size={16} /></span>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: t('form.required', 'Required'),
                                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('form.invalidEmail', 'Invalid email') }
                                        })}
                                        className={`rp-input${errors.email ? ' err' : ''}`}
                                        placeholder={t('form.email', 'Email')}
                                        autoComplete="email"
                                    />
                                    {errors.email && <p className="rp-error">{String(errors.email.message)}</p>}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="rp-field">
                                <span className="rp-field-icon"><MapPin size={16} /></span>
                                <input
                                    {...register('address')}
                                    className="rp-input"
                                    placeholder={t('catering.form.location', 'Location')}
                                    autoComplete="street-address"
                                />
                            </div>

                            {/* Password */}
                            <div className="rp-field">
                                <span className="rp-field-icon"><Lock size={16} /></span>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    {...register('password', { required: t('form.required', 'Required'), minLength: { value: 6, message: 'Minimum 6 characters' } })}
                                    className={`rp-input${errors.password ? ' err' : ''}`}
                                    placeholder={t('auth.login.password', 'Password')}
                                    style={{ paddingRight: 42 }}
                                    autoComplete="new-password"
                                />
                                <button type="button" className="rp-pw-eye" onClick={() => setShowPw(p => !p)} aria-label="Toggle password">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {errors.password && <p className="rp-error">{String(errors.password.message)}</p>}
                            </div>

                            <button type="submit" className="rp-submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <><span className="rp-spinner" /> {t('auth.register.registering', 'Creating...')}</>
                                    : t('auth.register.registerBtn', 'Create Account')
                                }
                            </button>
                        </form>

                        <p className="rp-login">
                            {t('auth.register.haveAccount', 'Already have an account?')}{' '}
                            <Link to="/login">{t('auth.register.signIn', 'Sign in here')}</Link>
                        </p>
                    </div>

                    {/* Right: Image */}
                    <div className="rp-img-side">
                        <div className="rp-img-bg" />
                        <div className="rp-img-overlay" />
                        <div className="rp-img-grain" />

                        <div className="rp-img-brand">
                            <div className="rp-img-brand-dot">T</div>
                            <span className="rp-img-brand-name">Tamil Food <em>Thaya</em></span>
                        </div>

                        <div className="rp-img-caption">
                            <div className="rp-img-tag">
                                <span className="rp-img-tag-dot" />
                                Authentic Tamil Cuisine
                            </div>
                            <h2 className="rp-img-title">
                                Join our<br /><em>community</em>
                            </h2>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};
