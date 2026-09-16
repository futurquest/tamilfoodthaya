import { useEffect, useMemo, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, FileText, Mail, Phone, ShieldCheck, ShoppingBag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../hooks/useApi';
import { SEO } from '../components/SEO';
import FluidBackground from '../components/FluidBackground';

const createCheckoutSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, t('checkout.nameRequired')),
  email: z.string().email(t('checkout.validEmail')),
  phone: z.string().min(10, t('checkout.validPhone')),
  pickupTime: z.string().min(1, t('checkout.choosePickup')),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<ReturnType<typeof createCheckoutSchema>>;

export const CheckoutPage = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutForm>({
    resolver: zodResolver(createCheckoutSchema(t)),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      pickupTime: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (cart.length === 0) navigate('/menu');
  }, [cart.length, navigate]);

  const minPickupTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const vatAmount = total * 0.09;

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const response = await createOrder({
        items: cart,
        total,
        customerInfo: data,
        pickupTime: new Date(data.pickupTime),
      });

      if (response?.url) {
        clearCart();
        window.location.href = response.url;
        return;
      }

      toast.error(t('checkout.paymentMissing'));
    } catch {
      toast.error(t('checkout.processError'));
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="checkout-page">
      <SEO title={t('checkout.seoTitle')} description={t('checkout.seoDescription')} />
      <section className="page-hero">
        <FluidBackground intensity={0.5} parallaxStrength={7} deepParallax={12} />
        <div className="container">
          <h1>{t('checkout.heroTitle')}</h1>
          <p>{t('checkout.heroDesc')}</p>
        </div>
      </section>

      <section className="section">
        <FluidBackground intensity={0.42} parallaxStrength={6} deepParallax={10} />
        <div className="container checkout-grid">
          <form className="checkout-card surface" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="checkout-card__heading">
              <h2>{t('checkout.customerTitle')}</h2>
              <p>{t('checkout.customerLead')}</p>
            </div>

            <div className="checkout-form-grid">
              <InputField label={t('checkout.fullName')} icon={<User size={17} />} error={errors.name?.message} registration={register('name')} placeholder={t('checkout.yourFullName')} />
              <InputField label={t('form.email')} type="email" icon={<Mail size={17} />} error={errors.email?.message} registration={register('email')} placeholder="name@email.com" />
              <InputField label={t('form.phone')} icon={<Phone size={17} />} error={errors.phone?.message} registration={register('phone')} placeholder="+31 6 1234 5678" />
              <InputField label={t('checkout.pickupTime')} type="datetime-local" icon={<Calendar size={17} />} error={errors.pickupTime?.message} registration={register('pickupTime')} min={minPickupTime} />
            </div>

            <label className="checkout-notes">
              <span><FileText size={17} /> {t('checkout.notes')}</span>
              <textarea {...register('notes')} className="input-field" placeholder={t('checkout.notesPlaceholder')} />
            </label>

            <div className="checkout-assurance">
              <ShieldCheck size={20} />
              <p><strong>{t('checkout.secureTitle')}</strong><span>{t('checkout.secureText')}</span></p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="btn-primary checkout-submit">
              {isSubmitting ? t('checkout.preparing') : t('checkout.continuePayment')}
            </Button>
          </form>

          <aside className="checkout-summary surface">
            <div className="checkout-card__heading">
              <h2>{t('checkout.summary')}</h2>
              <p>{cart.length} {cart.length === 1 ? t('checkout.itemSingular') : t('checkout.itemPlural')} {t('checkout.review')}</p>
            </div>

            <div className="checkout-items">
              {cart.map((item) => (
                <div key={item.menuItemId}>
                  <span><ShoppingBag size={16} /> {item.quantity}x {item.name}</span>
                  <strong>EUR {(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="checkout-total">
              <SummaryRow label={t('checkout.subtotal')} value={`EUR ${total.toFixed(2)}`} />
              <SummaryRow label={t('checkout.vat')} value={`EUR ${vatAmount.toFixed(2)}`} />
              <div>
                <span>{t('checkout.total')}</span>
                <strong>EUR {total.toFixed(2)}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

const InputField = ({ label, type = 'text', icon, error, registration, placeholder, min }: {
  label: string;
  type?: string;
  icon?: ReactNode;
  error?: string;
  registration: any;
  placeholder?: string;
  min?: string;
}) => (
  <label className="checkout-field">
    <span>{icon}{label}</span>
    <input type={type} min={min} placeholder={placeholder} {...registration} className="input-field" />
    {error && <small>{error}</small>}
  </label>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <p>
    <span>{label}</span>
    <strong>{value}</strong>
  </p>
);
