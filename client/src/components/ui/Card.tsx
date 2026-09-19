import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) => (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-dark-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary-200', className)} style={style}>
        {children}
    </div>
);

export const CardHeader = ({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) => (
    <div className={cn('px-6 py-4 border-b border-dark-100', className)} style={style}>{children}</div>
);

export const CardContent = ({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) => (
    <div className={cn('p-6', className)} style={style}>{children}</div>
);

export const CardFooter = ({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) => (
    <div className={cn('px-6 py-4 border-t border-dark-100 bg-dark-50/50', className)} style={style}>{children}</div>
);
