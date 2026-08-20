import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
    CalendarClock,
    CheckCircle2,
    ContactRound,
    FileText,
    ClipboardPaste,
    Upload,
    Inbox,
    MailPlus,
    MessageCircleMore,
    Send,
    Sparkles,
    UserRound,
    UsersRound,
    XCircle,
} from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { RecipientPicker } from '@/components/app/recipient-picker';
import type {
    RecipientContact,
    RecipientGroup,
    RecipientSelection,
} from '@/components/app/recipient-picker';
import { SurfaceCard } from '@/components/app/surface-card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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

type MessageCenterProps = {
    section?: string;
    contacts?: RecipientContact[];
    groups?: RecipientGroup[];
    messages?: OutboundMessage[];
    smsConfigured?: boolean;
    smsBalance?: number | null;
    smsLocalRate?: number;
    smsEstimatedRemaining?: number | null;
    senderId?: string | null;
    templates?: MessageTemplate[];
    campaigns?: MessageCampaign[];
};

type MessageTemplate = { id: number; name: string; body: string };
type MessageCampaign = { id: number; name: string; contact_ids: number[] };

type OutboundMessage = {
    id: number;
    body: string;
    recipient_mode: string;
    sender_id: string;
    status:
        | 'processing'
        | 'scheduled'
        | 'submitted'
        | 'partially_failed'
        | 'failed';
    recipient_count: number;
    submitted_count: number;
    failed_count: number;
    sent_count: number;
    delivered_count: number;
    delivery_failed_count: number;
    cost: number | null;
    error_message: string | null;
    submitted_at: string | null;
    scheduled_at: string | null;
    created_at: string;
};

type RecipientMode =
    'all' | 'groups' | 'contacts' | 'paste' | 'file' | 'campaign';

