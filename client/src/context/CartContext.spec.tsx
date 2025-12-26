import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

describe('CartContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CartProvider>{children}</CartProvider>
    );

    beforeEach(() => {
        localStorage.clear();
    });

    it('adds an item to the cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart({
                menuItemId: '1',
                name: 'Dosa',
                price: 10,
                quantity: 1,
                spiceLevel: 1,
            });
        });

        expect(result.current.cart).toHaveLength(1);
        expect(result.current.total).toBe(10);
    });

    it('updates quantity of existing item', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart({
                menuItemId: '1',
                name: 'Dosa',
                price: 10,
                quantity: 1,
                spiceLevel: 1,
            });
        });

        act(() => {
            result.current.addToCart({
                menuItemId: '1',
                name: 'Dosa',
                price: 10,
                quantity: 2,
                spiceLevel: 1,
            });
        });

        expect(result.current.cart[0].quantity).toBe(3);
        expect(result.current.total).toBe(30);
    });

    it('removes an item from the cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addToCart({
                menuItemId: '1',
                name: 'Dosa',
                price: 10,
                quantity: 1,
                spiceLevel: 1,
            });
        });

        act(() => {
            result.current.removeFromCart('1');
        });

        expect(result.current.cart).toHaveLength(0);
    });
});
