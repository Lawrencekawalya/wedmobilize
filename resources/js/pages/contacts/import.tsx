import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileSpreadsheet, LoaderCircle, Upload } from 'lucide-react';
import { PageHeader } from '@/components/app/page-header';
import { SurfaceCard } from '@/components/app/surface-card';
import { Button } from '@/components/ui/button';

export default function ContactImport() {
    const form = useForm<{ file: File | null }>({ file: null });

    return (
        <>
            <Head title="Import contacts" />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <PageHeader
                    eyebrow="Audience management"
                    title="Import contacts"
                    description="Upload a CSV or Excel file. Nothing is saved until you review and confirm the preview."
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 rounded-xl"
                        >
                            <Link href="/contacts">
                                <ArrowLeft className="size-4" />
                                Back to contacts
                            </Link>
                        </Button>
                    }
                />
                <SurfaceCard
                    title="Prepare your spreadsheet"
                    description="Use these exact column names so we can map your contacts correctly."
                    contentClassName="p-0"
                >
                    <section className="overflow-hidden">
                        <div className="border-b border-sky-100 px-4 py-3">
                            <p className="text-sm font-semibold text-[#172a45]">
                                Format your spreadsheet like this
                            </p>
                            <p className="mt-1 text-xs text-[#5d7696]">
                                <code className="font-medium">phone</code> is
                                required. Use the international format without
                                spaces, for example 256777071434.
                            </p>
                        </div>
                        <div className="overflow-x-auto bg-white">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-sky-50 text-[#466582]">
                                    <tr>
                                        <th className="px-4 py-2.5 font-semibold">
                                            name
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold">
                                            phone *
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold">
                                            email
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-[#5d7696]">
                                    <tr className="border-t border-slate-100">
                                        <td className="px-4 py-2.5">
                                            Sarah Namusoke
                                        </td>
                                        <td className="px-4 py-2.5">
                                            256777071434
                                        </td>
                                        <td className="px-4 py-2.5">
                                            sarah@example.com
                                        </td>
                                    </tr>
                                    <tr className="border-t border-slate-100">
                                        <td className="px-4 py-2.5">
                                            Peter Okello
                                        </td>
                                        <td className="px-4 py-2.5">
                                            256700111222
                                        </td>
                                        <td className="px-4 py-2.5">
                                            peter@example.com
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </SurfaceCard>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/contacts/import/preview');
                    }}
                    className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-7"
                >
                    <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-sky-200 px-5 py-10 text-center transition hover:border-[#00bf83] hover:bg-emerald-50/30 sm:p-10">
                        <FileSpreadsheet className="size-10 text-[#00bf83]" />
                        <span className="mt-3 font-medium text-[#172a45]">
                            Choose CSV or XLSX file
                        </span>
                        <span className="mt-1 text-sm text-[#7187a0]">
                            Columns: phone (required), name, email
                        </span>
                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            className="sr-only"
                            onChange={(e) =>
                                form.setData(
                                    'file',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                    </label>
                    {form.data.file && (
                        <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-[#177b63]">
                            <FileSpreadsheet className="size-4 shrink-0" />
                            <span className="min-w-0 truncate font-medium">
                                {form.data.file.name}
                            </span>
                        </div>
                    )}
                    {form.errors.file && (
                        <p className="mt-3 text-sm text-red-600">
                            {form.errors.file}
                        </p>
                    )}
                    <Button
                        disabled={!form.data.file || form.processing}
                        className="mt-6 h-11 w-full rounded-xl bg-[#172a45] sm:w-auto"
                    >
                        {form.processing ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Upload className="size-4" />
                        )}
                        {form.processing
                            ? 'Reading spreadsheet…'
                            : 'Preview import'}
                    </Button>
                </form>
            </div>
        </>
    );
}
ContactImport.layout = {
    breadcrumbs: [
        { title: 'Contacts', href: '/contacts' },
        { title: 'Import', href: '/contacts/import' },
    ],
};