export default function MessageCenter({
    section = 'single-bulk',
    contacts = [],
    groups = [],
    messages = [],
    smsConfigured = false,
    smsBalance = null,
    smsLocalRate = 0,
    smsEstimatedRemaining = null,
    senderId = null,
    templates = [],
    campaigns = [],
}: MessageCenterProps) {
    const active = sections.find((item) => item.key === section) ?? sections[0];
    const isComposer = active.key === 'single-bulk';
    const pageContent = !isComposer
        ? content[active.key as keyof typeof content]
        : null;

    return (
        <>
            <Head title={`${active.label} | Message Center`} />
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <PageHeader
                    eyebrow="Event communication"
                    title="Message Center"
                    description="Create, schedule, and track every message that keeps your guests informed."
                />

                <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                    <nav
                        className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm shadow-slate-200/70 lg:block lg:rounded-3xl"
                        aria-label="Message Center sections"
                    >
                        {sections.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.key === active.key;

                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-3 ${isActive ? 'bg-[#00bf83] text-white shadow-lg shadow-emerald-500/20' : 'text-[#466582] hover:bg-sky-50 hover:text-[#172a45]'}`}
                                >
                                    <Icon className="size-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {isComposer ? (
                        <Composer
                            contacts={contacts}
                            groups={groups}
                            smsConfigured={smsConfigured}
                            smsBalance={smsBalance}
                            smsLocalRate={smsLocalRate}
                            smsEstimatedRemaining={smsEstimatedRemaining}
                            senderId={senderId}
                            templates={templates}
                            campaigns={campaigns}
                        />
                    ) : active.key === 'outbox' ||
                      active.key === 'scheduled' ? (
                        <Outbox
                            messages={messages}
                            scheduled={active.key === 'scheduled'}
                        />
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

function Composer({
    contacts,
    groups,
    smsConfigured,
    smsBalance,
    smsLocalRate,
    smsEstimatedRemaining,
    senderId,
    templates,
    campaigns,
}: {
    contacts: RecipientContact[];
    groups: RecipientGroup[];
    smsConfigured: boolean;
    smsBalance: number | null;
    smsLocalRate: number;
    smsEstimatedRemaining: number | null;
    senderId: string | null;
    templates: MessageTemplate[];
    campaigns: MessageCampaign[];
}) {
    const [recipientMode, setRecipientMode] = useState<RecipientMode | null>(
        null,
    );
    const [recipients, setRecipients] = useState<RecipientSelection[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [templateOpen, setTemplateOpen] = useState(false);
    const templateForm = useForm({ name: '', body: '' });
    const form = useForm({
        recipient_mode: '' as RecipientMode | '',
        group_ids: [] as number[],
        contact_ids: [] as number[],
        message: '',
        raw_numbers: '',
        recipient_file: null as File | null,
        campaign_id: '',
        campaign_name: '',
        template_id: '',
        send_timing: 'now' as 'now' | 'later',
        scheduled_at: '',
    });
    const recipientCount = useMemo(() => {
        if (recipientMode === 'all') {
            return contacts.length;
        }

        if (recipientMode === 'paste') {
            return new Set(
                form.data.raw_numbers
                    .split(/[\s,;]+/)
                    .map((value) => value.replace(/\D/g, ''))
                    .filter(Boolean),
            ).size;
        }

        if (recipientMode === 'campaign') {
            return (
                campaigns.find(
                    (campaign) => String(campaign.id) === form.data.campaign_id,
                )?.contact_ids.length ?? 0
            );
        }

        const ids = new Set<number>();

        recipients.forEach((recipient) => {
            if (recipient.type === 'contact') {
                ids.add(recipient.id);
            } else {
                groups
                    .find((group) => group.id === recipient.id)
                    ?.contact_ids.forEach((id) => ids.add(id));
            }
        });

        return ids.size;
    }, [
        campaigns,
        contacts.length,
        form.data.campaign_id,
        form.data.raw_numbers,
        groups,
        recipientMode,
        recipients,
    ]);
    const unicode = /[^\x20-\x7E\n\r]/.test(form.data.message);
    const singleLimit = unicode ? 70 : 160;
    const multiLimit = unicode ? 67 : 153;
    const smsCount = Math.max(
        1,
        form.data.message.length <= singleLimit
            ? 1
            : Math.ceil(form.data.message.length / multiLimit),
    );
    const hasRecipients =
        recipientMode === 'file'
            ? form.data.recipient_file !== null
            : recipientCount > 0;
    const canSend =
        smsConfigured &&
        recipientMode !== null &&
        hasRecipients &&
        form.data.message.trim().length > 0 &&
        !form.processing;

    function submit() {
        if (recipientMode === null) {
            return;
        }

        form.transform((data) => ({
            ...data,
            recipient_mode: recipientMode,
            group_ids:
                recipientMode === 'groups'
                    ? recipients.map((recipient) => recipient.id)
                    : [],
            contact_ids:
                recipientMode === 'contacts'
                    ? recipients.map((recipient) => recipient.id)
                    : [],
        }));
        form.post('/messages/send', {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => setConfirmOpen(false),
        });
    }

    return (
        <SurfaceCard contentClassName="p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
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
            <form
                className="mt-8 grid gap-6"
                onSubmit={(event: FormEvent<HTMLFormElement>) =>
                    event.preventDefault()
                }
            >
                <div className="grid gap-4 rounded-2xl bg-sky-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <span className="text-xs text-[#7187a0]">
                            EgoSMS balance
                        </span>
                        <p className="font-semibold text-[#172a45]">
                            {smsBalance === null
                                ? 'Unavailable'
                                : `UGX ${smsBalance.toLocaleString()}`}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-[#7187a0]">
                            Estimated SMS remaining
                        </span>
                        <p className="font-semibold text-[#172a45]">
                            {smsEstimatedRemaining === null
                                ? 'Unavailable'
                                : smsEstimatedRemaining.toLocaleString()}
                        </p>
                        {smsLocalRate > 0 && (
                            <p className="text-xs text-[#7187a0]">
                                At UGX {smsLocalRate.toLocaleString()} per SMS
                                part.
                            </p>
                        )}
                    </div>
                    <div>
                        <span className="text-xs text-[#7187a0]">
                            Requested sender ID
                        </span>
                        <p className="font-semibold text-[#172a45]">
                            {senderId ?? 'Not configured'}
                        </p>
                        <p className="text-xs text-[#7187a0]">
                            EgoSMS may apply a network-approved default.
                        </p>
                    </div>
                </div>
                <div className="grid gap-2 text-sm font-medium text-[#172a45]">
                    <span>Recipients</span>
                    <Select
                        value={recipientMode ?? undefined}
                        onValueChange={(value) => {
                            setRecipientMode(value as RecipientMode);
                            setRecipients([]);
                            form.clearErrors();
                        }}
                    >
                        <SelectTrigger className="h-12 w-full rounded-xl border-sky-100 px-4 text-[#466582] focus:border-[#00bf83] focus:ring-2 focus:ring-emerald-100">
                            <SelectValue placeholder="Choose how you want to select recipients" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                            <SelectItem value="all" className="py-3">
                                <UsersRound className="size-4 text-[#00a973]" />
                                All contacts
                            </SelectItem>
                            <SelectItem value="groups" className="py-3">
                                <ContactRound className="size-4 text-[#00a973]" />
                                Contact groups
                            </SelectItem>
                            <SelectItem value="contacts" className="py-3">
                                <UserRound className="size-4 text-[#00a973]" />
                                Select contacts
                            </SelectItem>
                            <SelectItem value="paste" className="py-3">
                                <ClipboardPaste className="size-4 text-[#00a973]" />
                                Paste phone numbers
                            </SelectItem>
                            <SelectItem value="file" className="py-3">
                                <Upload className="size-4 text-[#00a973]" />
                                Upload CSV / Excel
                            </SelectItem>
                            <SelectItem value="campaign" className="py-3">
                                <Sparkles className="size-4 text-[#00a973]" />
                                Saved campaign
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {recipientMode === 'all' && (
                        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#00a973] shadow-sm">
                                <UsersRound className="size-5" />
                            </span>
                            <span>
                                <span className="block font-semibold text-[#172a45]">
                                    All active contacts selected
                                </span>
                                <span className="mt-0.5 block text-xs font-normal text-[#5d7696]">
                                    {contacts.length}{' '}
                                    {contacts.length === 1
                                        ? 'contact will'
                                        : 'contacts will'}{' '}
                                    receive this message.
                                </span>
                            </span>
                        </div>
                    )}

                    {recipientMode === 'groups' && groups.length > 0 && (
                        <RecipientPicker
                            mode="groups"
                            contacts={contacts}
                            groups={groups}
                            value={recipients}
                            onChange={setRecipients}
                        />
                    )}

                    {recipientMode === 'contacts' && contacts.length > 0 && (
                        <RecipientPicker
                            mode="contacts"
                            contacts={contacts}
                            groups={groups}
                            value={recipients}
                            onChange={setRecipients}
                        />
                    )}
                    {recipientMode === 'paste' && (
                        <textarea
                            rows={4}
                            value={form.data.raw_numbers}
                            onChange={(event) =>
                                form.setData('raw_numbers', event.target.value)
                            }
                            placeholder="Paste numbers separated by spaces, commas, or new lines"
                            className="rounded-xl border border-sky-100 p-3 font-normal outline-none focus:border-[#00bf83]"
                        />
                    )}
                    {recipientMode === 'file' && (
                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={(event) =>
                                form.setData(
                                    'recipient_file',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                            className="rounded-xl border border-dashed border-sky-200 p-4 font-normal"
                        />
                    )}
                    {recipientMode === 'campaign' && (
                        <Select
                            value={form.data.campaign_id}
                            onValueChange={(value) =>
                                form.setData('campaign_id', value)
                            }
                        >
                            <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue placeholder="Choose a saved campaign" />
                            </SelectTrigger>
                            <SelectContent>
                                {campaigns.map((campaign) => (
                                    <SelectItem
                                        key={campaign.id}
                                        value={String(campaign.id)}
                                    >
                                        {campaign.name} ·{' '}
                                        {campaign.contact_ids.length} contacts
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {((recipientMode === 'groups' && groups.length === 0) ||
                        (recipientMode === 'contacts' &&
                            contacts.length === 0)) && (
                        <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40">
                            <EmptyState
                                icon={
                                    recipientMode === 'groups'
                                        ? UsersRound
                                        : ContactRound
                                }
                                title={
                                    recipientMode === 'groups'
                                        ? 'No contact groups yet'
                                        : 'Your contact list is empty'
                                }
                                description={
                                    recipientMode === 'groups'
                                        ? 'Create a group and add contacts before selecting this option.'
                                        : 'Add or import contacts before preparing a message.'
                                }
                                action={
                                    <Button
                                        asChild
                                        className="rounded-xl bg-[#172a45]"
                                    >
                                        <Link href="/contacts">
                                            Go to contacts
                                        </Link>
                                    </Button>
                                }
                            />
                        </div>
                    )}

                    {recipientMode !== null &&
                        recipientMode !== 'all' &&
                        ((recipientMode === 'groups' && groups.length > 0) ||
                            (recipientMode === 'contacts' &&
                                contacts.length > 0)) && (
                            <span className="text-xs font-normal text-[#7187a0]">
                                {recipientCount > 0
                                    ? `${recipientCount} unique ${recipientCount === 1 ? 'contact' : 'contacts'} will receive this message.`
                                    : recipientMode === 'groups'
                                      ? 'Type a group name, then select one or more matching groups.'
                                      : 'Type a contact name or phone number, then select one or more matches.'}
                            </span>
                        )}
                    {(form.errors.recipient_mode ||
                        form.errors.group_ids ||
                        form.errors.contact_ids) && (
                        <span className="text-xs font-normal text-red-600">
                            {form.errors.recipient_mode ??
                                form.errors.group_ids ??
                                form.errors.contact_ids}
                        </span>
                    )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2 text-sm font-medium text-[#172a45]">
                        <div className="flex items-center justify-between">
                            <span>Message template</span>
                            <button
                                type="button"
                                onClick={() => {
                                    templateForm.setData({
                                        name: '',
                                        body: form.data.message,
                                    });
                                    setTemplateOpen(true);
                                }}
                                className="text-xs text-[#00a973]"
                            >
                                Save current
                            </button>
                        </div>
                        <Select
                            value={form.data.template_id}
                            onValueChange={(value) => {
                                form.setData('template_id', value);
                                const template = templates.find(
                                    (item) => String(item.id) === value,
                                );

                                if (template) {
                                    form.setData('message', template.body);
                                }
                            }}
                        >
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="No template selected" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((template) => (
                                    <SelectItem
                                        key={template.id}
                                        value={String(template.id)}
                                    >
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <label className="grid gap-2 text-sm font-medium text-[#172a45]">
                        <span>Save recipients as campaign (optional)</span>
                        <input
                            value={form.data.campaign_name}
                            onChange={(event) =>
                                form.setData(
                                    'campaign_name',
                                    event.target.value,
                                )
                            }
                            placeholder="e.g. Introduction committee"
                            className="h-11 rounded-xl border border-sky-100 px-3 outline-none"
                        />
                    </label>
                </div>
                <label className="grid gap-2 text-sm font-medium text-[#172a45]">
                    <span>Message</span>
                    <textarea
                        rows={6}
                        maxLength={640}
                        value={form.data.message}
                        onChange={(event) =>
                            form.setData('message', event.target.value)
                        }
                        placeholder="Write a clear update for your guests..."
                        className="resize-none rounded-xl border border-sky-100 p-3 text-sm outline-none placeholder:text-[#9baec2] focus:border-[#00bf83] focus:ring-2 focus:ring-emerald-100"
                    />
                    <span className="text-right text-xs font-normal text-[#7187a0]">
                        {form.data.message.length} / 640 characters · {smsCount}{' '}
                        {smsCount === 1 ? 'SMS' : 'SMS parts'}
                    </span>
                    <span
                        className={`text-xs font-normal ${unicode ? 'text-amber-600' : 'text-[#7187a0]'}`}
                    >
                        {unicode
                            ? 'Unicode detected: each SMS part has a lower character limit.'
                            : 'GSM-7 message encoding.'}{' '}
                        Estimated units:{' '}
                        {recipientMode === 'file'
                            ? 'calculated after upload'
                            : recipientCount * smsCount}
                        .
                    </span>
                    {form.errors.message && (
                        <span className="text-xs font-normal text-red-600">
                            {form.errors.message}
                        </span>
                    )}
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 text-sm text-[#172a45]">
                        <input
                            type="radio"
                            checked={form.data.send_timing === 'now'}
                            onChange={() => form.setData('send_timing', 'now')}
                        />
                        Send now
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#172a45]">
                        <input
                            type="radio"
                            checked={form.data.send_timing === 'later'}
                            onChange={() =>
                                form.setData('send_timing', 'later')
                            }
                        />
                        Send later
                    </label>
                    {form.data.send_timing === 'later' && (
                        <input
                            type="datetime-local"
                            value={form.data.scheduled_at}
                            onChange={(event) =>
                                form.setData('scheduled_at', event.target.value)
                            }
                            className="h-11 rounded-xl border border-sky-100 px-3 sm:col-span-2"
                        />
                    )}
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#7187a0]">
                        {smsConfigured
                            ? `${recipientCount} ${recipientCount === 1 ? 'recipient' : 'recipients'} selected. Delivery updates will appear in Outbox.`
                            : 'EgoSMS credentials and sender ID must be configured before sending.'}
                    </p>
                    <Button
                        type="button"
                        disabled={!canSend}
                        onClick={() => setConfirmOpen(true)}
                        className="h-11 rounded-xl bg-[#172a45] px-5"
                    >
                        <Send className="size-4" />
                        {form.processing ? 'Submitting…' : 'Send message'}
                    </Button>
                </div>
            </form>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm SMS submission</DialogTitle>
                        <DialogDescription>
                            Review the send before it reaches EgoSMS.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-[#466582]">
                        <p>
                            <strong className="text-[#172a45]">
                                Recipients:
                            </strong>{' '}
                            {recipientMode === 'file'
                                ? 'from uploaded file'
                                : recipientCount}
                        </p>
                        <p>
                            <strong className="text-[#172a45]">Sender:</strong>{' '}
                            {senderId}
                        </p>
                        <p>
                            <strong className="text-[#172a45]">Message:</strong>{' '}
                            {smsCount} part(s), {unicode ? 'Unicode' : 'GSM-7'}
                        </p>
                        <p>
                            <strong className="text-[#172a45]">Timing:</strong>{' '}
                            {form.data.send_timing === 'now'
                                ? 'Send now'
                                : form.data.scheduled_at}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={form.processing}
                            onClick={submit}
                            className="bg-[#172a45]"
                        >
                            {form.processing
                                ? 'Submitting…'
                                : 'Confirm and send'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
                <DialogContent className="rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Save message template</DialogTitle>
                        <DialogDescription>
                            Reuse this message in future sends.
                        </DialogDescription>
                    </DialogHeader>
                    <input
                        value={templateForm.data.name}
                        onChange={(event) =>
                            templateForm.setData('name', event.target.value)
                        }
                        placeholder="Template name"
                        className="h-11 rounded-xl border border-sky-100 px-3"
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setTemplateOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={
                                templateForm.processing ||
                                !templateForm.data.name ||
                                !templateForm.data.body
                            }
                            onClick={() =>
                                templateForm.post('/messages/templates', {
                                    preserveScroll: true,
                                    onSuccess: () => setTemplateOpen(false),
                                })
                            }
                            className="bg-[#172a45]"
                        >
                            Save template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SurfaceCard>
    );
}

function Outbox({
    messages,
    scheduled = false,
}: {
    messages: OutboundMessage[];
    scheduled?: boolean;
}) {
    if (messages.length === 0) {
        return (
            <section className="rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/70">
                <EmptyState
                    icon={Send}
                    title={
                        scheduled
                            ? 'No scheduled messages'
                            : 'No messages sent yet'
                    }
                    description={
                        scheduled
                            ? 'Messages planned for later will appear here.'
                            : 'Messages submitted to EgoSMS and their delivery progress will appear here.'
                    }
                    action={
                        <Button asChild className="rounded-xl bg-[#172a45]">
                            <Link href="/messages/single-bulk">
                                Create a message
                            </Link>
                        </Button>
                    }
                />
            </section>
        );
    }

    return (
        <SurfaceCard contentClassName="p-5 sm:p-7">
            <div className="border-b border-slate-100 pb-5">
                <p className="text-sm font-medium text-[#00a973]">
                    {scheduled ? 'Planned messages' : 'EgoSMS activity'}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#172a45]">
                    {scheduled ? 'Scheduled SMS' : 'Outbox'}
                </h2>
                <p className="mt-2 text-sm text-[#5d7696]">
                    {scheduled
                        ? 'Messages waiting for their scheduled send time.'
                        : 'Submitted messages and the latest delivery progress.'}
                </p>
            </div>
            <div className="divide-y divide-slate-100">
                {messages.map((message) => {
                    const failed = message.status === 'failed';
                    const partial = message.status === 'partially_failed';

                    return (
                        <article
                            key={message.id}
                            className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-start"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    {failed ? (
                                        <XCircle className="size-4 text-red-500" />
                                    ) : (
                                        <CheckCircle2
                                            className={`size-4 ${partial ? 'text-amber-500' : 'text-[#00a973]'}`}
                                        />
                                    )}
                                    <span className="text-sm font-semibold text-[#172a45] capitalize">
                                        {message.status === 'submitted'
                                            ? 'Submitted to EgoSMS'
                                            : message.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#466582]">
                                    {message.body}
                                </p>
                                {message.error_message && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {message.error_message}
                                    </p>
                                )}
                            </div>
                            <div className="text-left text-xs text-[#7187a0] sm:text-right">
                                <p>
                                    {message.submitted_count} accepted ·{' '}
                                    {message.failed_count} request failed
                                </p>
                                {(message.sent_count > 0 ||
                                    message.delivered_count > 0 ||
                                    message.delivery_failed_count > 0) && (
                                    <p className="mt-1">
                                        {message.sent_count} sent ·{' '}
                                        {message.delivered_count} delivered ·{' '}
                                        {message.delivery_failed_count} delivery
                                        failed
                                    </p>
                                )}
                                <p className="mt-1">
                                    {new Intl.DateTimeFormat(undefined, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    }).format(
                                        new Date(
                                            scheduled && message.scheduled_at
                                                ? message.scheduled_at
                                                : message.created_at,
                                        ),
                                    )}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </SurfaceCard>
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
