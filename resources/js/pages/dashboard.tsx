import { Head } from '@inertiajs/react';
import {
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Clock3,
    ContactRound,
    MessageSquareText,
    Send,
    WalletCards,
} from 'lucide-react';
import { dashboard } from '@/routes';

const metrics = [
    {
        label: 'Contacts',
        value: '0',
        detail: 'Ready for your guest list',
        icon: ContactRound,
        style: 'bg-emerald-50 text-emerald-600',
    },
    {
        label: 'Messages sent',
        value: '0',
        detail: 'Across all your events',
        icon: MessageSquareText,
        style: 'bg-sky-50 text-sky-600',
    },
    {
        label: 'Scheduled',
        value: '0',
        detail: 'Messages waiting to send',
        icon: CalendarClock,
        style: 'bg-violet-50 text-violet-600',
    },
    {
        label: 'Delivery rate',
        value: '—',
        detail: 'Available after your first send',
        icon: Send,
        style: 'bg-amber-50 text-amber-600',
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <section className="rounded-[2rem] border border-white/80 bg-linear-to-br from-sky-100 via-cyan-50 to-emerald-50 p-6 shadow-xl shadow-[#4e769a]/10 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#5d7696]">
                                Your event communication hub
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172a45] sm:text-4xl">
                                Keep every guest in the loop.
                            </h1>
                            <p className="mt-3 max-w-xl leading-7 text-[#5d7696]">
                                Add contacts, create your first message, and use
                                SMS to keep your event running smoothly.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-[#00bf83] text-white shadow-lg shadow-emerald-500/20">
                                <WalletCards className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#172a45]">
                                    SMS credits
                                </p>
                                <p className="text-sm text-[#5d7696]">
                                    Connect EgoSMS to check your balance
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <article
                                key={metric.label}
                                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-[#5d7696]">
                                            {metric.label}
                                        </p>
                                        <p className="mt-3 text-3xl font-semibold tracking-tight text-[#172a45]">
                                            {metric.value}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex size-10 items-center justify-center rounded-xl ${metric.style}`}
                                    >
                                        <Icon className="size-5" />
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-[#7187a0]">
                                    {metric.detail}
                                </p>
                            </article>
                        );
                    })}
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
                    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/60 sm:p-7">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-[#5d7696]">
                                    Recent activity
                                </p>
                                <h2 className="mt-1 text-xl font-semibold text-[#172a45]">
                                    Your communication timeline
                                </h2>
                            </div>
                            <Clock3 className="size-5 text-[#00bf83]" />
                        </div>
                        <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/55 px-6 text-center">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#00bf83] shadow-sm">
                                <MessageSquareText className="size-6" />
                            </div>
                            <p className="mt-4 font-medium text-[#172a45]">
                                No messages yet
                            </p>
                            <p className="mt-1 max-w-sm text-sm leading-6 text-[#5d7696]">
                                Sent messages, scheduled reminders, and delivery
                                updates will appear here.
                            </p>
                        </div>
                    </article>
                    <aside className="rounded-3xl border border-amber-100 bg-amber-50/70 p-6 sm:p-7">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <CircleAlert className="size-5" />
                        </div>
                        <h2 className="mt-5 text-xl font-semibold text-[#172a45]">
                            Set up SMS sending
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#5d7696]">
                            Add your EgoSMS credentials before you send live
                            event updates. Your credentials stay securely on the
                            server.
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#177b63]">
                            <CheckCircle2 className="size-4" />
                            Ready for configuration
                        </div>
                        <div className="mt-5 flex items-center gap-1 text-sm font-medium text-[#4774a4]">
                            SMS integration is next
                            <ChevronRight className="size-4" />
                        </div>
                    </aside>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
