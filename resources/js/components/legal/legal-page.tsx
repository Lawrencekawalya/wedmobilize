import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

export function LegalPage({
    eyebrow,
    title,
    summary,
    children,
}: {
    eyebrow: string;
    title: string;
    summary: string;
    children: ReactNode;
}) {
    return (
        <main className="min-h-screen bg-[#f4fdff] text-[#172a45]">
            <header className="border-b border-[#dceff3] bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
                    <Link
                        href="/"
                        className="text-lg font-semibold tracking-tight whitespace-nowrap sm:text-xl"
                    >
                        Wed<span className="text-[#00bf83]">Mobilize</span>
                    </Link>
                    <Link
                        href="/"
                        className="rounded-xl border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-[#3e608a] transition hover:border-emerald-200 hover:text-[#00a973]"
                    >
                        Back to home
                    </Link>
                </div>
            </header>

            <article className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
                <div className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-xl shadow-sky-950/5 sm:p-10 lg:p-14">
                    <p className="text-xs font-semibold tracking-[0.15em] text-[#00a973] uppercase">
                        {eyebrow}
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-7 text-[#5d7696] sm:text-lg">
                        {summary}
                    </p>
                    <p className="mt-4 text-sm font-medium text-[#7187a0]">
                        Effective and last updated: 20 August 2026
                    </p>

                    <div className="mt-10 space-y-9 border-t border-slate-100 pt-9 text-[0.95rem] leading-7 text-[#405b7c] [&_a]:font-medium [&_a]:text-[#167e69] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#172a45] [&_li]:pl-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                        {children}
                    </div>
                </div>
            </article>

            <footer className="border-t border-[#dceff3] px-5 py-7 text-sm text-[#69819b]">
                <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
                    <span>© 2026 WedMobilize</span>
                    <nav
                        aria-label="Legal"
                        className="flex flex-wrap justify-center gap-x-5 gap-y-2"
                    >
                        <Link href="/terms" className="hover:text-[#00a973]">
                            Terms
                        </Link>
                        <Link href="/privacy" className="hover:text-[#00a973]">
                            Privacy
                        </Link>
                        <Link
                            href="/acceptable-use"
                            className="hover:text-[#00a973]"
                        >
                            Acceptable use
                        </Link>
                    </nav>
                </div>
            </footer>
        </main>
    );
}
