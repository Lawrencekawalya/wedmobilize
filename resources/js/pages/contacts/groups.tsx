import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    FolderPlus,
    LoaderCircle,
    Pencil,
    Search,
    Trash2,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { EmptyState } from '@/components/app/empty-state';
import { FormField } from '@/components/app/form-field';
import { PageHeader } from '@/components/app/page-header';
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
import { Input } from '@/components/ui/input';

type Group = {
    id: number;
    name: string;
    description: string | null;
    contacts_count: number;
};

type PaginatedGroups = {
    data: Group[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function ContactGroups({
    groups,
    filters,
}: {
    groups: PaginatedGroups;
    filters: { search: string };
}) {
    const [search, setSearch] = useState(filters.search);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const editGroup = useForm({ name: '', description: '' });

    const openGroupEditor = (group: Group) => {
        editGroup.clearErrors();
        editGroup.setData({
            name: group.name,
            description: group.description ?? '',
        });
        setEditingGroup(group);
    };

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = search.trim();

        router.get('/contacts/groups', query === '' ? {} : { search: query }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Contact groups" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <PageHeader
                    eyebrow="Audience management"
                    title="Contact groups"
                    description="Search and manage every reusable audience, 60 groups at a time."
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
                    title="Group directory"
                    description={
                        filters.search
                            ? `Results matching “${filters.search}”.`
                            : 'Groups with the largest audiences appear first.'
                    }
                    action={
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#177b63]">
                            {groups.total.toLocaleString()} total
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
                                placeholder="Search by group name or description"
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
                                        '/contacts/groups',
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

                    {groups.data.length === 0 ? (
                        <EmptyState
                            icon={filters.search ? Search : FolderPlus}
                            title={
                                filters.search
                                    ? 'No matching groups'
                                    : 'No contact groups yet'
                            }
                            description={
                                filters.search
                                    ? 'Try another group name or description.'
                                    : 'Return to contact management to create your first group.'
                            }
                        />
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/70 text-xs font-semibold tracking-wide text-[#7187a0] uppercase">
                                        <tr>
                                            <th className="px-6 py-3.5">
                                                Group
                                            </th>
                                            <th className="px-4 py-3.5">
                                                Description
                                            </th>
                                            <th className="px-4 py-3.5">
                                                Contacts
                                            </th>
                                            <th className="px-6 py-3.5 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groups.data.map((group) => (
                                            <GroupTableRow
                                                key={group.id}
                                                group={group}
                                                onEdit={() =>
                                                    openGroupEditor(group)
                                                }
                                                onDelete={() =>
                                                    setDeletingGroup(group)
                                                }
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="divide-y divide-slate-100 md:hidden">
                                {groups.data.map((group) => (
                                    <GroupMobileCard
                                        key={group.id}
                                        group={group}
                                        onEdit={() => openGroupEditor(group)}
                                        onDelete={() => setDeletingGroup(group)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {groups.total > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm text-[#7187a0] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p>
                                Showing {groups.from}–{groups.to} of{' '}
                                {groups.total.toLocaleString()} groups
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    asChild={groups.prev_page_url !== null}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={groups.prev_page_url === null}
                                    className="rounded-xl"
                                >
                                    {groups.prev_page_url ? (
                                        <Link href={groups.prev_page_url}>
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
                                    Page {groups.current_page} of{' '}
                                    {groups.last_page}
                                </span>
                                <Button
                                    asChild={groups.next_page_url !== null}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={groups.next_page_url === null}
                                    className="rounded-xl"
                                >
                                    {groups.next_page_url ? (
                                        <Link href={groups.next_page_url}>
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
                open={editingGroup !== null}
                onOpenChange={(open) => !open && setEditingGroup(null)}
            >
                <DialogContent className="rounded-3xl border-slate-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-[#172a45]">
                            Edit group
                        </DialogTitle>
                        <DialogDescription className="text-[#7187a0]">
                            Update this audience without affecting its contacts.
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
                            htmlFor="directory-group-name"
                            error={editGroup.errors.name}
                            required
                        >
                            <Input
                                id="directory-group-name"
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
                        <FormField
                            label="Description"
                            htmlFor="directory-group-description"
                            error={editGroup.errors.description}
                        >
                            <Input
                                id="directory-group-description"
                                value={editGroup.data.description}
                                onChange={(event) =>
                                    editGroup.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                placeholder="Optional description"
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
                open={deletingGroup !== null}
                onOpenChange={(open) => !open && setDeletingGroup(null)}
                title="Delete this group?"
                description={`${deletingGroup?.name || 'This group'} will be removed, but its contacts will remain safely in your contact list.`}
                processing={deleteProcessing}
                onConfirm={() => {
                    if (!deletingGroup) {
                        return;
                    }

                    router.delete(`/contacts/groups/${deletingGroup.id}`, {
                        preserveScroll: true,
                        onStart: () => setDeleteProcessing(true),
                        onFinish: () => setDeleteProcessing(false),
                        onSuccess: () => setDeletingGroup(null),
                    });
                }}
            />
        </>
    );
}

function GroupTableRow({
    group,
    onEdit,
    onDelete,
}: {
    group: Group;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <tr className="border-b border-slate-100 last:border-0 hover:bg-sky-50/30">
            <td className="px-6 py-4">
                <GroupIdentity group={group} />
            </td>
            <td className="max-w-sm px-4 py-4 text-[#5d7696]">
                <span className="line-clamp-2">
                    {group.description || 'No description'}
                </span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-[#5d7696]">
                {group.contacts_count.toLocaleString()}
            </td>
            <td className="px-6 py-4">
                <div className="flex justify-end gap-1">
                    <IconButton label="Edit group" onClick={onEdit}>
                        <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                        label="Delete group"
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

function GroupMobileCard({
    group,
    onEdit,
    onDelete,
}: {
    group: Group;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <article className="p-5">
            <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <GroupIdentity group={group} />
                    <p className="mt-3 text-sm leading-5 text-[#7187a0]">
                        {group.description || 'No description'}
                    </p>
                </div>
                <div className="flex gap-1">
                    <IconButton label="Edit group" onClick={onEdit}>
                        <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                        label="Delete group"
                        destructive
                        onClick={onDelete}
                    >
                        <Trash2 className="size-4" />
                    </IconButton>
                </div>
            </div>
        </article>
    );
}

function GroupIdentity({ group }: { group: Group }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#466582]">
                <UsersRound className="size-4" />
            </span>
            <span className="min-w-0">
                <span className="block truncate font-medium text-[#172a45]">
                    {group.name}
                </span>
                <span className="block text-xs text-[#7187a0]">
                    {group.contacts_count.toLocaleString()}{' '}
                    {group.contacts_count === 1 ? 'contact' : 'contacts'}
                </span>
            </span>
        </div>
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

ContactGroups.layout = {
    breadcrumbs: [
        { title: 'Contacts', href: '/contacts' },
        { title: 'Contact groups', href: '/contacts/groups' },
    ],
};
