import { Head, Link, router, useForm } from '@inertiajs/react';
import { CalendarPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

type Meeting = {
    id: number;
    title: string;
    meeting_date: string;
    start_time: string;
    venue: string | null;
    status: string;
};
type Props = {
    wedding: { id: number; name: string };
    meetings: { data: Meeting[] };
};
export default function Meetings({ wedding, meetings }: Props) {
    const form = useForm({
        title: '',
        meeting_date: '',
        start_time: '',
        venue: '',
        agenda: '',
        notes: '',
        status: 'upcoming',
    });

    return (
        <>
            <Head title="Planning meetings" />
            <main className="min-h-full bg-sky-50/50 p-4 sm:p-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div>
                        <p className="text-sm font-medium text-emerald-600">
                            {wedding.name}
                        </p>
                        <h1 className="text-3xl font-semibold">
                            Planning meetings
                        </h1>
                    </div>
                    <Card className="rounded-3xl border-white">
                        <CardContent className="pt-6">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.post(
                                        `/weddings/${wedding.id}/meetings`,
                                        { onSuccess: () => form.reset() },
                                    );
                                }}
                                className="grid gap-3 md:grid-cols-4"
                            >
                                <Input
                                    placeholder="Meeting title"
                                    value={form.data.title}
                                    onChange={(e) =>
                                        form.setData('title', e.target.value)
                                    }
                                />
                                <Input
                                    type="date"
                                    value={form.data.meeting_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'meeting_date',
                                            e.target.value,
                                        )
                                    }
                                />
                                <Input
                                    type="time"
                                    value={form.data.start_time}
                                    onChange={(e) =>
                                        form.setData(
                                            'start_time',
                                            e.target.value,
                                        )
                                    }
                                />
                                <Button
                                    className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                                    disabled={form.processing}
                                >
                                    <CalendarPlus />
                                    Schedule meeting
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="grid gap-4 md:grid-cols-2">
                        {meetings.data.length ? (
                            meetings.data.map((meeting) => (
                                <Card
                                    key={meeting.id}
                                    className="rounded-3xl border-white"
                                >
                                    <CardContent className="flex justify-between gap-3 pt-6">
                                        <Link
                                            href={`/weddings/${wedding.id}/meetings/${meeting.id}`}
                                        >
                                            <p className="font-semibold">
                                                {meeting.title}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {new Date(
                                                    meeting.meeting_date,
                                                ).toLocaleDateString()}{' '}
                                                ·{' '}
                                                {meeting.start_time.slice(0, 5)}{' '}
                                                {meeting.venue &&
                                                    `· ${meeting.venue}`}
                                            </p>
                                            <span className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                                                {meeting.status}
                                            </span>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        'Delete this meeting?',
                                                    )
                                                ) {
                                                    router.delete(
                                                        `/weddings/${wedding.id}/meetings/${meeting.id}`,
                                                    );
                                                }
                                            }}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="rounded-3xl border-white md:col-span-2">
                                <CardContent className="p-12 text-center text-muted-foreground">
                                    No meetings scheduled. Start with the next
                                    planning conversation.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
Meetings.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
