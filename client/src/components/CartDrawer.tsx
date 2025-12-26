import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { cart, updateQuantity, removeFromCart, total } = useCart();
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[60]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b flex items-center justify-between bg-tamil-charcoal text-white">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={24} />
                                <h2 className="text-xl font-bold uppercase tracking-wide">Jouw Mandje</h2>
                            </div>
                            <button onClick={onClose} className="hover:text-tamil-gold transition-colors">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                                    <ShoppingBag size={64} className="opacity-20" />
                                    <p className="text-lg">Je mandje is nog leeg.</p>
                                    <Button onClick={onClose} variant="outline">Ga naar Menu</Button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={`${item.menuItemId}-${item.spiceLevel}`} className="flex gap-4 items-center group">
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-tamil-charcoal">{item.name}</h4>
                                            <p className="text-tamil-maroon font-semibold">€{item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 border rounded-md p-1">
                                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="p-1 hover:text-tamil-maroon">
                                                <Minus size={16} />
                                            </button>
                                            <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="p-1 hover:text-tamil-maroon">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.menuItemId)} className="text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t bg-gray-50">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-lg text-gray-600">Totaal (incl. BTW)</span>
                                    <span className="text-2xl font-bold text-tamil-charcoal">€{total.toFixed(2)}</span>
                                </div>
                                <Button
                                    className="w-full py-4 text-lg"
                                    onClick={() => {
                                        onClose();
                                        navigate('/checkout');
                                    }}
                                >
                                    Afrekenen
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
