import { Container } from './ui/Container';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Hero = () => {
    const { t } = useTranslation();

    return (
        <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-tamil-charcoal">
            {/* Background with overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-60"
                style={{ backgroundImage: 'url("/C:/Users/abith/.gemini/antigravity/brain/cd119a66-ad05-4d71-9897-1de9d8cb7d80/tamil_food_thaya_hero_mockup_1766599207905.png")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

            <Container className="relative z-20">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                            {t('hero.title')} <span className="text-tamil-gold">{t('hero.titleHighlight')}</span>
                        </h1>
                        <p className="text-xl text-gray-200 mb-8 max-w-lg leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/menu">
                                <Button size="lg" className="shadow-lg shadow-tamil-maroon/20">
                                    {t('hero.pButton')}
                                </Button>
                            </Link>
                            <Link to="/catering">
                                <Button variant="secondary" size="lg" className="shadow-lg shadow-tamil-gold/20">
                                    {t('hero.sButton')}
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="mt-16 flex items-center gap-6 text-white/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                    >
                        <div className="flex flex-col">
                            <span className="font-bold text-2xl text-tamil-gold">Rotterdam</span>
                            <span className="text-sm">{t('hero.rotterdam')}</span>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="flex flex-col">
                            <span className="font-bold text-2xl text-tamil-gold">Leiden</span>
                            <span className="text-sm">{t('hero.leiden')}</span>
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
};
