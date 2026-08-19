import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

type Props = {
    wedding: { id: number };
    meeting: {
        title: string;
        meeting_date: string;
        start_time: string;
        venue: string | null;
        agenda: string | null;
        notes: string | null;
        status: string;
    };
};
export default function MeetingShow({ wedding, meeting }: Props) {
    return (
        <>
            <Head title={meeting.title} />
            <main className="min-h-full bg-sky-50/50 p-4 sm:p-8">
                <Card className="mx-auto max-w-3xl rounded-3xl border-white">
                    <CardContent className="space-y-6 pt-6">
                        <Link href={`/weddings/${wedding.id}/meetings`}>
                            <Button variant="ghost">← Meetings</Button>
                        </Link>
                        <div>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                                {meeting.status}
                            </span>
                            <h1 className="mt-4 text-3xl font-semibold">
                                {meeting.title}
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {new Date(
                                    meeting.meeting_date,
                                ).toLocaleDateString()}{' '}
                                · {meeting.start_time.slice(0, 5)}{' '}
                                {meeting.venue && `· ${meeting.venue}`}
                            </p>
                        </div>
                        {[
                            ['Agenda', meeting.agenda],
                            ['Notes', meeting.notes],
                        ].map(([title, value]) => (
                            <section key={title}>
                                <h2 className="font-semibold">{title}</h2>
                                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                                    {value || 'Nothing recorded yet.'}
                                </p>
                            </section>
                        ))}
                        <Link href={`/weddings/${wedding.id}/messages`}>
                            <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
                                Send invitation or reminder
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
MeetingShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
