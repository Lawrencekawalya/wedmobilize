import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
    className,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <header
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0">
                {eyebrow && (
                    <p className="text-sm font-semibold tracking-[0.08em] text-[#13a97c] uppercase">
                        {eyebrow}
                    </p>
                )}
                <h1 className="mt-1 text-3xl font-semibold text-foreground sm:text-4xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
        </header>
    );
}
