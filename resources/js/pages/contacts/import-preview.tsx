import { Head, Link, useForm } from '@inertiajs/react';

type Row = {
    row: number;
    name: string | null;
    email: string | null;
    phone: string;
    status: 'new' | 'update' | 'invalid' | 'duplicate';
};
export default function ImportPreview({
    rows,
    groups,
}: {
    rows: Row[];
    groups: { id: number; name: string }[];
}) {
    const form = useForm({ group_id: '' });
    const counts = rows.reduce<Record<string, number>>(
        (all, row) => ({ ...all, [row.status]: (all[row.status] ?? 0) + 1 }),
        {},
    );

    return (
        <>
            <Head title="Review contact import" />
            <div className="mx-auto max-w-5xl p-6">
                <Link
                    href="/contacts/import"
                    className="text-sm text-[#177b63]"
                >
                    ← Choose another file
                </Link>
                <h1 className="mt-4 text-3xl font-semibold text-[#172a45]">
                    Review import
                </h1>
                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    {['new', 'update', 'invalid', 'duplicate'].map((status) => (
                        <span
                            key={status}
                            className="rounded-full bg-sky-50 px-3 py-1 text-[#466582]"
                        >
                            {counts[status] ?? 0} {status}
                        </span>
                    ))}
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/contacts/import/confirm');
                    }}
                    className="mt-6 rounded-3xl bg-white p-6 shadow-sm"
                >
                    <label className="text-sm font-medium text-[#172a45]">
                        Add imported contacts to a group{' '}
                        <select
                            value={form.data.group_id}
                            onChange={(e) =>
                                form.setData('group_id', e.target.value)
                            }
                            className="ml-3 rounded-lg border p-2"
                        >
                            <option value="">No group</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th>Row</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr
                                        key={row.row}
                                        className="border-b border-slate-50"
                                    >
                                        <td className="py-3">{row.row}</td>
                                        <td>{row.name || '—'}</td>
                                        <td>{row.phone || '—'}</td>
                                        <td className="capitalize">
                                            {row.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="mt-6 rounded-xl bg-[#00bf83] px-5 py-3 font-semibold text-white">
                        Confirm import
                    </button>
                </form>
            </div>
        </>
    );
}
ImportPreview.layout = {
    breadcrumbs: [
        { title: 'Contacts', href: '/contacts' },
        { title: 'Import review', href: '/contacts/import' },
    ],
};
