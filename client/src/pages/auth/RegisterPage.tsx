import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../../hooks/useApi';
import { SEO } from '../../components/SEO';
import FluidBackground from '../../components/FluidBackground';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      await registerUser(data);
      toast.success(t('auth.register.registerSuccess', 'Registration successful. Check your email for the PIN.'));
      navigate('/verify-email', { state: { email: data.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('auth.register.registerError', 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="auth-page">
      <SEO title="Create account" description="Create a Tamil Food Thaya account for orders and catering requests." />
      <FluidBackground intensity={0.5} parallaxStrength={6} deepParallax={10} />
      <div className="auth-card auth-card--wide surface">
        <div className="auth-copy">
          <span className="brand-mark__seal">T</span>
          <h1>Create your Tamil Food Thaya account.</h1>
          <p>Save contact details, manage catering inquiries, and return to the dishes you already know you love.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="auth-form__row">
            <AuthInput label="Name" icon={<User size={17} />} error={errors.name} registration={register('name', { required: 'Name is required' })} placeholder={t('form.name', 'Name')} autoComplete="name" />
            <AuthInput label="Username" icon={<User size={17} />} error={errors.username} registration={register('username', { required: 'Username is required' })} placeholder={t('auth.login.username', 'Username')} autoComplete="username" />
          </div>
          <div className="auth-form__row">
            <AuthInput label="Phone" icon={<Phone size={17} />} error={errors.phone} registration={register('phone', { required: 'Phone is required' })} placeholder={t('form.phone', 'Phone')} autoComplete="tel" />
            <AuthInput label="Email" type="email" icon={<Mail size={17} />} error={errors.email} registration={register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email' } })} placeholder={t('form.email', 'Email')} autoComplete="email" />
          </div>

          <AuthInput label="Address" icon={<MapPin size={17} />} registration={register('address')} placeholder={t('catering.form.location', 'Location')} autoComplete="street-address" />

          <label>
            Password
            <span>
              <Lock size={17} />
              <input type={showPw ? 'text' : 'password'} {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Use at least 6 characters' } })} placeholder={t('auth.login.password', 'Password')} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw((value) => !value)} aria-label="Toggle password visibility">
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
            {errors.password && <small>{String(errors.password.message)}</small>}
          </label>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('auth.register.registering', 'Creating...') : t('auth.register.registerBtn', 'Create account')}
          </button>

          <p className="auth-switch">
            {t('auth.register.haveAccount', 'Already have an account?')} <Link to="/login">{t('auth.register.signIn', 'Sign in')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const AuthInput = ({ label, icon, error, registration, placeholder, type = 'text', autoComplete }: any) => (
  <label>
    {label}
    <span>
      {icon}
      <input type={type} {...registration} placeholder={placeholder} autoComplete={autoComplete} />
    </span>
    {error && <small>{String(error.message)}</small>}
  </label>
);
