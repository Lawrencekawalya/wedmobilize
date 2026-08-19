import { Head, Link, useForm } from '@inertiajs/react';
import { FileSpreadsheet, Upload } from 'lucide-react';

export default function ContactImport() {
    const form = useForm<{ file: File | null }>({ file: null });

    return (
        <>
            <Head title="Import contacts" />
            <div className="mx-auto max-w-3xl p-6">
                <Link href="/contacts" className="text-sm text-[#177b63]">
                    ← Back to contacts
                </Link>
                <h1 className="mt-4 text-3xl font-semibold text-[#172a45]">
                    Import contacts
                </h1>
                <p className="mt-2 text-[#5d7696]">
                    Upload a CSV or Excel file. Nothing is saved until you
                    review the preview.
                </p>
                <section className="mt-5 overflow-hidden rounded-2xl border border-sky-100 bg-sky-50/50">
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
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/contacts/import/preview');
                    }}
                    className="mt-8 rounded-3xl bg-white p-7 shadow-sm"
                >
                    <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-sky-200 p-10 text-center">
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
                        <p className="mt-3 text-sm text-[#177b63]">
                            Selected: {form.data.file.name}
                        </p>
                    )}
                    {form.errors.file && (
                        <p className="mt-3 text-sm text-red-600">
                            {form.errors.file}
                        </p>
                    )}
                    <button
                        disabled={!form.data.file || form.processing}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#172a45] px-5 py-3 font-semibold text-white disabled:opacity-50"
                    >
                        <Upload className="size-4" />
                        Preview import
                    </button>
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
