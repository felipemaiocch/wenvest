'use client';

import { useMemo } from 'react';

// Mock rates - In production this would fetch from an API (e.g. AwesomeAPI)
const RATES = {
    USD: 5.15,
    EUR: 5.58,
    BRL: 1.00,
};

export function useCurrencyConverter() {
    const convertToBRL = (amount: number, currency: 'USD' | 'EUR' | 'BRL') => {
        return amount * (RATES[currency] || 1);
    };

    const formatBRL = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(amount);
    };

    return { convertToBRL, formatBRL, rates: RATES };
}
