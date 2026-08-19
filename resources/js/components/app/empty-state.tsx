import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center px-4 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00a973]">
                <Icon className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-[#172a45]">{title}</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-[#7187a0]">
                {description}
            </p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
