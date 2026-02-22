import { Hero } from '../components/Hero';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const HomePage = () => {
    const { t } = useTranslation();

    return (
        <div>
            <Hero />

            {/* Why Choose Us Section */}
            <section className="py-24 bg-white">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-tamil-charcoal mb-4">{t('home.whyTitle')}</h2>
                        <div className="w-24 h-1 bg-tamil-maroon mx-auto" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <FeatureItem
                            title={t('home.feature1.title')}
                            desc={t('home.feature1.desc')}
                            icon="🍛"
                        />
                        <FeatureItem
                            title={t('home.feature2.title')}
                            desc={t('home.feature2.desc')}
                            icon="🌿"
                        />
                        <FeatureItem
                            title={t('home.feature3.title')}
                            desc={t('home.feature3.desc')}
                            icon="🤝"
                        />
                    </div>
                </Container>
            </section>

            {/* Featured Menu Preview */}
            <section className="py-24 bg-gray-50">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-4xl font-bold text-tamil-charcoal mb-4">{t('home.highlightsTitle')}</h2>
                            <p className="text-gray-600 max-w-lg">{t('home.highlightsDesc')}</p>
                        </div>
                        <Link to="/menu">
                            <Button variant="outline">{t('home.viewMenu')}</Button>
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <HighlightCard
                            name="Mutton Kottu Roti"
                            price="€ 14,50"
                            img="https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?auto=format&fit=crop&q=80&w=400"
                        />
                        <HighlightCard
                            name="Chicken 65"
                            price="€ 8,50"
                            img="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&q=80&w=400"
                        />
                        <HighlightCard
                            name="Masala Dosa"
                            price="€ 11,00"
                            img="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400"
                        />
                        <HighlightCard
                            name="Egg Hoppers (3 st)"
                            price="€ 9,50"
                            img="https://images.unsplash.com/photo-1610057099431-d746e19d4001?auto=format&fit=crop&q=80&w=400"
                        />
                    </div>
                </Container>
            </section>
        </div>
    );
};

const FeatureItem = ({ title, desc, icon }: { title: string; desc: string; icon: string }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="flex flex-col items-center"
    >
        <div className="text-5xl mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-tamil-charcoal mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{desc}</p>
    </motion.div>
);

const HighlightCard = ({ name, price, img }: { name: string; price: string; img: string }) => {
    return (
        <Card className="group cursor-pointer">
            <div className="h-48 relative overflow-hidden">
                <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-tamil-maroon font-bold">
                    {price}
                </div>
            </div>
            <CardContent>
                <h3 className="font-bold text-lg text-tamil-charcoal">{name}</h3>
            </CardContent>
        </Card>
    );
};
