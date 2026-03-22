import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../hooks/useApi';
import { Eye, EyeOff, User, Lock, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
    username: z.string().min(1, 'Gebruikersnaam is verplicht'),
    password: z.string().min(1, 'Wachtwoord is verplicht'),
});
type LoginForm = z.infer<typeof loginSchema>;

export const AdminLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPw, setShowPw] = useState(false);
    const [loginError, setLoginError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setLoginError('');
        try {
            const response = await loginUser(data);
            login(response.access_token, response.user);
            navigate('/admin/dashboard');
        } catch {
            setLoginError('Ongeldige inloggegevens. Probeer opnieuw.');
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .al-page {
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
                .al-blob {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                }
                .al-blob-1 { width: 80px; height: 80px; background: #e8a020; top: 7%; left: 17%; opacity: 0.8; }
                .al-blob-2 { width: 60px; height: 60px; background: #e8a020; bottom: 9%; right: 13%; opacity: 0.8; }

                /* Starburst */
                .al-star { position: absolute; bottom: 8%; left: 13%; pointer-events: none; opacity: 0.65; }

                /* ── Card ── */
                .al-card {
                    background: #fff;
                    border-radius: 28px;
                    width: 100%;
                    max-width: 860px;
                    min-height: 520px;
                    display: flex;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06);
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                }

                /* ── Left: Form ── */
                .al-form-side {
                    flex: 0 0 48%;
                    padding: 52px 48px 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                /* Admin badge */
                .al-badge {
                    display: inline-flex; align-items: center; gap: 7px;
                    background: rgba(232,160,32,0.1); border: 1px solid rgba(232,160,32,0.25);
                    border-radius: 100px; padding: 5px 14px;
                    font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em;
                    text-transform: uppercase; color: #b87a10;
                    margin-bottom: 18px; width: fit-content;
                }
                .al-badge svg { color: #c97a10; }

                .al-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(34px, 4vw, 50px);
                    font-weight: 700; color: #1a1209;
                    line-height: 1.06; margin-bottom: 6px;
                }
                .al-title em { font-style: italic; color: #e8a020; }
                .al-sub {
                    font-size: 13.5px; color: #b8a898; font-weight: 300;
                    margin-bottom: 32px; line-height: 1.55;
                }
                .al-accent { width: 36px; height: 2px; border-radius: 2px; background: linear-gradient(90deg,#b87a10,#e8a020); margin-bottom: 32px; }

                /* Fields */
                .al-field { position: relative; margin-bottom: 14px; }
                .al-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #c8bfb4; pointer-events: none; display: flex; align-items: center; }
                .al-input {
                    width: 100%; padding: 13px 16px 13px 42px;
                    background: #f5f2ee; border: 1.5px solid transparent;
                    border-radius: 12px; font-family: 'DM Sans', sans-serif;
                    font-size: 14px; color: #1a1209; outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }
                .al-input::placeholder { color: #c0b5a8; }
                .al-input:focus { border-color: #e8a020; background: #fff; box-shadow: 0 0 0 4px rgba(232,160,32,0.1); }
                .al-input.err { border-color: rgba(239,68,68,0.55); }
                .al-eye {
                    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: #c0b5a8; padding: 4px; display: flex; align-items: center;
                    transition: color 0.2s;
                }
                .al-eye:hover { color: #6b5a3a; }
                .al-error { font-size: 11.5px; color: #ef4444; margin-top: 5px; padding-left: 2px; }

                /* Login error banner */
                .al-err-banner {
                    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
                    border-radius: 10px; padding: 10px 14px;
                    font-size: 13px; color: #dc2626; margin-bottom: 16px;
                    display: flex; align-items: center; gap: 8px;
                }

                /* Submit */
                .al-submit {
                    width: 100%; margin-top: 8px; padding: 14px;
                    border-radius: 12px; border: none; cursor: pointer;
                    background: #1a1209; color: #f5efe4;
                    font-family: 'DM Sans', sans-serif; font-size: 14.5px;
                    font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    box-shadow: 0 4px 16px rgba(26,18,9,0.18);
                    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
                }
                .al-submit:hover:not(:disabled) { background: #2e2010; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,18,9,0.25); }
                .al-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                @keyframes al-spin { to { transform: rotate(360deg); } }
                .al-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(245,239,228,0.3); border-top-color: #f5efe4; animation: al-spin 0.7s linear infinite; flex-shrink: 0; }

                /* ── Right: Image panel ── */
                .al-img-side {
                    flex: 1; position: relative;
                    margin: 14px 14px 14px 0;
                    border-radius: 20px; overflow: hidden;
                    min-height: 420px;
                }
                .al-img-bg {
                    position: absolute; inset: 0;
                    background-image: url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&auto=format&fit=crop&q=85');
                    background-size: cover; background-position: center;
                }
                .al-img-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(160deg, rgba(26,18,9,0.6) 0%, rgba(26,18,9,0.25) 45%, rgba(10,8,6,0.65) 100%);
                }
                .al-img-grain {
                    position: absolute; inset: 0; opacity: 0.04; pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    background-size: 200px;
                }
                /* Brand pill */
                .al-brand {
                    position: absolute; top: 20px; left: 20px;
                    display: flex; align-items: center; gap: 8px; z-index: 2;
                    background: rgba(255,255,255,0.13); backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.2); border-radius: 100px;
                    padding: 6px 14px 6px 8px;
                }
                .al-brand-dot {
                    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
                    background: linear-gradient(135deg,#b87a10,#e8a020);
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Playfair Display', serif; font-weight: 700;
                    font-size: 13px; color: #0c0a08;
                }
                .al-brand-name { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: #fff; }
                .al-brand-name em { font-style: italic; color: #f5c842; }
                /* Caption */
                .al-img-caption {
                    position: absolute; bottom: 0; left: 0; right: 0;
                    padding: 0 26px 28px; z-index: 2;
                    background: linear-gradient(to top, rgba(10,8,6,0.8) 0%, transparent 100%);
                }
                .al-img-tag {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: rgba(232,160,32,0.15); border: 1px solid rgba(232,160,32,0.3);
                    border-radius: 100px; padding: 4px 12px; margin-bottom: 10px;
                    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
                    text-transform: uppercase; color: #f5c842;
                }
                .al-tag-dot { width: 5px; height: 5px; border-radius: 50%; background: #e8a020; }
                .al-img-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #f5efe4; line-height: 1.2; }
                .al-img-title em { font-style: italic; color: #e8a020; }

                /* Security note */
                .al-secure {
                    margin-top: 20px; display: flex; align-items: center; gap: 7px;
                    font-size: 11.5px; color: #c0b5a8; font-weight: 300;
                }
                .al-secure svg { color: #b8a898; flex-shrink: 0; }

                /* Responsive */
                @media (max-width: 720px) {
                    .al-img-side { display: none; }
                    .al-form-side { flex: 1; padding: 44px 32px; }
                    .al-card { max-width: 460px; }
                }
                @media (max-width: 460px) {
                    .al-form-side { padding: 36px 22px; }
                    .al-title { font-size: 32px; }
                }
            `}</style>

            <div className="al-page">

                {/* Blobs */}
                <div className="al-blob al-blob-1" />
                <div className="al-blob al-blob-2" />

                {/* Starburst */}
                <svg className="al-star" width="68" height="68" viewBox="0 0 68 68" fill="none">
                    {[0,22.5,45,67.5,90,112.5,135,157.5].map((deg, i) => (
                        <line key={i} x1="34" y1="34"
                            x2={34 + 30 * Math.cos((deg * Math.PI) / 180)}
                            y2={34 + 30 * Math.sin((deg * Math.PI) / 180)}
                            stroke="#e8a020" strokeWidth="4.5" strokeLinecap="round"
                        />
                    ))}
                </svg>

                {/* ── Card ── */}
                <div className="al-card">

                    {/* Left: Form */}
                    <div className="al-form-side">
                        <div className="al-badge">
                            <ShieldCheck size={13} />
                            Admin Portal
                        </div>
                        <h1 className="al-title">Management <em>Login</em></h1>
                        <p className="al-sub">Restricted access. Authorised personnel only.</p>
                        <div className="al-accent" />

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>

                            {loginError && (
                                <div className="al-err-banner">
                                    <ShieldCheck size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                                    {loginError}
                                </div>
                            )}

                            {/* Username */}
                            <div className="al-field">
                                <span className="al-icon"><User size={15} /></span>
                                <input
                                    {...register('username')}
                                    className={`al-input${errors.username ? ' err' : ''}`}
                                    placeholder="Gebruikersnaam"
                                    autoComplete="username"
                                />
                                {errors.username && <p className="al-error">{errors.username.message}</p>}
                            </div>

                            {/* Password */}
                            <div className="al-field">
                                <span className="al-icon"><Lock size={15} /></span>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    {...register('password')}
                                    className={`al-input${errors.password ? ' err' : ''}`}
                                    placeholder="Wachtwoord"
                                    style={{ paddingRight: 42 }}
                                    autoComplete="current-password"
                                />
                                <button type="button" className="al-eye" onClick={() => setShowPw(p => !p)} aria-label="Toggle password">
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                                {errors.password && <p className="al-error">{errors.password.message}</p>}
                            </div>

                            <button type="submit" className="al-submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <><span className="al-spinner" /> Inloggen...</>
                                    : 'Inloggen'
                                }
                            </button>
                        </form>

                        <div className="al-secure">
                            <ShieldCheck size={13} />
                            Beveiligde verbinding · Alleen bevoegd personeel
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div className="al-img-side">
                        <div className="al-img-bg" />
                        <div className="al-img-overlay" />
                        <div className="al-img-grain" />

                        <div className="al-brand">
                            <div className="al-brand-dot">T</div>
                            <span className="al-brand-name">Tamil Food <em>Thaya</em></span>
                        </div>

                        <div className="al-img-caption">
                            <div className="al-img-tag">
                                <span className="al-tag-dot" />
                                Management Portal
                            </div>
                            <h2 className="al-img-title">
                                Serving excellence,<br /><em>every occasion</em>
                            </h2>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};