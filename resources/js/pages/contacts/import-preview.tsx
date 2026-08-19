import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, LoaderCircle } from 'lucide-react';
import { PageHeader } from '@/components/app/page-header';
import { SurfaceCard } from '@/components/app/surface-card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <PageHeader
                    eyebrow="Final check"
                    title="Review import"
                    description="Check what will be created, updated, or skipped before saving anything."
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 rounded-xl"
                        >
                            <Link href="/contacts/import">
                                <ArrowLeft className="size-4" />
                                Choose another file
                            </Link>
                        </Button>
                    }
                />
                <div className="flex flex-wrap gap-2 text-sm">
                    {['new', 'update', 'invalid', 'duplicate'].map((status) => (
                        <span
                            key={status}
                            className={`rounded-full px-3 py-1.5 font-medium ${status === 'new' ? 'bg-emerald-50 text-[#177b63]' : status === 'update' ? 'bg-sky-50 text-[#466582]' : 'bg-amber-50 text-amber-700'}`}
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
                    className="contents"
                >
                    <SurfaceCard
                        title="Import destination"
                        description="Optionally assign all valid contacts to one existing group."
                    >
                        <label className="grid max-w-md gap-2 text-sm font-medium text-[#172a45]">
                            Add valid contacts to
                            <Select
                                value={form.data.group_id || 'none'}
                                onValueChange={(value) =>
                                    form.setData(
                                        'group_id',
                                        value === 'none' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger className="h-11 w-full rounded-xl border-sky-100">
                                    <SelectValue placeholder="No group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        No group
                                    </SelectItem>
                                    {groups.map((group) => (
                                        <SelectItem
                                            key={group.id}
                                            value={String(group.id)}
                                        >
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>
                    </SurfaceCard>
                    <SurfaceCard
                        title="Spreadsheet rows"
                        description={`${rows.length} rows detected. Invalid and duplicate rows will be skipped.`}
                        contentClassName="p-0"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/70 text-xs font-semibold tracking-wide text-[#7187a0] uppercase">
                                    <tr>
                                        <th className="px-5 py-3.5">Row</th>
                                        <th className="px-4 py-3.5">Name</th>
                                        <th className="px-4 py-3.5">Phone</th>
                                        <th className="px-5 py-3.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr
                                            key={row.row}
                                            className="border-b border-slate-50"
                                        >
                                            <td className="px-5 py-3 text-[#7187a0]">
                                                {row.row}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-[#172a45]">
                                                {row.name || 'Unnamed contact'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-[#5d7696]">
                                                {row.phone || '—'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${row.status === 'new' ? 'bg-emerald-50 text-[#177b63]' : row.status === 'update' ? 'bg-sky-50 text-[#466582]' : 'bg-amber-50 text-amber-700'}`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SurfaceCard>
                    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm leading-5 text-[#177b63]">
                            Only valid new and existing contacts will be saved.
                        </p>
                        <Button
                            disabled={form.processing}
                            className="h-11 rounded-xl bg-[#00bf83] px-5 hover:bg-[#00aa75]"
                        >
                            {form.processing ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="size-4" />
                            )}
                            {form.processing
                                ? 'Importing contacts…'
                                : 'Confirm import'}
                        </Button>
                    </div>
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
