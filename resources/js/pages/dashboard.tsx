import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Coins,
    ContactRound,
    MessageSquareText,
    RadioTower,
    Send,
    Sparkles,
    UserRoundX,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import { dashboard } from '@/routes';

type ActivityPoint = {
    label: string;
    total: number;
    accepted: number;
    delivered: number;
    failed: number;
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
        local_rate: number;
        estimated_remaining: number | null;
    };
    analytics: {
        daily: (ActivityPoint & { date: string })[];
        monthly: (ActivityPoint & { month: number })[];
        networks: {
            name: string;
            recipients: number;
            units: number;
            percentage: number;
        }[];
        spending: {
            units: number;
            estimated_cost: number;
            provider_reported_cost: number;
        };
        upcoming: {
            id: number;
            body: string;
            recipient_count: number;
            sms_parts: number;
            estimated_units: number;
            scheduled_at: string;
        }[];
        contact_health: {
            missing_name: number;
            without_group: number;
        };
    };
};

const metricStyles = [
    'bg-emerald-50 text-emerald-600',
    'bg-sky-50 text-sky-600',
    'bg-violet-50 text-violet-600',
    'bg-amber-50 text-amber-600',
];

const chartSeries = [
    { key: 'accepted' as const, label: 'Accepted', color: 'bg-sky-500' },
    {
        key: 'delivered' as const,
        label: 'Delivered',
        color: 'bg-emerald-500',
    },
    { key: 'failed' as const, label: 'Failed', color: 'bg-rose-400' },
];

export default function Dashboard({
    summary,
    recentMessages,
    sms,
    analytics,
}: DashboardProps) {
    const { auth } = usePage().props;
    const firstName = auth.user.name.split(' ')[0];
    const metrics = [
        {
            label: 'Active contacts',
            value: summary.contacts.toLocaleString(),
            detail: `${summary.groups} ${summary.groups === 1 ? 'group' : 'groups'} available`,
            icon: ContactRound,
        },
        {
            label: 'SMS accepted',
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
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8">
                <section className="overflow-hidden rounded-[2rem] bg-linear-to-br from-[#164d7d] via-[#247bb9] to-[#00a87a] p-6 text-white shadow-xl shadow-sky-900/15 sm:p-8">
                    <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                            <p className="text-sm font-medium text-cyan-100">
                                Your event communication hub
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Welcome back, {firstName}.
                            </h1>
                            <p className="mt-3 max-w-xl leading-7 text-sky-100">
                                Your contacts, scheduled announcements, sends,
                                and delivery reports are summarized here in real
                                time.
                            </p>
                        </div>
                        <div className="grid min-w-0 gap-3 rounded-2xl border border-white/15 bg-white/12 p-4 backdrop-blur sm:min-w-96 sm:grid-cols-3">
                            <WalletStat
                                label="EgoSMS balance"
                                value={
                                    sms.balance === null
                                        ? 'Unavailable'
                                        : formatMoney(sms.balance)
                                }
                            />
                            <WalletStat
                                label="Est. SMS left"
                                value={
                                    sms.estimated_remaining === null
                                        ? '—'
                                        : sms.estimated_remaining.toLocaleString()
                                }
                            />
                            <WalletStat
                                label="Local rate"
                                value={`${formatMoney(sms.local_rate)}/SMS`}
                            />
                            <p className="text-xs leading-5 text-cyan-100 sm:col-span-3">
                                Capacity assumes one local, single-part SMS.
                                Multipart and Unicode messages use more units.
                            </p>
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

                <section className="grid gap-5 xl:grid-cols-2">
                    <ChartCard
                        eyebrow="Current week"
                        title="Messages sent per day"
                        icon={BarChart3}
                    >
                        <ActivityBars points={analytics.daily} />
                    </ChartCard>
                    <ChartCard
                        eyebrow={new Date().getFullYear().toString()}
                        title="Messages sent per month"
                        icon={Sparkles}
                    >
                        <MonthlyBars points={analytics.monthly} />
                    </ChartCard>
                </section>

                <section className="grid gap-5 xl:grid-cols-2">
                    <NetworkUsage networks={analytics.networks} />
                    <SpendingInsight
                        spending={analytics.spending}
                        rate={sms.local_rate}
                        balance={sms.balance}
                    />
                </section>

                <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <UpcomingMessages messages={analytics.upcoming} />
                    <ContactHealth
                        health={analytics.contact_health}
                        contacts={summary.contacts}
                    />
                </section>

                <section className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
                    <RecentActivity messages={recentMessages} />
                    <ProviderCard sms={sms} />
                </section>
            </div>
        </>
    );
}

function WalletStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-white/12 p-3">
            <p className="text-xs text-cyan-100">{label}</p>
            <p className="mt-1 font-semibold text-white">{value}</p>
        </div>
    );
}

