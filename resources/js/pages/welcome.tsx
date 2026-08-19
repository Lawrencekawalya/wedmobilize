import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarHeart,
    MessageCircleMore,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    const features: { icon: LucideIcon; title: string; copy: string }[] = [
        {
            icon: UsersRound,
            title: 'Guest management',
            copy: 'Keep every important person organized.',
        },
        {
            icon: CalendarHeart,
            title: 'Planning meetings',
            copy: 'Bring your committee together with clarity.',
        },
        {
            icon: WalletCards,
            title: 'Contribution tracking',
            copy: 'A thoughtful foundation for every contribution.',
        },
        {
            icon: MessageCircleMore,
            title: 'SMS notifications',
            copy: 'Keep everyone informed at the right time.',
        },
    ];

    return (
        <>
            <Head title="WedMobilize" />
            <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_5%_0%,#dcf6ff,_transparent_27%),radial-gradient(circle_at_94%_18%,#d7f7e9,_transparent_28%),#f9fdff] text-slate-800">
                <header className="mx-auto flex max-w-6xl items-center justify-between p-6">
                    <Link
                        href="/"
                        className="text-xl font-semibold tracking-tight"
                    >
                        Wed<span className="text-emerald-500">Mobilize</span>
                    </Link>
                    <nav className="flex items-center gap-3">
                        <Link
                            href={auth.user ? dashboard() : login()}
                            className="rounded-xl px-4 py-2 text-sm font-medium"
                        >
                            {auth.user ? 'Dashboard' : 'Log in'}
                        </Link>
                        <Link
                            href={auth.user ? dashboard() : login()}
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20"
                        >
                            Get started
                        </Link>
                    </nav>
                </header>
                <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
                    <div className="self-center">
                        <p className="text-sm font-semibold tracking-[0.18em] text-emerald-600 uppercase">
                            Wedding planning, together
                        </p>
                        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
                            Organize your wedding.{' '}
                            <span className="text-sky-600">
                                Mobilize your people.
                            </span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                            WedMobilize gives couples and committees one calm
                            place to manage guests, planning meetings,
                            invitations, and important updates.
                        </p>
                        <div className="mt-8 flex gap-3">
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="rounded-2xl bg-slate-900 px-6 py-3 font-medium text-white"
                            >
                                Create your wedding
                            </Link>
                            <a
                                href="#features"
                                className="rounded-2xl border border-sky-200 bg-white/70 px-6 py-3 font-medium"
                            >
                                Explore features
                            </a>
                        </div>
                    </div>
                    <div className="rounded-[2.5rem] bg-white/80 p-5 shadow-2xl shadow-sky-950/10 backdrop-blur">
                        <div className="rounded-[2rem] bg-[linear-gradient(145deg,#dff7ff,#effcf8)] p-7">
                            <p className="text-sm text-slate-500">
                                Sarah &amp; Peter’s wedding
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold">
                                A calm plan for a big day.
                            </h2>
                            <div className="mt-10 grid grid-cols-2 gap-3">
                                {[
                                    ['182', 'Guests'],
                                    ['28', 'Days to go'],
                                    ['4', 'Meetings'],
                                    ['UGX 6.2m', 'Target'],
                                ].map(([value, label]) => (
                                    <div
                                        key={label}
                                        className="rounded-2xl bg-white/80 p-4"
                                    >
                                        <strong className="block text-xl">
                                            {value}
                                        </strong>
                                        <span className="text-xs text-slate-500">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
                    <div className="grid gap-4 md:grid-cols-4">
                        {features.map(({ icon: Icon, title, copy }) => (
                            <div
                                key={title}
                                className="rounded-3xl border border-white bg-white/75 p-6 shadow-sm"
                            >
                                <Icon className="size-6 text-emerald-500" />
                                <h2 className="mt-5 font-semibold">{title}</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {copy}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
                <footer className="border-t border-sky-100 p-6 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} WedMobilize · Built for people
                    planning a meaningful day.
                </footer>
            </main>
        </>
    );
}
