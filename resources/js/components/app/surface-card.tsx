import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SurfaceCard({
    title,
    description,
    action,
    children,
    className,
    contentClassName,
    ...props
}: Omit<HTMLAttributes<HTMLElement>, 'title'> & {
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    contentClassName?: string;
}) {
    return (
        <section
            className={cn(
                'overflow-hidden rounded-3xl border border-white/80 bg-card/95 shadow-[0_24px_60px_-38px_rgba(58,105,145,0.5)] backdrop-blur-sm',
                className,
            )}
            {...props}
        >
            {(title || description || action) && (
                <div className="flex items-start justify-between gap-4 border-b border-sky-100/80 px-5 py-5 sm:px-6 sm:py-6">
                    <div>
                        {title && (
                            <h2 className="text-lg font-semibold text-foreground">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && <div className="shrink-0">{action}</div>}
                </div>
            )}
            <div className={cn('p-5 sm:p-6', contentClassName)}>{children}</div>
        </section>
    );
}
