import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CateringCheckoutPage } from './CateringCheckoutPage';

const mocks = vi.hoisted(() => ({
    createCateringOrder: vi.fn(),
    getCateringPackage: vi.fn(),
    apiGet: vi.fn(),
}));

vi.mock('../hooks/useApi', () => ({
    createCateringOrder: mocks.createCateringOrder,
    getCateringPackage: mocks.getCateringPackage,
    api: { get: mocks.apiGet },
}));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../components/SEO', () => ({ SEO: () => null }));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        i18n: { language: 'en' },
        t: (key: string, values?: Record<string, unknown>) => {
            const translated = ({
            'cateringCheckout.steps': ['Choose Items', 'Add-ons', 'Event Details', 'Review & Order'],
            'cateringCheckout.chooseAddons': 'Choose Add-ons',
            'cateringCheckout.reviewOrder': 'Review Order',
            'cateringCheckout.placeOrder': 'Place Catering Order',
            'cateringCheckout.placing': 'Placing Order...',
            'cateringCheckout.back': 'Back',
            'cateringCheckout.orderSuccess': 'Your catering request has been placed!',
            'cateringCheckout.orderSuccessTitle': 'Catering request received',
            'cateringCheckout.orderError': 'Failed to place catering order. Please try again.',
            'cateringCheckout.orderErrorTitle': "We couldn't place your order",
            'cateringCheckout.orderRetryHint': 'Your details are still here. Review them and try again.',
            'cateringCheckout.orderRedirectHint': 'Taking you back to catering shortly.',
            'cateringCheckout.dismissOrderError': 'Dismiss order error',
            'cateringCheckout.selectionErrorTitle': 'Please check your menu selections',
            'cateringCheckout.selectionErrorHint': 'Update your selections to continue with this catering order.',
            'cateringCheckout.requiredItemsHint': 'Choose the minimum required items in each category to continue.',
            'cateringCheckout.optionalAddons': 'Optional Add-ons',
            'cateringCheckout.minSelectionRequired': '"{{category}}" requires at least {{min}} selection(s)',
            'cateringCheckout.maxSelectionAllowed': 'Maximum {{max}} item(s) allowed for "{{category}}"',
            } as Record<string, string | string[]>)[key] ?? key;
            return typeof translated === 'string'
                ? translated.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values?.[name] ?? `{{${name}}}`))
                : translated;
        },
    }),
}));

function renderCheckout() {
    render(
        <MemoryRouter initialEntries={['/catering/checkout/package-1']}>
            <Routes>
                <Route path="/catering/checkout/:packageId" element={<CateringCheckoutPage />} />
                <Route path="/catering" element={<div>Catering destination</div>} />
            </Routes>
        </MemoryRouter>,
    );
}

