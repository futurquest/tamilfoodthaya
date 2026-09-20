import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser } from '../../hooks/useApi';
import { Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

type LoginForm = z.infer<typeof loginSchema>;

export const AdminLogin = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPw, setShowPw] = useState(false);
    const [loginError, setLoginError] = useState(() =>
        searchParams.get('session') === 'expired'
            ? t('admin.login.sessionExpired')
            : ''
    );

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
            setLoginError(t('admin.login.invalidCredentials'));
        }
    };

    return (
        <main className="admin-login-page">
            <section className="admin-login-card" aria-label={t('admin.login.aria')}>
                <div className="admin-login-form">
                    <div className="admin-login-badge">
                        <ShieldCheck size={14} />
                        {t('admin.login.badge')}
                    </div>

                    <h1>{t('admin.login.title')}</h1>
                    <p className="admin-login-copy">
                        {t('admin.login.subtitle')}
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
                            <span>{t('admin.login.username')}</span>
                            <div>
                                <User size={16} />
                                <input
                                    {...register('username')}
                                    className={errors.username ? 'is-error' : ''}
                                    placeholder={t('admin.login.usernamePlaceholder')}
                                    autoComplete="username"
                                />
                            </div>
                            {errors.username && <small>{t('admin.login.usernameRequired')}</small>}
                        </label>

                        <label className="admin-login-field">
                            <span>{t('admin.login.password')}</span>
                            <div>
                                <Lock size={16} />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    {...register('password')}
                                    className={errors.password ? 'is-error' : ''}
                                    placeholder={t('admin.login.passwordPlaceholder')}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((value) => !value)}
                                    aria-label={showPw ? t('admin.login.hidePassword') : t('admin.login.showPassword')}
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <small>{t('admin.login.passwordRequired')}</small>}
                        </label>

                        <button type="submit" className="admin-login-submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="admin-login-spinner" />
                                    {t('admin.login.loggingIn')}
                                </>
                            ) : (
                                t('admin.login.login')
                            )}
                        </button>
                    </form>

                    <p className="admin-login-secure">
                        <ShieldCheck size={14} />
                        {t('admin.login.secure')}
                    </p>
                </div>

                <aside className="admin-login-image" aria-label={t('admin.login.imageAlt')}>
                    <img src="/hero-catering.jpg" alt={t('admin.login.imageAlt')} />
                    <div>
                        <span>{t('admin.login.cmsLabel')}</span>
                        <h2>{t('admin.login.imageTitle')}</h2>
                    </div>
                </aside>
            </section>
        </main>
    );
};