function ChartCard({
    eyebrow,
    title,
    icon: Icon,
    children,
}: {
    eyebrow: string;
    title: string;
    icon: typeof BarChart3;
    children: React.ReactNode;
}) {
    return (
        <article className="min-w-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wide text-[#00a879] uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#172a45] sm:text-xl">
                        {title}
                    </h2>
                </div>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 sm:size-10">
                    <Icon className="size-5" />
                </div>
            </div>
            {children}
        </article>
    );
}

function ActivityBars({ points }: { points: ActivityPoint[] }) {
    const maximum = Math.max(
        1,
        ...points.flatMap((point) =>
            chartSeries.map((series) => point[series.key]),
        ),
    );
    const hasData = points.some((point) => point.total > 0);

    return (
        <>
            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px] text-[#5d7696] sm:flex sm:flex-wrap sm:gap-3 sm:text-xs">
                {chartSeries.map((series) => (
                    <span
                        key={series.key}
                        className="flex items-center gap-1.5"
                    >
                        <span
                            className={`size-2 rounded-full ${series.color}`}
                        />
                        {series.label}
                    </span>
                ))}
            </div>
            <div className="relative mt-4 h-48 min-w-0 border-b border-slate-200 sm:mt-5 sm:h-52">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3].map((line) => (
                        <span
                            key={line}
                            className="border-t border-dashed border-slate-100"
                        />
                    ))}
                </div>
                <div className="absolute inset-0 grid min-w-0 grid-cols-7 gap-0.5 sm:gap-4">
                    {points.map((point) => (
                        <div
                            key={point.label}
                            className="flex min-w-0 flex-col items-center justify-end"
                        >
                            <div className="flex h-36 w-full items-end justify-center gap-px sm:h-40 sm:gap-1">
                                {chartSeries.map((series) => (
                                    <div
                                        key={series.key}
                                        title={`${point.label}: ${point[series.key]} ${series.label.toLowerCase()}`}
                                        className={`w-1.5 rounded-t-sm transition-all sm:w-3 sm:rounded-t-md ${series.color}`}
                                        style={{
                                            height: barHeight(
                                                point[series.key],
                                                maximum,
                                            ),
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="mt-2 text-[9px] font-medium text-[#7187a0] sm:text-xs">
                                {point.label}
                            </span>
                        </div>
                    ))}
                </div>
                {!hasData && <ChartEmptyState />}
            </div>
        </>
    );
}

function MonthlyBars({ points }: { points: ActivityPoint[] }) {
    const maximum = Math.max(1, ...points.map((point) => point.accepted));
    const hasData = points.some((point) => point.total > 0);

    return (
        <div className="relative mt-4 h-52 min-w-0 border-b border-slate-200 sm:mt-5 sm:h-64">
            <div className="grid h-full min-w-0 grid-cols-12 gap-0.5 sm:gap-2">
                {points.map((point) => (
                    <div
                        key={point.label}
                        className="flex min-w-0 flex-col items-center justify-end"
                    >
                        {point.accepted > 0 && (
                            <span className="mb-1 text-[10px] font-semibold text-[#4774a4]">
                                {point.accepted}
                            </span>
                        )}
                        <div
                            title={`${point.label}: ${point.accepted} accepted, ${point.delivered} delivered, ${point.failed} failed`}
                            className="w-3 rounded-t-md bg-linear-to-t from-sky-500 to-emerald-400 sm:w-7 sm:rounded-t-lg"
                            style={{
                                height: barHeight(point.accepted, maximum, 170),
                            }}
                        />
                        <span className="mt-2 text-[8px] font-medium text-[#7187a0] sm:text-xs">
                            {point.label}
                        </span>
                    </div>
                ))}
            </div>
            {!hasData && <ChartEmptyState />}
        </div>
    );
}

function ChartEmptyState() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl bg-white/90 px-4 py-3 text-center shadow-sm">
                <p className="text-sm font-medium text-[#172a45]">
                    No messaging activity yet
                </p>
                <p className="mt-1 text-xs text-[#7187a0]">
                    Your first send will start this chart.
                </p>
            </div>
        </div>
    );
}

function NetworkUsage({
    networks,
}: {
    networks: DashboardProps['analytics']['networks'];
}) {
    const colors = ['bg-[#00bf83]', 'bg-sky-500', 'bg-violet-400'];
    const total = networks.reduce(
        (sum, network) => sum + network.recipients,
        0,
    );

    return (
        <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
            <PanelHeading
                eyebrow="Current month"
                title="Telecom usage"
                icon={RadioTower}
            />
            {total === 0 ? (
                <CompactEmpty
                    title="No network usage yet"
                    text="Recipient network estimates will appear after messages are accepted."
                />
            ) : (
                <div className="mt-6 space-y-5">
                    {networks.map((network, index) => (
                        <div key={network.name}>
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium text-[#172a45]">
                                    {network.name}
                                </span>
                                <span className="text-[#5d7696]">
                                    {network.recipients} recipients ·{' '}
                                    {network.units} units
                                </span>
                            </div>
                            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={`h-full rounded-full ${colors[index]}`}
                                    style={{ width: `${network.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    <p className="text-xs leading-5 text-[#7187a0]">
                        Network is estimated from the number prefix and may
                        differ for ported numbers.
                    </p>
                </div>
            )}
        </article>
    );
}

function SpendingInsight({
    spending,
    rate,
    balance,
}: {
    spending: DashboardProps['analytics']['spending'];
    rate: number;
    balance: number | null;
}) {
    const remainingPercentage =
        balance !== null && balance + spending.estimated_cost > 0
            ? (balance / (balance + spending.estimated_cost)) * 100
            : 0;

    return (
        <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
            <PanelHeading
                eyebrow="Current month"
                title="Wallet usage estimate"
                icon={Coins}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <InsightStat
                    label="SMS units used"
                    value={spending.units.toLocaleString()}
                />
                <InsightStat
                    label="Estimated spend"
                    value={formatMoney(spending.estimated_cost)}
                />
                <InsightStat label="Rate applied" value={formatMoney(rate)} />
            </div>
            <div className="mt-5">
                <div className="flex justify-between text-xs text-[#7187a0]">
                    <span>Estimated wallet position</span>
                    <span>{remainingPercentage.toFixed(0)}% remaining</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-linear-to-r from-sky-500 to-emerald-400"
                        style={{
                            width: `${Math.min(100, Math.max(0, remainingPercentage))}%`,
                        }}
                    />
                </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#7187a0]">
                Estimate uses accepted recipients × SMS parts × UGX{' '}
                {rate.toLocaleString()}. EgoSMS remains the source of truth for
                the wallet balance.
            </p>
        </article>
    );
}

function UpcomingMessages({
    messages,
}: {
    messages: DashboardProps['analytics']['upcoming'];
}) {
    return (
        <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
            <PanelHeading
                eyebrow="Message queue"
                title="Upcoming scheduled messages"
                icon={CalendarClock}
            />
            {messages.length === 0 ? (
                <CompactEmpty
                    title="No scheduled messages"
                    text="Messages scheduled for later will appear here."
                />
            ) : (
                <div className="mt-5 divide-y divide-slate-100">
                    {messages.map((message) => (
                        <Link
                            key={message.id}
                            href="/messages/scheduled"
                            className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-[#172a45]">
                                    {message.body}
                                </p>
                                <p className="mt-1 text-xs text-[#7187a0]">
                                    {message.recipient_count} recipients ·{' '}
                                    {message.estimated_units} SMS units
                                </p>
                            </div>
                            <p className="text-xs font-medium text-violet-600 sm:text-right">
                                {formatDate(message.scheduled_at)}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
            <Link
                href="/messages/single-bulk"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#4774a4]"
            >
                Schedule a message
                <ChevronRight className="size-4" />
            </Link>
        </article>
    );
}

function ContactHealth({
    health,
    contacts,
}: {
    health: DashboardProps['analytics']['contact_health'];
    contacts: number;
}) {
    return (
        <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
            <PanelHeading
                eyebrow="Contact insights"
                title="Keep your audience ready"
                icon={UserRoundX}
            />
            <div className="mt-5 space-y-3">
                <HealthRow
                    label="Active contacts"
                    value={contacts}
                    tone="bg-emerald-50 text-emerald-700"
                />
                <HealthRow
                    label="Missing a name"
                    value={health.missing_name}
                    tone="bg-amber-50 text-amber-700"
                />
                <HealthRow
                    label="Not assigned to a group"
                    value={health.without_group}
                    tone="bg-sky-50 text-sky-700"
                />
            </div>
            <Link
                href="/contacts"
                className="mt-5 flex items-center justify-between rounded-xl bg-[#172a45] px-4 py-3 text-sm font-semibold text-white"
            >
                <span>Review contacts</span>
                <ChevronRight className="size-4" />
            </Link>
        </article>
    );
}

function RecentActivity({ messages }: { messages: RecentMessage[] }) {
    return (
        <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
            <PanelHeading
                eyebrow="Recent activity"
                title="Communication timeline"
                icon={MessageSquareText}
            />
            {messages.length === 0 ? (
                <CompactEmpty
                    title="No messages yet"
                    text="Your sends and scheduled reminders will appear here."
                />
            ) : (
                <div className="mt-5 divide-y divide-slate-100">
                    {messages.map((message) => (
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
                                        {statusLabel(message.status)}
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-sm font-medium text-[#172a45]">
                                    {message.body}
                                </p>
                                <p className="mt-1 text-xs text-[#7187a0]">
                                    {message.recipient_count} recipients ·{' '}
                                    {message.estimated_units} SMS units
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
    );
}

function ProviderCard({ sms }: { sms: DashboardProps['sms'] }) {
    return (
        <aside
            className={`rounded-3xl border p-5 sm:p-6 ${sms.configured ? 'border-emerald-100 bg-emerald-50/70' : 'border-amber-100 bg-amber-50/70'}`}
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
                {sms.configured ? 'EgoSMS connected' : 'Set up SMS sending'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5d7696]">
                {sms.configured
                    ? `Requested sender: ${sms.sender_id ?? 'Not set'}. Delivery callbacks and scheduled sending are active.`
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
                    href="/contacts/import"
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#4774a4]"
                >
                    <span>Import contacts</span>
                    <UsersRound className="size-4" />
                </Link>
            </div>
        </aside>
    );
}

function PanelHeading({
    eyebrow,
    title,
    icon: Icon,
}: {
    eyebrow: string;
    title: string;
    icon: typeof CalendarClock;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div>
                <p className="text-xs font-semibold tracking-wide text-[#00a879] uppercase">
                    {eyebrow}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#172a45]">
                    {title}
                </h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Icon className="size-5" />
            </div>
        </div>
    );
}

function InsightStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-[#7187a0]">{label}</p>
            <p className="mt-2 font-semibold text-[#172a45]">{value}</p>
        </div>
    );
}

function HealthRow({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5">
            <span className="text-sm text-[#5d7696]">{label}</span>
            <span
                className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${tone}`}
            >
                {value.toLocaleString()}
            </span>
        </div>
    );
}

function CompactEmpty({ title, text }: { title: string; text: string }) {
    return (
        <div className="mt-5 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/55 px-5 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white text-[#00bf83] shadow-sm">
                <WalletCards className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-[#172a45]">{title}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-[#7187a0]">
                {text}
            </p>
        </div>
    );
}

function barHeight(value: number, maximum: number, pixels?: number): string {
    if (value === 0) {
        return '0';
    }

    const percentage = Math.max((value / maximum) * 100, 5);

    return pixels === undefined
        ? `${percentage}%`
        : `${Math.max((value / maximum) * pixels, 8)}px`;
}

function statusLabel(status: string): string {
    return status === 'submitted'
        ? 'Accepted by EgoSMS'
        : status.replaceAll('_', ' ');
}

function statusColor(status: string): string {
    if (
        status === 'failed' ||
        status === 'partially_failed' ||
        status === 'delivery_failed'
    ) {
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

function formatMoney(value: number): string {
    return `UGX ${Math.round(value).toLocaleString()}`;
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