async function reachReview() {
    renderCheckout();
    fireEvent.click(await screen.findByRole('button', { name: /Choose Add-ons/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to Details/ }));
    fireEvent.change(screen.getByLabelText('Full Name *'), { target: { value: 'Asha Kumar' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'asha@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '0612345678' } });
    fireEvent.change(screen.getByLabelText('Event Date *'), { target: { value: '2026-11-10' } });
    fireEvent.click(screen.getByRole('button', { name: /Review Order/ }));
}

describe('catering order submission', () => {
    beforeEach(() => {
        mocks.createCateringOrder.mockReset();
        mocks.getCateringPackage.mockResolvedValue({
            _id: 'package-1', name: 'Family feast', description: 'Catering',
            basePrice: 10, minGuests: 10, categories: [{ name: 'Mains', minSelect: 0, maxSelect: 1, items: [] }],
        });
        mocks.apiGet.mockResolvedValue({ data: [] });
    });

    afterEach(() => vi.useRealTimers());

    it('requires all eight items when the package category minimum is eight', async () => {
        mocks.getCateringPackage.mockResolvedValueOnce({
            _id: 'package-1', name: 'All-in Pakket', description: 'Catering',
            basePrice: 23, minGuests: 10,
            categories: [{
                name: 'Drinken & Starters', minSelect: 8, maxSelect: 8,
                items: Array.from({ length: 8 }, (_, index) => ({
                    menuItem: { _id: `item-${index}`, name: `Choice ${index + 1}`, description: '', price: 0, choices: [] },
                })),
            }],
        });
        renderCheckout();
        const next = await screen.findByRole('button', { name: /Choose Add-ons/ });
        for (let index = 1; index <= 7; index++) {
            fireEvent.click(screen.getByText(`Choice ${index}`));
        }
        expect(next).toBeEnabled();
        fireEvent.click(next);
        expect(await screen.findByRole('alertdialog')).toHaveTextContent('requires at least 8 selection(s)');
        fireEvent.click(screen.getByRole('button', { name: 'Dismiss order error' }));
        fireEvent.click(screen.getByText('Choice 8'));
        fireEvent.click(next);
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(screen.getByText('Optional Add-ons')).toBeInTheDocument();
    });

    it('shows an error dialog when a category maximum is reached', async () => {
        mocks.getCateringPackage.mockResolvedValueOnce({
            _id: 'package-1', name: 'Family feast', description: 'Catering',
            basePrice: 10, minGuests: 10,
            categories: [{
                name: 'Mains', minSelect: 0, maxSelect: 1,
                items: ['First dish', 'Second dish'].map((name, index) => ({
                    menuItem: { _id: `item-${index}`, name, description: '', price: 0, choices: [] },
                })),
            }],
        });
        renderCheckout();
        await screen.findByText('First dish');
        fireEvent.click(screen.getByText('First dish'));
        fireEvent.click(screen.getByText('Second dish'));

        const limitDialog = await screen.findByRole('alertdialog');
        expect(limitDialog).toHaveTextContent('Maximum 1 item(s) allowed for "Mains"');
        fireEvent.keyDown(limitDialog, { key: 'Escape' });
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('shows a dismissible error, keeps entered details, and permits retry', async () => {
        mocks.createCateringOrder.mockRejectedValueOnce({ response: { status: 400, data: { message: ['Event date is unavailable'] } } });
        mocks.createCateringOrder.mockResolvedValueOnce({ _id: 'order-1' });
        await reachReview();

        fireEvent.click(screen.getByRole('button', { name: 'Place Catering Order' }));
        const alert = await screen.findByRole('alertdialog');
        expect(alert).toHaveTextContent('Event date is unavailable');
        expect(alert).toHaveFocus();
        expect(screen.queryByText('Catering destination')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Dismiss order error' }));
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Back/ }));
        expect(screen.getByLabelText('Full Name *')).toHaveValue('Asha Kumar');
        expect(screen.getByLabelText('Email *')).toHaveValue('asha@example.com');
        fireEvent.click(screen.getByRole('button', { name: /Review Order/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Place Catering Order' }));
        await screen.findByRole('dialog');
        expect(mocks.createCateringOrder).toHaveBeenCalledTimes(2);
    });

    it('shows success before redirecting and blocks duplicate submissions', async () => {
        let resolveOrder!: (value: unknown) => void;
        mocks.createCateringOrder.mockReturnValue(new Promise((resolve) => { resolveOrder = resolve; }));
        await reachReview();

        fireEvent.click(screen.getByRole('button', { name: 'Place Catering Order' }));
        expect(screen.getByRole('button', { name: 'Placing Order...' })).toBeDisabled();
        fireEvent.click(screen.getByRole('button', { name: 'Placing Order...' }));
        expect(mocks.createCateringOrder).toHaveBeenCalledTimes(1);

        vi.useFakeTimers();
        await act(async () => resolveOrder({ _id: 'order-1' }));
        expect(screen.getByRole('dialog')).toHaveTextContent('Catering request received');
        expect(screen.getByRole('dialog')).toHaveFocus();
        expect(screen.getByRole('button', { name: 'Place Catering Order' })).toBeDisabled();
        expect(screen.queryByText('Catering destination')).not.toBeInTheDocument();

        await act(async () => vi.advanceTimersByTime(3000));
        expect(screen.getByText('Catering destination')).toBeInTheDocument();
    });
});
