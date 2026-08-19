import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    FileText,
    Inbox,
    MailPlus,
    MessageCircleMore,
    Send,
    Sparkles,
} from 'lucide-react';

const sections = [
    {
        key: 'single-bulk',
        label: 'Single / Bulk SMS',
        href: '/messages/single-bulk',
        icon: MailPlus,
    },
    {
        key: 'custom',
        label: 'Custom SMS',
        href: '/messages/custom',
        icon: Sparkles,
    },
    {
        key: 'scheduled',
        label: 'Scheduled SMS',
        href: '/messages/scheduled',
        icon: CalendarClock,
    },
    { key: 'inbox', label: 'Inbox', href: '/messages/inbox', icon: Inbox },
    { key: 'outbox', label: 'Outbox', href: '/messages/outbox', icon: Send },
    {
        key: 'templates',
        label: 'Message templates',
        href: '/messages/templates',
        icon: FileText,
    },
];

const content = {
    custom: {
        title: 'Custom SMS',
        description:
            'Create personal messages using contact details such as a guest name.',
    },
    scheduled: {
        title: 'Scheduled SMS',
        description:
            'Plan reminders and announcements to be sent at the right time.',
    },
    inbox: {
        title: 'Inbox',
        description:
            'Replies from your guests will appear here once two-way SMS is enabled.',
    },
    outbox: {
        title: 'Outbox',
        description:
            'Track sent messages, provider references, and delivery updates.',
    },
    templates: {
        title: 'Message templates',
        description: 'Save reusable event announcements and reminders.',
    },
} as const;

export default function MessageCenter() {
    const { section = 'single-bulk' } = usePage<{ section?: string }>().props;
    const active = sections.find((item) => item.key === section) ?? sections[0];
    const isComposer = active.key === 'single-bulk';
    const pageContent = !isComposer
        ? content[active.key as keyof typeof content]
        : null;

    return (
        <>
            <Head title={`${active.label} | Message Center`} />
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <p className="text-sm font-medium text-[#00a973]">
                        Event communication
                    </p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#172a45] sm:text-4xl">
                        Message Center
                    </h1>
                    <p className="mt-2 text-[#5d7696]">
                        Create, schedule, and track every message that keeps
                        your guests informed.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                    <nav
                        className="rounded-3xl border border-slate-100 bg-white p-2 shadow-sm shadow-slate-200/70"
                        aria-label="Message Center sections"
                    >
                        {sections.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.key === active.key;

                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-[#00bf83] text-white shadow-lg shadow-emerald-500/20' : 'text-[#466582] hover:bg-sky-50 hover:text-[#172a45]'}`}
                                >
                                    <Icon className="size-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {isComposer ? (
                        <Composer />
                    ) : (
                        <EmptySection
                            title={pageContent?.title ?? active.label}
                            description={pageContent?.description ?? ''}
                            icon={active.icon}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

function Composer() {
    return (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-[#00a973]">
                        New message
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-[#172a45]">
                        Single / Bulk SMS
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#5d7696]">
                        Send an update to one guest or your whole contact list.
                    </p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-[#00bf83]">
                    <Send className="size-5" />
                </div>
            </div>
            <div className="mt-8 grid gap-6">
                <label className="grid gap-2 text-sm font-medium text-[#172a45]">
                    <span>Recipients</span>
                    <select className="h-11 rounded-xl border border-sky-100 bg-white px-3 text-sm text-[#5d7696] outline-none focus:border-[#00bf83] focus:ring-2 focus:ring-emerald-100">
                        <option>Choose contacts or a group</option>
                        <option disabled>
                            Contacts will appear here after setup
                        </option>
                    </select>
                    <span className="text-xs font-normal text-[#7187a0]">
                        Contacts are managed in the upcoming Contacts module.
                    </span>
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#172a45]">
                    <span>Message</span>
                    <textarea
                        rows={6}
                        maxLength={160}
                        placeholder="Write a clear update for your guests..."
                        className="resize-none rounded-xl border border-sky-100 p-3 text-sm outline-none placeholder:text-[#9baec2] focus:border-[#00bf83] focus:ring-2 focus:ring-emerald-100"
                    />
                    <span className="text-right text-xs font-normal text-[#7187a0]">
                        0 / 160 characters · 1 SMS
                    </span>
                </label>
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#7187a0]">
                        EgoSMS connection required before sending.
                    </p>
                    <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#172a45] px-5 py-3 text-sm font-semibold text-white opacity-50"
                    >
                        <Send className="size-4" />
                        Send message
                    </button>
                </div>
            </div>
        </section>
    );
}

function EmptySection({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon: typeof Send;
}) {
    return (
        <section className="flex min-h-96 flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm shadow-slate-200/70">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-[#00bf83]">
                <Icon className="size-6" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-[#172a45]">
                {title}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#5d7696]">
                {description}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-[#177b63]">
                <MessageCircleMore className="size-4" />
                Coming in the next Message Center step
            </div>
        </section>
    );
}

MessageCenter.layout = {
    breadcrumbs: [{ title: 'Message Center', href: '/messages/single-bulk' }],
};
