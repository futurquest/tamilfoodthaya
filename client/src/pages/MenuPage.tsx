import { useState } from 'react';
import { Container } from '../components/ui/Container';
import { useMenu } from '../hooks/useApi';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Spinner } from '../components/ui/Spinner';

export const MenuPage = () => {
    const { categories, menuItems } = useMenu();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { t } = useTranslation();

    if (categories.isLoading || menuItems.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <Spinner size="lg" />
            </div>
        );
    }

    const filteredItems = selectedCategory
        ? menuItems.data?.filter((item: any) => item.categoryId === selectedCategory || item.categoryId?._id === selectedCategory)
        : menuItems.data;

    return (
        <div className="pt-24 pb-24 bg-gray-50 min-h-screen">
            <Container>
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-tamil-charcoal mb-4">{t('menu.title')}</h1>
                    <p className="text-gray-600">{t('menu.subtitle')}</p>
                </div>

                {/* Categories Filter */}
                <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
                    <Button
                        variant={selectedCategory === null ? 'primary' : 'outline'}
                        onClick={() => setSelectedCategory(null)}
                    >
                        {t('menu.all')}
                    </Button>
                    {categories.data?.map((cat: any) => (
                        <Button
                            key={cat._id}
                            variant={selectedCategory === cat._id ? 'primary' : 'outline'}
                            onClick={() => setSelectedCategory(cat._id)}
                            className="whitespace-nowrap"
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredItems?.map((item: any) => (
                            <MenuItemCard key={item._id} item={item} />
                        ))}
                    </AnimatePresence>
                </div>
            </Container>
        </div>
    );
};

const MenuItemCard = ({ item }: { item: any }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
        >
            <Card className="h-full flex flex-col">
                <div className="h-56 overflow-hidden relative">
                    <img
                        src={item.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                    {item.spiceLevel > 0 && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md flex gap-1">
                            {Array.from({ length: item.spiceLevel }).map((_, i) => (
                                <span key={i} title="Pittig">🌶️</span>
                            ))}
                        </div>
                    )}
                </div>
                <CardContent className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-tamil-charcoal">{item.name}</h3>
                        <span className="text-tamil-maroon font-bold text-lg">€{item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};
