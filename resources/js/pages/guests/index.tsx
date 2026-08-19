import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

type Guest = {
    id: number;
    name: string;
    phone_number: string | null;
    email: string | null;
    category: string;
    invitation_status: string;
    attendance_status: string;
};
type Props = {
    wedding: { id: number; name: string };
    guests: {
        data: Guest[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string };
};
const initial = {
    name: '',
    phone_number: '',
    email: '',
    category: 'other',
    invitation_status: 'not_invited',
    attendance_status: 'unknown',
    notes: '',
};
export default function Guests({ wedding, guests, filters }: Props) {
    const form = useForm(initial);
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/weddings/${wedding.id}/guests`, {
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title="Guests" />
            <main className="min-h-full bg-sky-50/50 p-4 sm:p-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-emerald-600">
                                {wedding.name}
                            </p>
                            <h1 className="text-3xl font-semibold">Guests</h1>
                            <p className="text-muted-foreground">
                                Your people, beautifully organized.
                            </p>
                        </div>
                        <Link href={`/weddings/${wedding.id}/dashboard`}>
                            <Button variant="outline" className="rounded-xl">
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                    <Card className="rounded-3xl border-white">
                        <CardContent className="pt-6">
                            <form
                                onSubmit={submit}
                                className="grid gap-3 md:grid-cols-4"
                            >
                                <Input
                                    placeholder="Guest name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="Phone number"
                                    value={form.data.phone_number}
                                    onChange={(e) =>
                                        form.setData(
                                            'phone_number',
                                            e.target.value,
                                        )
                                    }
                                />
                                <select
                                    className="rounded-md border bg-background px-3 text-sm"
                                    value={form.data.category}
                                    onChange={(e) =>
                                        form.setData('category', e.target.value)
                                    }
                                >
                                    {[
                                        'family',
                                        'friend',
                                        'committee',
                                        'workmate',
                                        'vip',
                                        'other',
                                    ].map((x) => (
                                        <option key={x}>{x}</option>
                                    ))}
                                </select>
                                <Button
                                    disabled={form.processing}
                                    className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                                >
                                    <Plus />
                                    Add guest
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="flex gap-3">
                        <Input
                            defaultValue={filters.search}
                            placeholder="Search by name or phone…"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    router.get(
                                        `/weddings/${wedding.id}/guests`,
                                        { search: e.currentTarget.value },
                                        { preserveState: true },
                                    );
                                }
                            }}
                        />
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.get(`/weddings/${wedding.id}/guests`)
                            }
                        >
                            Clear
                        </Button>
                    </div>
                    <Card className="overflow-hidden rounded-3xl border-white">
                        <CardContent className="p-0">
                            {guests.data.length ? (
                                <div className="divide-y">
                                    {guests.data.map((guest) => (
                                        <div
                                            key={guest.id}
                                            className="flex flex-wrap items-center justify-between gap-3 p-5"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {guest.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {guest.phone_number ||
                                                        guest.email ||
                                                        'No contact recorded'}{' '}
                                                    · {guest.category}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
                                                    {guest.attendance_status}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Delete ${guest.name}`}
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `Remove ${guest.name}?`,
                                                            )
                                                        ) {
                                                            router.delete(
                                                                `/weddings/${wedding.id}/guests/${guest.id}`,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="font-medium">
                                        Your guest list is ready for its first
                                        name.
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Add a guest above to start organizing
                                        your invitation list.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
Guests.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
