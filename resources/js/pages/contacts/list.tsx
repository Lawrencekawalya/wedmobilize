import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ContactRound,
    LoaderCircle,
    Pencil,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { EmptyState } from '@/components/app/empty-state';
import { FormField } from '@/components/app/form-field';
import { PageHeader } from '@/components/app/page-header';
import { SurfaceCard } from '@/components/app/surface-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Group = { id: number; name: string };

type Contact = {
    id: number;
    name: string | null;
    phone: string;
    email: string | null;
    status: string;
    groups: Group[];
};

type ContactForm = {
    name: string;
    phone: string;
    email: string;
    group_ids: number[];
};

type PaginatedContacts = {
    data: Contact[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function ContactList({
    contacts,
    groups,
    filters,
}: {
    contacts: PaginatedContacts;
    groups: Group[];
    filters: { search: string };
}) {
    const [search, setSearch] = useState(filters.search);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [deletingContact, setDeletingContact] = useState<Contact | null>(
        null,
    );
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const editContact = useForm<ContactForm>({
        name: '',
        phone: '',
        email: '',
        group_ids: [],
    });

    const openContactEditor = (contact: Contact) => {
        editContact.clearErrors();
        editContact.setData({
            name: contact.name ?? '',
            phone: contact.phone,
            email: contact.email ?? '',
            group_ids: contact.groups.map((group) => group.id),
        });
        setEditingContact(contact);
    };

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = search.trim();

        router.get('/contacts/all', query === '' ? {} : { search: query }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="All contacts" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <PageHeader
                    eyebrow="Audience management"
                    title="All contacts"
                    description="Search and manage your complete saved audience, 60 contacts at a time."
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 w-full rounded-xl border-sky-100 bg-white text-[#172a45] sm:w-auto"
                        >
                            <Link href="/contacts">
                                <ArrowLeft className="size-4" />
                                Back to contact management
                            </Link>
                        </Button>
                    }
                />

                <SurfaceCard
                    title="Contact directory"
                    description={
                        filters.search
                            ? `Results matching “${filters.search}”.`
                            : 'Every contact saved in your account.'
                    }
                    action={
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#177b63]">
                            {contacts.total.toLocaleString()} total
                        </span>
                    }
                    contentClassName="p-0"
                >
                    <form
                        onSubmit={submitSearch}
                        className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:px-6"
                    >
                        <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-sky-100 bg-slate-50/60 px-3 transition focus-within:border-[#00bf83] focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
                            <Search className="size-4 shrink-0 text-[#8498ad]" />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by name, phone, email, or group"
                                className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#172a45] outline-none placeholder:text-[#9baec2]"
                            />
                        </label>
                        <Button className="h-11 rounded-xl bg-[#172a45] px-5">
                            Search
                        </Button>
                        {filters.search && (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 rounded-xl"
                                onClick={() => {
                                    setSearch('');
                                    router.get(
                                        '/contacts/all',
                                        {},
                                        {
                                            preserveState: true,
                                            replace: true,
                                        },
                                    );
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </form>

                    {contacts.data.length === 0 ? (
                        <EmptyState
                            icon={filters.search ? Search : ContactRound}
                            title={
                                filters.search
                                    ? 'No matching contacts'
                                    : 'No contacts yet'
                            }
                            description={
                                filters.search
                                    ? 'Try another name, phone number, email address, or group.'
                                    : 'Return to contact management to add or import your first contacts.'
                            }
                        />
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/70 text-xs font-semibold tracking-wide text-[#7187a0] uppercase">
                                        <tr>
                                            <th className="px-6 py-3.5">
                                                Contact
                                            </th>
                                            <th className="px-4 py-3.5">
                                                Phone
                                            </th>
                                            <th className="px-4 py-3.5">
                                                Groups
                                            </th>
                                            <th className="px-6 py-3.5 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contacts.data.map((contact) => (
                                            <ContactTableRow
                                                key={contact.id}
                                                contact={contact}
                                                onEdit={() =>
                                                    openContactEditor(contact)
                                                }
                                                onDelete={() =>
                                                    setDeletingContact(contact)
                                                }
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="divide-y divide-slate-100 md:hidden">
                                {contacts.data.map((contact) => (
                                    <ContactMobileCard
                                        key={contact.id}
                                        contact={contact}
                                        onEdit={() =>
                                            openContactEditor(contact)
                                        }
                                        onDelete={() =>
                                            setDeletingContact(contact)
                                        }
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {contacts.total > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm text-[#7187a0] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p>
                                Showing {contacts.from}–{contacts.to} of{' '}
                                {contacts.total.toLocaleString()} contacts
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    asChild={contacts.prev_page_url !== null}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={contacts.prev_page_url === null}
                                    className="rounded-xl"
                                >
                                    {contacts.prev_page_url ? (
                                        <Link href={contacts.prev_page_url}>
                                            <ChevronLeft className="size-4" />
                                            Previous
                                        </Link>
                                    ) : (
                                        <>
                                            <ChevronLeft className="size-4" />
                                            Previous
                                        </>
                                    )}
                                </Button>
                                <span className="px-2 text-xs font-medium text-[#466582]">
                                    Page {contacts.current_page} of{' '}
                                    {contacts.last_page}
                                </span>
                                <Button
                                    asChild={contacts.next_page_url !== null}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={contacts.next_page_url === null}
                                    className="rounded-xl"
                                >
                                    {contacts.next_page_url ? (
                                        <Link href={contacts.next_page_url}>
                                            Next
                                            <ChevronRight className="size-4" />
                                        </Link>
                                    ) : (
                                        <>
                                            Next
                                            <ChevronRight className="size-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </SurfaceCard>
            </div>

            <Dialog
                open={editingContact !== null}
                onOpenChange={(open) => !open && setEditingContact(null)}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-slate-100 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-[#172a45]">
                            Edit contact
                        </DialogTitle>
                        <DialogDescription className="text-[#7187a0]">
                            Update contact details and group membership.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (!editingContact) {
                                return;
                            }

                            editContact.put(`/contacts/${editingContact.id}`, {
                                preserveScroll: true,
                                onSuccess: () => setEditingContact(null),
                            });
                        }}
                        className="grid gap-5"
                    >
                        <ContactFields form={editContact} groups={groups} />
                        <DialogFooter className="border-t border-slate-100 pt-5">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setEditingContact(null)}
                                disabled={editContact.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="rounded-xl bg-[#172a45]"
                                disabled={editContact.processing}
                            >
                                {editContact.processing && (
                                    <LoaderCircle className="size-4 animate-spin" />
                                )}
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deletingContact !== null}
                onOpenChange={(open) => !open && setDeletingContact(null)}
                title="Delete this contact?"
                description={`${deletingContact?.name || deletingContact?.phone || 'This contact'} will be removed from your contacts and groups. This action cannot be undone.`}
                processing={deleteProcessing}
                onConfirm={() => {
                    if (!deletingContact) {
                        return;
                    }

                    router.delete(`/contacts/${deletingContact.id}`, {
                        preserveScroll: true,
                        onStart: () => setDeleteProcessing(true),
                        onFinish: () => setDeleteProcessing(false),
                        onSuccess: () => setDeletingContact(null),
                    });
                }}
            />
        </>
    );
}

function ContactFields({
    form,
    groups,
}: {
    form: ReturnType<typeof useForm<ContactForm>>;
    groups: Group[];
}) {
    return (
        <>
            <FormField
                label="Name"
                htmlFor="list-contact-name"
                error={form.errors.name}
            >
                <Input
                    id="list-contact-name"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    placeholder="Sarah Namusoke"
                    className="h-11 rounded-xl border-sky-100"
                />
            </FormField>
            <FormField
                label="Phone number"
                htmlFor="list-contact-phone"
                hint="International format"
                error={form.errors.phone}
                required
            >
                <Input
                    id="list-contact-phone"
                    inputMode="tel"
                    value={form.data.phone}
                    onChange={(event) =>
                        form.setData('phone', event.target.value)
                    }
                    className="h-11 rounded-xl border-sky-100"
                    required
                />
            </FormField>
            <FormField
                label="Email"
                htmlFor="list-contact-email"
                hint="Optional"
                error={form.errors.email}
            >
                <Input
                    id="list-contact-email"
                    type="email"
                    value={form.data.email}
                    onChange={(event) =>
                        form.setData('email', event.target.value)
                    }
                    className="h-11 rounded-xl border-sky-100"
                />
            </FormField>
            {groups.length > 0 && (
                <fieldset className="rounded-2xl border border-sky-100 p-4">
                    <legend className="px-1 text-sm font-medium text-[#172a45]">
                        Contact groups
                    </legend>
                    <div className="mt-1 grid gap-3 sm:grid-cols-2">
                        {groups.map((group) => (
                            <label
                                key={group.id}
                                className="flex cursor-pointer items-center gap-3 text-sm text-[#466582]"
                            >
                                <Checkbox
                                    checked={form.data.group_ids.includes(
                                        group.id,
                                    )}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            'group_ids',
                                            checked
                                                ? [
                                                      ...form.data.group_ids,
                                                      group.id,
                                                  ]
                                                : form.data.group_ids.filter(
                                                      (id) => id !== group.id,
                                                  ),
                                        )
                                    }
                                    className="data-[state=checked]:border-[#00bf83] data-[state=checked]:bg-[#00bf83]"
                                />
                                <span className="truncate">{group.name}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            )}
        </>
    );
}

function ContactTableRow({
    contact,
    onEdit,
    onDelete,
}: {
    contact: Contact;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <tr className="border-b border-slate-100 last:border-0 hover:bg-sky-50/30">
            <td className="px-6 py-4">
                <ContactIdentity contact={contact} />
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-[#5d7696]">
                {contact.phone}
            </td>
            <td className="px-4 py-4">
                <GroupBadges groups={contact.groups} />
            </td>
            <td className="px-6 py-4">
                <div className="flex justify-end gap-1">
                    <IconButton label="Edit contact" onClick={onEdit}>
                        <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                        label="Delete contact"
                        destructive
                        onClick={onDelete}
                    >
                        <Trash2 className="size-4" />
                    </IconButton>
                </div>
            </td>
        </tr>
    );
}

function ContactMobileCard({
    contact,
    onEdit,
    onDelete,
}: {
    contact: Contact;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <article className="p-5">
            <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <ContactIdentity contact={contact} />
                    <p className="mt-2 pl-12 text-sm text-[#5d7696]">
                        {contact.phone}
                    </p>
                </div>
                <div className="flex gap-1">
                    <IconButton label="Edit contact" onClick={onEdit}>
                        <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                        label="Delete contact"
                        destructive
                        onClick={onDelete}
                    >
                        <Trash2 className="size-4" />
                    </IconButton>
                </div>
            </div>
            {contact.groups.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                    <GroupBadges groups={contact.groups} />
                </div>
            )}
        </article>
    );
}

function ContactIdentity({ contact }: { contact: Contact }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-semibold text-[#00a973]">
                {(contact.name || contact.phone).charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
                <span className="block truncate font-medium text-[#172a45]">
                    {contact.name || 'Unnamed contact'}
                </span>
                <span className="block truncate text-xs text-[#7187a0]">
                    {contact.email || 'No email address'}
                </span>
            </span>
        </div>
    );
}

function GroupBadges({ groups }: { groups: Group[] }) {
    if (groups.length === 0) {
        return <span className="text-xs text-[#9baec2]">No group</span>;
    }

    return (
        <span className="flex flex-wrap gap-1.5">
            {groups.map((group) => (
                <span
                    key={group.id}
                    className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-[#466582]"
                >
                    {group.name}
                </span>
            ))}
        </span>
    );
}

function IconButton({
    label,
    destructive = false,
    onClick,
    children,
}: {
    label: string;
    destructive?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            className={`flex size-9 items-center justify-center rounded-xl transition ${destructive ? 'text-red-600 hover:bg-red-50' : 'text-[#466582] hover:bg-sky-50 hover:text-[#172a45]'}`}
        >
            {children}
        </button>
    );
}

ContactList.layout = {
    breadcrumbs: [
        { title: 'Contacts', href: '/contacts' },
        { title: 'All contacts', href: '/contacts/all' },
    ],
};
