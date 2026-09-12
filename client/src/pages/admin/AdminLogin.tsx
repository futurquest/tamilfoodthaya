import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../hooks/useApi';
import { Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';

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
        <main className="admin-login-page">
            <section className="admin-login-card" aria-label="Admin login">
                <div className="admin-login-form">
                    <div className="admin-login-badge">
                        <ShieldCheck size={14} />
                        Admin CMS
                    </div>

                    <h1>Management Login</h1>
                    <p className="admin-login-copy">
                        A clean workspace for managing orders, catering packages, menus, and customer enquiries.
                    </p>
                    <span className="admin-login-rule" />

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {loginError && (
                            <div className="admin-login-error">
                                <ShieldCheck size={15} />
                                {loginError}
                            </div>
                        )}

                        <label className="admin-login-field">
                            <span>Gebruikersnaam</span>
                            <div>
                                <User size={16} />
                                <input
                                    {...register('username')}
                                    className={errors.username ? 'is-error' : ''}
                                    placeholder="Vul gebruikersnaam in"
                                    autoComplete="username"
                                />
                            </div>
                            {errors.username && <small>{errors.username.message}</small>}
                        </label>

                        <label className="admin-login-field">
                            <span>Wachtwoord</span>
                            <div>
                                <Lock size={16} />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    {...register('password')}
                                    className={errors.password ? 'is-error' : ''}
                                    placeholder="Vul wachtwoord in"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((value) => !value)}
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <small>{errors.password.message}</small>}
                        </label>

                        <button type="submit" className="admin-login-submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="admin-login-spinner" />
                                    Inloggen...
                                </>
                            ) : (
                                'Inloggen'
                            )}
                        </button>
                    </form>

                    <p className="admin-login-secure">
                        <ShieldCheck size={14} />
                        Beveiligde verbinding. Alleen bevoegd personeel.
                    </p>
                </div>

                <aside className="admin-login-image" aria-label="Tamil Food Thaya catering">
                    <img src="/hero-catering.jpg" alt="Tamil Food Thaya traditional catering" />
                    <div>
                        <span>Tamil Food Thaya CMS</span>
                        <h2>Traditional catering, managed with care</h2>
                    </div>
                </aside>
            </section>
        </main>
    );
};
