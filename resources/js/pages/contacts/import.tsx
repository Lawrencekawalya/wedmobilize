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
