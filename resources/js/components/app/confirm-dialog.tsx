import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Delete',
    processing = false,
    onConfirm,
    icon: Icon = AlertTriangle,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    processing?: boolean;
    onConfirm: () => void;
    icon?: LucideIcon;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl border-slate-100 p-0 sm:max-w-md">
                <div className="p-6">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <Icon className="size-5" />
                    </div>
                    <DialogHeader className="mt-4">
                        <DialogTitle className="text-xl text-[#172a45]">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="leading-6 text-[#7187a0]">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <DialogFooter className="border-t border-slate-100 bg-slate-50/70 p-4 sm:px-6">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        className="rounded-xl"
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing && (
                            <LoaderCircle className="size-4 animate-spin" />
                        )}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
