import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('bg-white rounded-lg shadow-md overflow-hidden border border-gray-100', className)}>
        {children}
    </div>
);

export const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('p-4 border-b border-gray-100', className)}>{children}</div>
);

export const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('p-4', className)}>{children}</div>
);

export const CardFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('p-4 border-t border-gray-100 bg-gray-50/50', className)}>{children}</div>
);
