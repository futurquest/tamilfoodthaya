import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex gap-2">
            <Button
                variant={i18n.language === 'nl' ? 'primary' : 'outline'}
                size="sm"
                className="px-2 py-1 text-xs"
                onClick={() => changeLanguage('nl')}
            >
                NL
            </Button>
            <Button
                variant={i18n.language === 'en' ? 'primary' : 'outline'}
                size="sm"
                className="px-2 py-1 text-xs"
                onClick={() => changeLanguage('en')}
            >
                EN
            </Button>
            <Button
                variant={i18n.language === 'ta' ? 'primary' : 'outline'}
                size="sm"
                className="px-2 py-1 text-xs font-tamil"
                onClick={() => changeLanguage('ta')}
            >
                தமிழ்
            </Button>
        </div>
    );
};
