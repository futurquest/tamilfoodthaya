import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../hooks/useApi';
import { SEO } from '../../components/SEO';
import FluidBackground from '../../components/FluidBackground';
import { Logo } from '../../components/Logo';
import { useFeedback } from '../../context/FeedbackContext';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { show } = useFeedback();
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
      show({ type: 'success', message: t('auth.login.loginSuccess', { defaultValue: `Welcome back, ${res.user.username}` }).replace('{username}', res.user.username) });
      navigate(res.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch {
      const message = t('auth.login.loginError', 'Login failed. Please check your credentials.');
      setAuthError(message);
      show({ type: 'error', message });
    }
  };

  return (
    <div className="auth-page">
      <SEO title="Log in" description="Log in to your Tamil Food Thaya account." />
      <FluidBackground intensity={0.5} parallaxStrength={6} deepParallax={10} />
      <div className="auth-card surface">
        <div className="auth-copy">
          <Logo />
          <h1>Welcome back to the kitchen.</h1>
          <p>Sign in to reorder favourites, track requests, and keep catering details in one place.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label>
            Username
            <span>
              <User size={17} />
              <input {...register('username', { required: 'Username is required' })} placeholder={t('auth.login.username', 'Username')} autoComplete="username" />
            </span>
            {errors.username && <small>{String(errors.username.message)}</small>}
          </label>

          <label>
            Password
            <span>
              <Lock size={17} />
              <input type={showPw ? 'text' : 'password'} {...register('password', { required: 'Password is required' })} placeholder={t('auth.login.password', 'Password')} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw((value) => !value)} aria-label="Toggle password visibility">
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
            {errors.password && <small>{String(errors.password.message)}</small>}
          </label>

          {authError && <p className="auth-error">{authError}</p>}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('auth.login.waiting', 'Please wait...') : t('auth.login.loginBtn', 'Sign in')}
          </button>

          <p className="auth-switch">
            {t('auth.login.noAccount', "Don't have an account?")} <Link to="/register">{t('auth.login.signUp', 'Create one')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
