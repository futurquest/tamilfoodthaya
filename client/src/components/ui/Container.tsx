import React from 'react';
import { cn } from '../../lib/utils';

export const Container = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)}>
        {children}
    </div>
);
