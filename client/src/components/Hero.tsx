import { Container } from './ui/Container';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Hero = () => {
    const { t } = useTranslation();

    return (
        <section className="relative min-h-[100svh] sm:min-h-[700px] flex items-center overflow-hidden bg-tamil-charcoal">
            {/* Ambient glow field instead of a background photo */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: 'radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--brand-accent) 26%, transparent), transparent 26rem), radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--brand-leaf) 18%, transparent), transparent 24rem), radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--brand-primary) 22%, transparent), transparent 32rem)',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

            <Container className="relative z-20">
                <div className="max-w-2xl py-20 sm:py-0">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="eyebrow text-tamil-gold/80 mb-3 rise-in">{t('nav.brand', 'Tamil Food Thaya')}</p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                            {t('hero.title')} <span className="text-tamil-gold">{t('hero.titleHighlight')}</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-lg leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/menu">
                                <Button variant="gold" size="lg" className="shadow-lg">
                                    {t('hero.pButton')}
                                </Button>
                            </Link>
                            <Link to="/catering">
                                <Button variant="secondary" size="lg" className="shadow-lg">
                                    {t('hero.sButton')}
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="mt-10 sm:mt-16 flex items-center gap-6 text-white/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                    >
                        <div className="flex flex-col">
                            <span className="font-bold text-xl sm:text-2xl text-tamil-gold">Rotterdam</span>
                            <span className="text-sm">{t('hero.rotterdam')}</span>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="flex flex-col">
                            <span className="font-bold text-xl sm:text-2xl text-tamil-gold">Leiden</span>
                            <span className="text-sm">{t('hero.leiden')}</span>
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
};
