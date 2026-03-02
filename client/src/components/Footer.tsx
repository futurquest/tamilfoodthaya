import { Link } from 'react-router-dom';
import { IconMapPin, IconPhone, IconMail } from './Icons';

const footerLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/catering', label: 'Catering' },
    { to: '/contact', label: 'Contact' },
];

export default function Footer() {
    return (
        <footer>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="inline-block mb-4 footer-logo">
                            <img src="/logo.png" alt="Tamil Food Thaya" className="h-14 w-auto object-contain" />
                        </Link>
                        <p className="text-white/90 text-sm leading-relaxed">
                            Authentic Tamil cuisine in the heart of Netherlands. Dine-in, takeaway &amp; event catering.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h3 className="footer-title">Quick Links</h3>
                        <ul className="page-more-info">
                            {footerLinks.map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="footer-title">Contact</h3>
                        <ul className="about-footer">
                            <li>
                                <IconMapPin size={20} className="text-primary-400" />
                                <span>Amsterdam, Netherlands</span>
                            </li>
                            <li>
                                <IconPhone size={20} className="text-primary-400" />
                                <a href="tel:+31201234567">+31 20 123 4567</a>
                            </li>
                            <li>
                                <IconMail size={20} className="text-primary-400" />
                                <a href="mailto:hello@tamilfoodthaya.nl">hello@tamilfoodthaya.nl</a>
                            </li>
                        </ul>
                    </div>

                    {/* Hours & Social */}
                    <div>
                        <h3 className="footer-title">Hours</h3>
                        <div className="open-hours">
                            <p className="mb-2">10:00 AM – 10:30 PM</p>
                            <p className="text-white/80 text-sm">Dine-in • Takeaway</p>
                            <hr />
                        </div>
                        <ul className="footer-social">
                            <li>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
                            </li>
                            <li>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📷</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-white/20">
                    <p className="text-white/80 text-sm">© 2026 Tamil Food Thaya. All rights reserved.</p>
                    <span className="text-white/80 text-sm">Netherlands</span>
                </div>
            </div>
        </footer>
    );
}
