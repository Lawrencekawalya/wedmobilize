import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    ContactRound,
    MessageSquareText,
    Send,
} from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    const startUrl = auth.user ? dashboard() : login();

    return (
        <>
            <Head title="WedMobilize" />

            <main className="min-h-screen overflow-hidden bg-[#f4fdff] text-[#172a45]">
                <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-7">
                    <Link
                        href="/"
                        className="shrink-0 text-lg font-semibold tracking-tight whitespace-nowrap sm:text-xl"
                    >
                        Wed<span className="text-[#00bf83]">Mobilize</span>
                    </Link>

                    <nav className="flex shrink-0 items-center gap-1 sm:gap-4">
                        <Link
                            href={startUrl}
                            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-[#486284] transition hover:bg-white/70 sm:block"
                        >
                            {auth.user ? 'Dashboard' : 'Log in'}
                        </Link>
                        <Link
                            href={startUrl}
                            className="rounded-xl bg-[#00bf83] px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-[#00a973] sm:px-4"
                        >
                            <span className="sm:hidden">Start</span>
                            <span className="hidden sm:inline">
                                Start sending
                            </span>
                        </Link>
                    </nav>
                </header>

                <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pt-10 pb-16 sm:px-6 sm:pb-20 lg:grid-cols-[1fr_0.9fr] lg:gap-12 lg:pt-20 lg:pb-28">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold tracking-[0.13em] text-[#00a973] uppercase sm:text-sm sm:tracking-[0.16em]">
                            Event communication, simplified
                        </p>
                        <h1 className="mt-4 max-w-2xl text-[2.6rem] leading-[1.06] font-semibold tracking-tight sm:mt-5 sm:text-6xl sm:leading-tight">
                            Reach every person.{' '}
                            <span className="text-[#4c78a8]">
                                Right on time.
                            </span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-[#5d7696] sm:mt-6 sm:text-lg sm:leading-8">
                            WedMobilize is your event SMS hub for managing
                            contacts, sending announcements, and scheduling
                            messages that keep everyone informed.
                        </p>
                        <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
                            <Link
                                href={startUrl}
                                className="rounded-2xl bg-[#172a45] px-6 py-3 text-center font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:bg-[#223a5d]"
                            >
                                Create an event
                            </Link>
                            <a
                                href="#overview"
                                className="rounded-2xl border border-[#d7eaf0] bg-white/75 px-6 py-3 text-center font-semibold text-[#3e608a] transition hover:bg-white"
                            >
                                See how it works
                            </a>
                        </div>
                    </div>

                    <div
                        id="overview"
                        className="rounded-[2rem] bg-white/85 p-3 shadow-2xl shadow-[#4e769a]/10 backdrop-blur sm:rounded-[2.5rem] sm:p-5"
                    >
                        <div className="rounded-[1.5rem] bg-[linear-gradient(145deg,#ddf7ff,#eafcf3)] p-5 sm:rounded-[2rem] sm:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-[#5d7696]">
                                        Event message hub
                                    </p>
                                    <h2 className="mt-2 text-xl leading-snug font-semibold sm:text-2xl">
                                        Your communication, in one place.
                                    </h2>
                                </div>
                                <div className="rounded-2xl bg-white/80 p-3 text-[#00bf83]">
                                    <Send className="size-5" />
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-9 sm:gap-3">
                                <Metric
                                    icon={ContactRound}
                                    value="1,248"
                                    label="Contacts"
                                />
                                <Metric
                                    icon={MessageSquareText}
                                    value="3,860"
                                    label="Messages sent"
                                />
                                <Metric
                                    icon={CalendarClock}
                                    value="12"
                                    label="Scheduled messages"
                                />
                                <Metric
                                    icon={Send}
                                    value="98%"
                                    label="Delivery rate"
                                />
                            </div>

                            <p className="mt-5 text-xs leading-5 text-[#68809d]">
                                A simple view of the contacts and messages that
                                power your next event.
                            </p>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-[#dceff3] px-6 py-6 text-center text-sm text-[#69819b]">
                    WedMobilize · Better event communication through SMS.
                </footer>
            </main>
        </>
    );
}

function Metric({
    icon: Icon,
    value,
    label,
}: {
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    label: string;
}) {
    return (
        <div className="rounded-2xl bg-white/85 p-3 shadow-sm shadow-sky-950/5 sm:p-4">
            <Icon className="mb-3 size-5 text-[#00bf83] sm:mb-5" />
            <strong className="block text-xl tracking-tight sm:text-2xl">
                {value}
            </strong>
            <span className="mt-1 block text-sm text-[#5d7696]">{label}</span>
        </div>
    );
}
