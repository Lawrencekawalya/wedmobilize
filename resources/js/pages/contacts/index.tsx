import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ContactRound,
    FolderPlus,
    LoaderCircle,
    Pencil,
    Search,
    Trash2,
    Upload,
    UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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

type Group = {
    id: number;
    name: string;
    description?: string | null;
    contacts_count: number;
};

type Contact = {
    id: number;
    name: string | null;
    phone: string;
    email: string | null;
    status: string;
    groups: Pick<Group, 'id' | 'name'>[];
};

type ContactForm = {
    name: string;
    phone: string;
    email: string;
    group_ids: number[];
};

export default function Contacts({
    contacts,
    groups,
}: {
    contacts: Contact[];
    groups: Group[];
}) {
    const [search, setSearch] = useState('');
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [deletingContact, setDeletingContact] = useState<Contact | null>(
        null,
    );
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
    const [contactDeleteProcessing, setContactDeleteProcessing] =
        useState(false);
    const [groupDeleteProcessing, setGroupDeleteProcessing] = useState(false);

    const contact = useForm<ContactForm>({
        name: '',
        phone: '',
        email: '',
        group_ids: [],
    });
    const editContact = useForm<ContactForm>({
        name: '',
        phone: '',
        email: '',
        group_ids: [],
    });
    const group = useForm({ name: '', description: '' });
    const editGroup = useForm({ name: '', description: '' });

    const filteredContacts = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return contacts;
        }

        return contacts.filter((item) =>
            `${item.name ?? ''} ${item.phone} ${item.email ?? ''} ${item.groups.map((itemGroup) => itemGroup.name).join(' ')}`
                .toLowerCase()
                .includes(query),
        );
    }, [contacts, search]);

    const openContactEditor = (item: Contact) => {
        editContact.clearErrors();
        editContact.setData({
            name: item.name ?? '',
            phone: item.phone,
            email: item.email ?? '',
            group_ids: item.groups.map((itemGroup) => itemGroup.id),
        });
        setEditingContact(item);
    };
    const openGroupEditor = (item: Group) => {
        editGroup.clearErrors();
        editGroup.setData({
            name: item.name,
            description: item.description ?? '',
        });
        setEditingGroup(item);
    };

    return (
        <>
            <Head title="Contacts" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <PageHeader
                    eyebrow="Audience management"
                    title="Contacts"
                    description="Keep every guest organized, grouped, and ready for your next message."
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 w-full rounded-xl border-sky-100 bg-white text-[#172a45] sm:w-auto"
                        >
                            <Link href="/contacts/import">
                                <Upload className="size-4 text-[#00a973]" />
                                Import contacts
                            </Link>
                        </Button>
                    }
                />

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <SurfaceCard
                        title="All contacts"
                        description="Search, update, and organize your saved audience."
                        action={
                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#177b63]">
                                {contacts.length} total
                            </span>
                        }
                        contentClassName="p-0"
                    >
                        {contacts.length > 0 && (
                            <div className="border-b border-slate-100 p-4 sm:px-6">
                                <label className="flex items-center gap-3 rounded-xl border border-sky-100 bg-slate-50/60 px-3 transition focus-within:border-[#00bf83] focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
                                    <Search className="size-4 shrink-0 text-[#8498ad]" />
                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search by name, phone, email, or group"
                                        className="h-11 w-full bg-transparent text-sm text-[#172a45] outline-none placeholder:text-[#9baec2]"
                                    />
                                </label>
                            </div>
                        )}

                        {contacts.length === 0 ? (
                            <EmptyState
                                icon={ContactRound}
                                title="No contacts yet"
                                description="Add your first contact here or import an existing spreadsheet."
                            />
                        ) : filteredContacts.length === 0 ? (
                            <EmptyState
                                icon={Search}
                                title="No matching contacts"
                                description={`Nothing matches “${search}”. Try a name, phone number, email, or group.`}
                                action={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => setSearch('')}
                                    >
                                        Clear search
                                    </Button>
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
                                            {filteredContacts.map((item) => (
                                                <ContactTableRow
                                                    key={item.id}
                                                    contact={item}
                                                    onEdit={() =>
                                                        openContactEditor(item)
                                                    }
                                                    onDelete={() =>
                                                        setDeletingContact(item)
                                                    }
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="divide-y divide-slate-100 md:hidden">
                                    {filteredContacts.map((item) => (
                                        <ContactMobileCard
                                            key={item.id}
                                            contact={item}
                                            onEdit={() =>
                                                openContactEditor(item)
                                            }
                                            onDelete={() =>
                                                setDeletingContact(item)
                                            }
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </SurfaceCard>

                    <aside className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                        <SurfaceCard
                            title="Add contact"
                            description="Save one person and optionally assign groups."
                        >
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    contact.post('/contacts', {
                                        preserveScroll: true,
                                        onSuccess: () => contact.reset(),
                                    });
                                }}
                                className="grid gap-4"
                            >
                                <ContactFields
                                    form={contact}
                                    groups={groups}
                                    prefix="new-contact"
                                />
                                <Button
                                    disabled={contact.processing}
                                    className="h-11 rounded-xl bg-[#172a45]"
                                >
                                    {contact.processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}
                                    Save contact
                                </Button>
                            </form>
                        </SurfaceCard>

                        <SurfaceCard
                            title={
                                <span className="flex items-center gap-2">
                                    <FolderPlus className="size-4 text-[#00a973]" />
                                    Contact groups
                                </span>
                            }
                            description="Create reusable audiences for bulk messaging."
                        >
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    group.post('/contacts/groups', {
                                        preserveScroll: true,
                                        onSuccess: () => group.reset(),
                                    });
                                }}
                                className="grid gap-3"
                            >
                                <FormField
                                    label="Group name"
                                    htmlFor="group-name"
                                    error={group.errors.name}
                                    required
                                >
                                    <Input
                                        id="group-name"
                                        value={group.data.name}
                                        onChange={(event) =>
                                            group.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="e.g. Bride's family"
                                        className="h-11 rounded-xl border-sky-100"
                                    />
                                </FormField>
                                <Button
                                    disabled={group.processing}
                                    className="h-11 rounded-xl bg-[#00bf83] hover:bg-[#00aa75]"
                                >
                                    {group.processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}
                                    Create group
                                </Button>
                            </form>

                            <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                                {groups.length === 0 ? (
                                    <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-[#7187a0]">
                                        Your groups will appear here.
                                    </p>
                                ) : (
                                    groups.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
                                        >
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-[#466582]">
                                                <UsersRound className="size-4" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-[#172a45]">
                                                    {item.name}
                                                </span>
                                                <span className="text-xs text-[#7187a0]">
                                                    {item.contacts_count}{' '}
                                                    {item.contacts_count === 1
                                                        ? 'contact'
                                                        : 'contacts'}
                                                </span>
                                            </span>
                                            <IconButton
                                                label={`Edit ${item.name}`}
                                                onClick={() =>
                                                    openGroupEditor(item)
                                                }
                                            >
                                                <Pencil className="size-3.5" />
                                            </IconButton>
                                            <IconButton
                                                label={`Delete ${item.name}`}
                                                destructive
                                                onClick={() =>
                                                    setDeletingGroup(item)
                                                }
                                            >
                                                <Trash2 className="size-3.5" />
                                            </IconButton>
                                        </div>
                                    ))
                                )}
                            </div>
                        </SurfaceCard>

                        <Link
                            href="/contacts/import"
                            className="group rounded-3xl border border-dashed border-sky-200 bg-sky-50/40 p-5 transition hover:border-[#00bf83] hover:bg-emerald-50/40 sm:col-span-2 lg:col-span-1"
                        >
                            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-[#00a973] shadow-sm">
                                <Upload className="size-4" />
                            </span>
                            <strong className="mt-4 block text-sm text-[#172a45]">
                                Import a contact list
                            </strong>
                            <p className="mt-1 text-sm leading-5 text-[#7187a0]">
                                Upload CSV or Excel, review every row, then
                                save.
                            </p>
                        </Link>
                    </aside>
                </div>
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
                            Update contact details and group membership
                            together.
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
                        <ContactFields
                            form={editContact}
                            groups={groups}
                            prefix="edit-contact"
                        />
                        <DialogFooter className="mt-2 border-t border-slate-100 pt-5">
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

            <Dialog
                open={editingGroup !== null}
                onOpenChange={(open) => !open && setEditingGroup(null)}
            >
                <DialogContent className="rounded-3xl border-slate-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-[#172a45]">
                            Edit group
                        </DialogTitle>
                        <DialogDescription className="text-[#7187a0]">
                            Rename this audience without affecting its contacts.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (!editingGroup) {
                                return;
                            }

                            editGroup.put(
                                `/contacts/groups/${editingGroup.id}`,
                                {
                                    preserveScroll: true,
                                    onSuccess: () => setEditingGroup(null),
                                },
                            );
                        }}
                        className="grid gap-5"
                    >
                        <FormField
                            label="Group name"
                            htmlFor="edit-group-name"
                            error={editGroup.errors.name}
                            required
                        >
                            <Input
                                id="edit-group-name"
                                value={editGroup.data.name}
                                onChange={(event) =>
                                    editGroup.setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
                                className="h-11 rounded-xl border-sky-100"
                            />
                        </FormField>
                        <DialogFooter className="border-t border-slate-100 pt-5">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setEditingGroup(null)}
                                disabled={editGroup.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="rounded-xl bg-[#172a45]"
                                disabled={editGroup.processing}
                            >
                                {editGroup.processing && (
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
                processing={contactDeleteProcessing}
                onConfirm={() => {
                    if (!deletingContact) {
                        return;
                    }

                    router.delete(`/contacts/${deletingContact.id}`, {
                        preserveScroll: true,
                        onStart: () => setContactDeleteProcessing(true),
                        onFinish: () => setContactDeleteProcessing(false),
                        onSuccess: () => setDeletingContact(null),
                    });
                }}
            />
            <ConfirmDialog
                open={deletingGroup !== null}
                onOpenChange={(open) => !open && setDeletingGroup(null)}
                title="Delete this group?"
                description={`${deletingGroup?.name || 'This group'} will be removed, but its contacts will remain safely in your contact list.`}
                processing={groupDeleteProcessing}
                onConfirm={() => {
                    if (!deletingGroup) {
                        return;
                    }

                    router.delete(`/contacts/groups/${deletingGroup.id}`, {
                        preserveScroll: true,
                        onStart: () => setGroupDeleteProcessing(true),
                        onFinish: () => setGroupDeleteProcessing(false),
                        onSuccess: () => setDeletingGroup(null),
                    });
                }}
            />
        </>
    );
}

function ContactFields({
    form,
    groups,
    prefix,
}: {
    form: ReturnType<typeof useForm<ContactForm>>;
    groups: Group[];
    prefix: string;
}) {
    return (
        <>
            <FormField
                label="Name"
                htmlFor={`${prefix}-name`}
                error={form.errors.name}
            >
                <Input
                    id={`${prefix}-name`}
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
                htmlFor={`${prefix}-phone`}
                hint="International format"
                error={form.errors.phone}
                required
            >
                <Input
                    id={`${prefix}-phone`}
                    inputMode="tel"
                    value={form.data.phone}
                    onChange={(event) =>
                        form.setData('phone', event.target.value)
                    }
                    placeholder="256777071434"
                    className="h-11 rounded-xl border-sky-100"
                    required
                />
            </FormField>
            <FormField
                label="Email"
                htmlFor={`${prefix}-email`}
                hint="Optional"
                error={form.errors.email}
            >
                <Input
                    id={`${prefix}-email`}
                    type="email"
                    value={form.data.email}
                    onChange={(event) =>
                        form.setData('email', event.target.value)
                    }
                    placeholder="sarah@example.com"
                    className="h-11 rounded-xl border-sky-100"
                />
            </FormField>
            {groups.length > 0 && (
                <fieldset className="rounded-2xl border border-sky-100 p-4">
                    <legend className="px-1 text-sm font-medium text-[#172a45]">
                        Contact groups
                    </legend>
                    <div className="mt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        {groups.map((item) => (
                            <label
                                key={item.id}
                                className="flex cursor-pointer items-center gap-3 text-sm text-[#466582]"
                            >
                                <Checkbox
                                    checked={form.data.group_ids.includes(
                                        item.id,
                                    )}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            'group_ids',
                                            checked
                                                ? [
                                                      ...form.data.group_ids,
                                                      item.id,
                                                  ]
                                                : form.data.group_ids.filter(
                                                      (id) => id !== item.id,
                                                  ),
                                        )
                                    }
                                    className="data-[state=checked]:border-[#00bf83] data-[state=checked]:bg-[#00bf83]"
                                />
                                <span className="truncate">{item.name}</span>
                            </label>
                        ))}
                    </div>
                    {form.errors.group_ids && (
                        <p className="mt-2 text-sm text-red-600">
                            {form.errors.group_ids}
                        </p>
                    )}
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

function ContactIdentity({ contact }: { contact: Contact }) {
    return (
        <div className="flex items-center gap-3">
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

function GroupBadges({ groups }: { groups: Pick<Group, 'id' | 'name'>[] }) {
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

Contacts.layout = { breadcrumbs: [{ title: 'Contacts', href: '/contacts' }] };
