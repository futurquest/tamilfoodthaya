import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../hooks/useApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export const LoginPage = () => {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPw, setShowPw] = useState(false);
    const [authError, setAuthError] = useState('');

    const onSubmit = async (data: any) => {
        setAuthError('');
        try {
            const res = await loginUser(data);
            login(res.access_token, res.user);
            toast.success(t('auth.login.loginSuccess', {defaultValue: `Welcome back, ${res.user.username}!`}).replace('{username}', res.user.username));
            navigate(res.user.role === 'admin' ? '/admin/dashboard' : '/');
        } catch {
            setAuthError(t('auth.login.loginError', 'Login failed. Please check your credentials.'));
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .lp-page {
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

                /* Decorative blobs like reference */
                .lp-blob {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                }
                .lp-blob-1 {
                    width: 90px; height: 90px;
                    background: #e8a020;
                    top: 8%; left: 18%;
                    opacity: 0.85;
                }
                .lp-blob-2 {
                    width: 70px; height: 70px;
                    background: #e8a020;
                    bottom: 10%; right: 14%;
                    opacity: 0.85;
                }
                .lp-blob-3 {
                    /* Starburst / asterisk shape bottom-left */
                    width: 80px; height: 80px;
                    background: none;
                    bottom: 12%; left: 16%;
                }

                /* Starburst SVG */
                .lp-star {
                    position: absolute;
                    bottom: 9%; left: 14%;
                    pointer-events: none;
                    opacity: 0.7;
                }

                /* ── Main card ── */
                .lp-card {
                    background: #fff;
                    border-radius: 28px;
                    width: 100%;
                    max-width: 920px;
                    min-height: 560px;
                    display: flex;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06);
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                }

                /* ── Left: form ── */
                .lp-form-side {
                    flex: 0 0 46%;
                    padding: 52px 48px 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .lp-welcome {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(38px, 5vw, 56px);
                    font-weight: 700;
                    color: #1a1209;
                    line-height: 1.05;
                    margin-bottom: 6px;
                }
                .lp-welcome em { font-style: italic; color: #e8a020; }

                .lp-tagline {
                    font-size: 13.5px;
                    color: #b8a898;
                    font-weight: 300;
                    margin-bottom: 34px;
                    line-height: 1.5;
                }

                /* Input fields */
                .lp-field { position: relative; margin-bottom: 14px; }
                .lp-field-icon {
                    position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
                    color: #c8bfb4; pointer-events: none;
                    display: flex; align-items: center;
                }
                .lp-input {
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
                .lp-input::placeholder { color: #c0b5a8; }
                .lp-input:focus {
                    border-color: #e8a020;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(232,160,32,0.1);
                }
                .lp-input.err { border-color: #ef4444; }
                .lp-error { font-size: 11.5px; color: #ef4444; margin-top: 4px; padding-left: 4px; }
                .lp-auth-error {
                    margin-top: 6px;
                    margin-bottom: 2px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    border: 1px solid rgba(239,68,68,0.25);
                    background: rgba(239,68,68,0.08);
                    color: #b91c1c;
                    font-size: 12.5px;
                    line-height: 1.4;
                    font-weight: 500;
                }

                .lp-pw-eye {
                    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: #c0b5a8; padding: 4px;
                    display: flex; align-items: center;
                    transition: color 0.2s;
                }
                .lp-pw-eye:hover { color: #6b5a3a; }

                /* Submit */
                .lp-submit {
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
                .lp-submit:hover:not(:disabled) {
                    background: #2e2010;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(26,18,9,0.25);
                }
                .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

                @keyframes lp-spin { to { transform: rotate(360deg); } }
                .lp-spinner {
                    width: 16px; height: 16px; border-radius: 50%;
                    border: 2px solid rgba(245,239,228,0.3);
                    border-top-color: #f5efe4;
                    animation: lp-spin 0.7s linear infinite;
                    flex-shrink: 0;
                }

                /* Or divider */
                .lp-or {
                    display: flex; align-items: center; gap: 10px;
                    margin: 18px 0 14px;
                }
                .lp-or-line { flex: 1; height: 1px; background: #ede9e3; }
                .lp-or-text {
                    font-size: 12px; color: #c0b5a8; white-space: nowrap;
                    font-weight: 500;
                }
                .lp-or-text strong { color: #1a1209; }

                /* Social buttons */
                .lp-social {
                    width: 100%; padding: 12px 16px;
                    border-radius: 12px; border: 1.5px solid #ede9e3;
                    background: #fff; cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13.5px; font-weight: 500; color: #1a1209;
                    display: flex; align-items: center; gap: 10px;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                    margin-bottom: 10px;
                }
                .lp-social:hover {
                    border-color: #c0b5a8;
                    background: #faf7f2;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }
                .lp-social-icon { width: 20px; height: 20px; flex-shrink: 0; }

                /* Register */
                .lp-register {
                    margin-top: 18px;
                    text-align: center;
                    font-size: 13px; color: #b8a898;
                }
                .lp-register a {
                    color: #b87a10; font-weight: 600;
                    text-decoration: none; transition: color 0.2s;
                }
                .lp-register a:hover { color: #e8a020; }

                /* ── Right: image panel ── */
                .lp-img-side {
                    flex: 1;
                    position: relative;
                    margin: 14px 14px 14px 0;
                    border-radius: 20px;
                    overflow: hidden;
                    min-height: 460px;
                }
                .lp-img-bg {
                    position: absolute; inset: 0;
                    background-image: url('https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1000&auto=format&fit=crop&q=85');
                    background-size: cover;
                    background-position: center;
                }
                .lp-img-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(
                        160deg,
                        rgba(184,122,16,0.55) 0%,
                        rgba(232,160,32,0.3) 40%,
                        rgba(10,8,6,0.55) 100%
                    );
                }
                .lp-img-grain {
                    position: absolute; inset: 0; opacity: 0.04; pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    background-size: 200px;
                }

                /* Brand pill top of image */
                .lp-img-brand {
                    position: absolute; top: 20px; left: 20px;
                    display: flex; align-items: center; gap: 8px; z-index: 2;
                    background: rgba(255,255,255,0.14);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 100px;
                    padding: 6px 14px 6px 8px;
                }
                .lp-img-brand-dot {
                    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
                    background: linear-gradient(135deg, #b87a10, #e8a020);
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Playfair Display', serif; font-weight: 700;
                    font-size: 13px; color: #0c0a08;
                }
                .lp-img-brand-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 13.5px; font-weight: 700; color: #fff;
                }
                .lp-img-brand-name em { font-style: italic; color: #f5c842; }

                /* Caption bottom of image */
                .lp-img-caption {
                    position: absolute; bottom: 0; left: 0; right: 0;
                    padding: 0 26px 28px; z-index: 2;
                    background: linear-gradient(to top, rgba(10,8,6,0.75) 0%, transparent 100%);
                }
                .lp-img-tag {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: rgba(232,160,32,0.18); border: 1px solid rgba(232,160,32,0.35);
                    border-radius: 100px; padding: 4px 12px; margin-bottom: 10px;
                    font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
                    text-transform: uppercase; color: #f5c842;
                }
                .lp-img-tag-dot {
                    width: 5px; height: 5px; border-radius: 50%; background: #e8a020;
                    animation: lp-pulse 2s ease-in-out infinite;
                }
                @keyframes lp-pulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(232,160,32,0.5); }
                    50%      { box-shadow: 0 0 0 4px rgba(232,160,32,0); }
                }
                .lp-img-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 22px; font-weight: 700; color: #f5efe4;
                    line-height: 1.2;
                }
                .lp-img-title em { font-style: italic; color: #e8a020; }

                /* Responsive */
                @media (max-width: 760px) {
                    .lp-img-side { display: none; }
                    .lp-form-side { flex: 1; padding: 44px 32px; }
                    .lp-card { max-width: 480px; }
                }
                @media (max-width: 480px) {
                    .lp-form-side { padding: 36px 24px; }
                    .lp-welcome { font-size: 36px; }
                }
            `}</style>

            <div className="lp-page">

                {/* Decorative blobs */}
                <div className="lp-blob lp-blob-1" />
                <div className="lp-blob lp-blob-2" />

                {/* Starburst (bottom-left, like reference) */}
                <svg className="lp-star" width="72" height="72" viewBox="0 0 72 72" fill="none">
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
                <div className="lp-card">

                    {/* Left: Form */}
                    <div className="lp-form-side">
                        <h1 className="lp-welcome">{t('auth.login.welcome', 'Welcome')} <em>{t('auth.login.back', 'back')}</em></h1>
                        <p className="lp-tagline">{t('auth.login.tagline', 'We are happy to see you again at Tamil Food Thaya.')}</p>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>

                            {/* Username */}
                            <div className="lp-field">
                                <span className="lp-field-icon"><User size={16} /></span>
                                <input
                                    {...register('username', { required: 'Verplicht veld' })}
                                    className={`lp-input${errors.username ? ' err' : ''}`}
                                    placeholder={t('auth.login.username', 'Username')}
                                    autoComplete="username"
                                />
                                {errors.username && <p className="lp-error">{String(errors.username.message)}</p>}
                            </div>

                            {/* Password */}
                            <div className="lp-field">
                                <span className="lp-field-icon"><Lock size={16} /></span>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    {...register('password', { required: 'Verplicht veld' })}
                                    className={`lp-input${errors.password ? ' err' : ''}`}
                                    placeholder={t('auth.login.password', 'Password')}
                                    style={{ paddingRight: 42 }}
                                    autoComplete="current-password"
                                />
                                <button type="button" className="lp-pw-eye" onClick={() => setShowPw(p => !p)} aria-label="Toggle password">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {errors.password && <p className="lp-error">{String(errors.password.message)}</p>}
                            </div>

                            {authError && <p className="lp-auth-error">{authError}</p>}

                            <button type="submit" className="lp-submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <><span className="lp-spinner" /> {t('auth.login.waiting', 'Please wait...')}</>
                                    : t('auth.login.loginBtn', 'Sign In')
                                }
                            </button>
                        </form>

                        <p className="lp-register">
                            {t('auth.login.noAccount', 'Don\'t have an account?')}{' '}
                            <Link to="/register">{t('auth.login.signUp', 'Sign up now')}</Link>
                        </p>
                    </div>

                    {/* Right: Image */}
                    <div className="lp-img-side">
                        <div className="lp-img-bg" />
                        <div className="lp-img-overlay" />
                        <div className="lp-img-grain" />

                        <div className="lp-img-brand">
                            <div className="lp-img-brand-dot">T</div>
                            <span className="lp-img-brand-name">Tamil Food <em>Thaya</em></span>
                        </div>

                        <div className="lp-img-caption">
                            <div className="lp-img-tag">
                                <span className="lp-img-tag-dot" />
                                Authentic Tamil Cuisine
                            </div>
                            <h2 className="lp-img-title">
                                Food made with<br /><em>love & tradition</em>
                            </h2>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};