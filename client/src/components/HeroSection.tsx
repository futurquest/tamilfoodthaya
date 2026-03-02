import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconArrowRight } from './Icons';

const foodCards = [
    { name: 'Pizza', desc: 'Fresh & sweet', price: '€50', img: 'https://hips.hearstapps.com/hmg-prod/images/delish-191908-cauliflower-pizza-0390-landscape-pf-1568654348.jpg', stars: 3 },
    { name: 'Chicken', desc: 'Fried to crisp', price: '€82', img: 'https://i.ytimg.com/vi/3n87Tbu5A9M/maxresdefault.jpg', stars: 4 },
    { name: 'Coffee', desc: 'Brewed fresh', price: '€5', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', stars: 2 },
];

export default function HeroSection() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden min-h-[500px] sm:min-h-[600px] md:min-h-[700px] perspective-[2000px]">
            {/* Background image with small blur */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/hero-bg.png')",
                    filter: 'blur(3px)',
                }}
                aria-hidden
            />
            <div className="absolute inset-0 bg-dark-900/50" aria-hidden />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" aria-hidden />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl" aria-hidden />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-36">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[500px] md:min-h-[580px]">
                    {/* Hero content */}
                    <div className="text-center lg:text-left order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-6">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                            <span className="text-white text-sm font-medium">Netherlands <span className="opacity-80 mx-1">|</span> Since 2020</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-tight">
                            <span className="text-white drop-shadow-lg">
                                {/* Fallback string since translation text might differ */}
                                {t('home.heroTitle', 'Authentic Tamil Food\nFor Your Event')}
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-amber-50/95 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow">
                            {t('home.heroSubtitle', 'Experience the rich flavors of traditional Tamil cuisine. We provide catering services for all types of events, from small gatherings to large weddings.')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/catering" className="btn-gold text-lg flex items-center gap-2 justify-center">
                                {t('home.ctaBook', 'Book Catering')} <IconArrowRight size={20} />
                            </Link>
                            <Link to="/menu" className="btn-secondary text-lg">
                                {t('home.ctaExplore', 'Explore Menu')}
                            </Link>
                        </div>
                    </div>

                    {/* Food cards */}
                    <div className="relative h-[420px] md:h-[480px] hidden md:block order-1 lg:order-2">
                        {foodCards.map((card, i) => (
                            <div key={card.name} className={`food-card food-card--${i + 1}`}>
                                <div className="food-card__image">
                                    <img src={card.img} alt={card.name} loading="lazy" />
                                </div>
                                <div className="food-card__details">
                                    <span className="food-card__name">{card.name}</span>
                                    <span className="food-card__desc">{card.desc}</span>
                                    <div className="food-card__price">{card.price}</div>
                                    <div className="food-card__rating">
                                        {[1, 2, 3, 4].map((n) => (
                                            <div key={n} className={`food-card__star ${n <= card.stars ? 'food-card__star--gold' : ''}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
