import { Head, router, useForm } from '@inertiajs/react';
import { ContactRound, FolderPlus, Pencil, Trash2, Upload } from 'lucide-react';

type Group = { id: number; name: string; contacts_count: number };
type Contact = {
    id: number;
    name: string | null;
    phone: string;
    email: string | null;
    status: string;
    groups: Group[];
};

export default function Contacts({
    contacts,
    groups,
}: {
    contacts: Contact[];
    groups: Group[];
}) {
    const contact = useForm({
        name: '',
        phone: '',
        email: '',
        group_ids: [] as number[],
    });
    const group = useForm({ name: '', description: '' });
    const editGroup = (item: Group) => {
        const name = window.prompt('Group name', item.name);

        if (name?.trim()) {
            router.put(`/contacts/groups/${item.id}`, { name: name.trim() });
        }
    };

    return (
        <>
            <Head title="Contacts" />
            <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
                <p className="text-sm font-medium text-[#00a973]">
                    Audience management
                </p>
                <h1 className="mt-1 text-3xl font-semibold text-[#172a45]">
                    Contacts
                </h1>
                <p className="mt-2 text-[#5d7696]">
                    Keep your guests organized in one clean, reusable list.
                </p>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[#172a45]">
                                All contacts
                            </h2>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-[#177b63]">
                                {contacts.length} total
                            </span>
                        </div>
                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-[#7187a0]">
                                    <tr>
                                        <th className="pb-3">Contact</th>
                                        <th className="pb-3">Phone</th>
                                        <th className="pb-3">Groups</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-50"
                                        >
                                            <td className="py-4 font-medium text-[#172a45]">
                                                {item.name || 'Unnamed contact'}
                                                <span className="block font-normal text-[#7187a0]">
                                                    {item.email}
                                                </span>
                                            </td>
                                            <td className="py-4 text-[#5d7696]">
                                                {item.phone}
                                            </td>
                                            <td className="py-4 text-[#5d7696]">
                                                {item.groups
                                                    .map((g) => g.name)
                                                    .join(', ') || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {contacts.length === 0 && (
                                <div className="py-12 text-center text-[#7187a0]">
                                    <ContactRound className="mx-auto mb-3 size-8 text-[#00bf83]" />
                                    No contacts yet. Add one or import a list to
                                    get started.
                                </div>
                            )}
                        </div>
                    </section>
                    <aside className="space-y-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                contact.post('/contacts');
                            }}
                            className="rounded-3xl bg-white p-6 shadow-sm"
                        >
                            <h2 className="font-semibold text-[#172a45]">
                                Add contact
                            </h2>
                            <div className="mt-4 grid gap-3">
                                <input
                                    placeholder="Name"
                                    value={contact.data.name}
                                    onChange={(e) =>
                                        contact.setData('name', e.target.value)
                                    }
                                    className="rounded-xl border p-3"
                                />
                                <input
                                    required
                                    placeholder="Phone number"
                                    value={contact.data.phone}
                                    onChange={(e) =>
                                        contact.setData('phone', e.target.value)
                                    }
                                    className="rounded-xl border p-3"
                                />
                                <input
                                    placeholder="Email (optional)"
                                    value={contact.data.email}
                                    onChange={(e) =>
                                        contact.setData('email', e.target.value)
                                    }
                                    className="rounded-xl border p-3"
                                />
                                {groups.length > 0 && (
                                    <fieldset className="rounded-xl border border-sky-100 p-3">
                                        <legend className="px-1 text-xs font-medium text-[#5d7696]">
                                            Add to groups
                                        </legend>
                                        <div className="mt-1 grid gap-2">
                                            {groups.map((item) => (
                                                <label
                                                    key={item.id}
                                                    className="flex items-center gap-2 text-sm text-[#466582]"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={contact.data.group_ids.includes(
                                                            item.id,
                                                        )}
                                                        onChange={(event) =>
                                                            contact.setData(
                                                                'group_ids',
                                                                event.target
                                                                    .checked
                                                                    ? [
                                                                          ...contact
                                                                              .data
                                                                              .group_ids,
                                                                          item.id,
                                                                      ]
                                                                    : contact.data.group_ids.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
                                                                              id !==
                                                                              item.id,
                                                                      ),
                                                            )
                                                        }
                                                        className="size-4 accent-[#00bf83]"
                                                    />
                                                    {item.name}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                )}
                                <button className="rounded-xl bg-[#172a45] p-3 font-semibold text-white">
                                    Save contact
                                </button>
                            </div>
                        </form>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                group.post('/contacts/groups');
                            }}
                            className="rounded-3xl bg-sky-50 p-6"
                        >
                            <h2 className="flex items-center gap-2 font-semibold text-[#172a45]">
                                <FolderPlus className="size-4" />
                                Create group
                            </h2>
                            <input
                                required
                                placeholder="e.g. Bride's family"
                                value={group.data.name}
                                onChange={(e) =>
                                    group.setData('name', e.target.value)
                                }
                                className="mt-4 w-full rounded-xl border bg-white p-3"
                            />
                            <button className="mt-3 w-full rounded-xl bg-[#00bf83] p-3 font-semibold text-white">
                                Create group
                            </button>
                            <div className="mt-5 space-y-2 text-sm text-[#5d7696]">
                                {groups.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2"
                                    >
                                        <span>
                                            {item.name}{' '}
                                            <span className="text-xs">
                                                ({item.contacts_count})
                                            </span>
                                        </span>
                                        <span className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => editGroup(item)}
                                                className="p-1 text-sky-700"
                                            >
                                                <Pencil className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            `Delete ${item.name}? Contacts will remain.`,
                                                        )
                                                    ) {
                                                        router.delete(
                                                            `/contacts/groups/${item.id}`,
                                                        );
                                                    }
                                                }}
                                                className="p-1 text-red-600"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </form>
                        <div className="rounded-3xl border border-dashed border-sky-200 p-6 text-sm text-[#5d7696]">
                            <Upload className="mb-3 size-5 text-[#00bf83]" />
                            <strong className="block text-[#172a45]">
                                Import contacts
                            </strong>
                            <p className="mt-1">
                                CSV/XLSX mapping and preview is the next import
                                step.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

Contacts.layout = { breadcrumbs: [{ title: 'Contacts', href: '/contacts' }] };
