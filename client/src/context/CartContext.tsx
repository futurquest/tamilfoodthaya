import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    spiceLevel: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, qty: number) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: CartItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.menuItemId === item.menuItemId && i.spiceLevel === item.spiceLevel);
            if (existing) {
                return prev.map((i) =>
                    (i.menuItemId === item.menuItemId && i.spiceLevel === item.spiceLevel)
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => prev.filter((i) => i.menuItemId !== itemId));
    };

    const updateQuantity = (itemId: string, qty: number) => {
        setCart((prev) => prev.map((i) => i.menuItemId === itemId ? { ...i, quantity: Math.max(0, qty) } : i).filter(i => i.quantity > 0));
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
