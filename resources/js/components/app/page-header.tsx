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
                    <p className="text-sm font-semibold tracking-wide text-[#00a973]">
                        {eyebrow}
                    </p>
                )}
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#172a45] sm:text-4xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d7696] sm:text-base">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
        </header>
    );
}
