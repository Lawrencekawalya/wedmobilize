import { Head, Link } from '@inertiajs/react';
import {
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Clock3,
    ContactRound,
    MessageSquareText,
    Send,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import { dashboard } from '@/routes';

type DashboardProps = {
    summary: {
        contacts: number;
        groups: number;
        messages_sent: number;
        scheduled: number;
        delivery_rate: number | null;
        delivered: number;
        delivery_failed: number;
        campaigns: number;
    };
    recentMessages: RecentMessage[];
    sms: {
        configured: boolean;
        balance: number | null;
        sender_id: string | null;
    };
};

type RecentMessage = {
    id: number;
    body: string;
    status: string;
    recipient_count: number;
    submitted_count: number;
    failed_count: number;
    sms_parts: number;
    estimated_units: number;
    scheduled_at: string | null;
    submitted_at: string | null;
    created_at: string;
};

const metricStyles = [
    'bg-emerald-50 text-emerald-600',
    'bg-sky-50 text-sky-600',
    'bg-violet-50 text-violet-600',
    'bg-amber-50 text-amber-600',
];

export default function Dashboard({
    summary,
    recentMessages,
    sms,
}: DashboardProps) {
    const metrics = [
        {
            label: 'Active contacts',
            value: summary.contacts.toLocaleString(),
            detail: `${summary.groups} ${summary.groups === 1 ? 'group' : 'groups'} available`,
            icon: ContactRound,
        },
        {
            label: 'SMS submitted',
            value: summary.messages_sent.toLocaleString(),
            detail: `${summary.campaigns} saved ${summary.campaigns === 1 ? 'campaign' : 'campaigns'}`,
            icon: MessageSquareText,
        },
        {
            label: 'Scheduled',
            value: summary.scheduled.toLocaleString(),
            detail: 'Messages waiting to send',
            icon: CalendarClock,
        },
        {
            label: 'Delivery rate',
            value:
                summary.delivery_rate === null
                    ? '—'
                    : `${summary.delivery_rate}%`,
            detail:
                summary.delivery_rate === null
                    ? 'Waiting for final delivery reports'
                    : `${summary.delivered} delivered · ${summary.delivery_failed} failed`,
            icon: Send,
        },
    ];

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
                                Your contacts, scheduled announcements, sends,
                                and delivery reports are summarized here in real
                                time.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-[#00bf83] text-white shadow-lg shadow-emerald-500/20">
                                <WalletCards className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#172a45]">
                                    EgoSMS balance
                                </p>
                                <p className="text-sm text-[#5d7696]">
                                    {sms.balance === null
                                        ? sms.configured
                                            ? 'Balance temporarily unavailable'
                                            : 'EgoSMS is not configured'
                                        : `UGX ${sms.balance.toLocaleString()}`}
                                </p>
                                {sms.sender_id && (
                                    <p className="mt-0.5 text-xs text-[#7187a0]">
                                        Requested sender: {sms.sender_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric, index) => {
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
                                        className={`flex size-10 items-center justify-center rounded-xl ${metricStyles[index]}`}
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
                                    Communication timeline
                                </h2>
                            </div>
                            <Clock3 className="size-5 text-[#00bf83]" />
                        </div>
                        {recentMessages.length === 0 ? (
                            <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/55 px-6 text-center">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#00bf83] shadow-sm">
                                    <MessageSquareText className="size-6" />
                                </div>
                                <p className="mt-4 font-medium text-[#172a45]">
                                    No messages yet
                                </p>
                                <p className="mt-1 text-sm text-[#5d7696]">
                                    Your sends and scheduled reminders will
                                    appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 divide-y divide-slate-100">
                                {recentMessages.map((message) => (
                                    <Link
                                        key={message.id}
                                        href={
                                            message.status === 'scheduled'
                                                ? '/messages/scheduled'
                                                : '/messages/outbox'
                                        }
                                        className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`size-2 rounded-full ${statusColor(message.status)}`}
                                                />
                                                <span className="text-xs font-semibold tracking-wide text-[#5d7696] uppercase">
                                                    {statusLabel(
                                                        message.status,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-1 truncate text-sm font-medium text-[#172a45]">
                                                {message.body}
                                            </p>
                                            <p className="mt-1 text-xs text-[#7187a0]">
                                                {message.recipient_count}{' '}
                                                recipients · {message.sms_parts}{' '}
                                                SMS{' '}
                                                {message.sms_parts === 1
                                                    ? 'part'
                                                    : 'parts'}
                                            </p>
                                        </div>
                                        <p className="text-xs text-[#7187a0] sm:text-right">
                                            {formatDate(
                                                message.scheduled_at ??
                                                    message.submitted_at ??
                                                    message.created_at,
                                            )}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                        <Link
                            href="/messages/outbox"
                            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#4774a4]"
                        >
                            View complete Outbox
                            <ChevronRight className="size-4" />
                        </Link>
                    </article>

                    <aside
                        className={`rounded-3xl border p-6 sm:p-7 ${sms.configured ? 'border-emerald-100 bg-emerald-50/70' : 'border-amber-100 bg-amber-50/70'}`}
                    >
                        <div
                            className={`flex size-11 items-center justify-center rounded-xl ${sms.configured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                            {sms.configured ? (
                                <CheckCircle2 className="size-5" />
                            ) : (
                                <CircleAlert className="size-5" />
                            )}
                        </div>
                        <h2 className="mt-5 text-xl font-semibold text-[#172a45]">
                            {sms.configured
                                ? 'EgoSMS connected'
                                : 'Set up SMS sending'}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#5d7696]">
                            {sms.configured
                                ? 'Your provider credentials are active. Send now, schedule messages, and monitor delivery callbacks.'
                                : 'Add your EgoSMS credentials before sending live event updates.'}
                        </p>
                        <div className="mt-6 grid gap-3">
                            <Link
                                href="/messages/single-bulk"
                                className="flex items-center justify-between rounded-xl bg-[#172a45] px-4 py-3 text-sm font-semibold text-white"
                            >
                                <span>Create a message</span>
                                <ChevronRight className="size-4" />
                            </Link>
                            <Link
                                href="/contacts"
                                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#4774a4]"
                            >
                                <span>Manage contacts</span>
                                <UsersRound className="size-4" />
                            </Link>
                        </div>
                    </aside>
                </section>
            </div>
        </>
    );
}

function statusLabel(status: string): string {
    return status === 'submitted'
        ? 'Accepted by EgoSMS'
        : status.replaceAll('_', ' ');
}

function statusColor(status: string): string {
    if (status === 'failed' || status === 'partially_failed') {
        return 'bg-red-500';
    }

    if (status === 'scheduled') {
        return 'bg-violet-500';
    }

    if (status === 'processing') {
        return 'bg-amber-500';
    }

    return 'bg-emerald-500';
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
