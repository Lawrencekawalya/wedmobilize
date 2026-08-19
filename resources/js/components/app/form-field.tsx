import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';

export function FormField({
    label,
    htmlFor,
    hint,
    error,
    required,
    children,
}: {
    label: string;
    htmlFor?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={htmlFor} className="text-[#172a45]">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </Label>
                {hint && <span className="text-xs text-[#8498ad]">{hint}</span>}
            </div>
            {children}
            <InputError message={error} />
        </div>
    );
}
