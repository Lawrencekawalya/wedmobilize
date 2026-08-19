import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f4fdff] p-5 text-[#172a45] sm:p-8">
            <div className="absolute -top-32 -left-32 size-96 rounded-full bg-sky-200/35 blur-3xl" />
            <div className="absolute -right-28 -bottom-28 size-96 rounded-full bg-emerald-200/35 blur-3xl" />
            <div className="relative w-full max-w-md">
                <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-2xl shadow-[#4e769a]/10 backdrop-blur sm:p-9">
                    <div className="flex flex-col items-center gap-5">
                        <Link
                            href={home()}
                            className="text-xl font-semibold tracking-tight"
                        >
                            Wed<span className="text-[#00bf83]">Mobilize</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <p className="text-xs font-semibold tracking-[0.14em] text-[#00a973] uppercase">
                                Event SMS hub
                            </p>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {title}
                            </h1>
                            <p className="text-center text-sm leading-6 text-[#5d7696]">
                                {description}
                            </p>
                        </div>
                    </div>
                    <div className="mt-8">{children}</div>
                </div>
                <p className="mt-5 text-center text-xs text-[#7187a0]">
                    Organize your contacts. Send with confidence.
                </p>
            </div>
        </div>
    );
}
