import { Head, Link } from '@inertiajs/react';
import { CalendarDays, MessageCircle, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

type Wedding = {
    id: number;
    name: string;
    bride_name: string;
    groom_name: string;
    wedding_date: string;
    contribution_target: number | null;
};
type Props = {
    wedding: Wedding;
    stats: {
        guests: number;
        contributionTarget: number;
        contributionsCollected: number;
        upcomingMeetings: number;
        smsSent: number;
    };
    daysUntilWedding: number;
    nextMeeting: {
        id: number;
        title: string;
        meeting_date: string;
        start_time: string;
        venue: string | null;
    } | null;
};
const ugx = (value: number) =>
    new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: 'UGX',
        maximumFractionDigits: 0,
    }).format(value);
export default function WeddingDashboard({
    wedding,
    stats,
    daysUntilWedding,
    nextMeeting,
}: Props) {
    const cards = [
        {
            title: 'Guests',
            value: stats.guests,
            icon: Users,
            tint: 'bg-sky-100 text-sky-700',
        },
        {
            title: 'Upcoming meetings',
            value: stats.upcomingMeetings,
            icon: CalendarDays,
            tint: 'bg-emerald-100 text-emerald-700',
        },
        {
            title: 'SMS activity',
            value: stats.smsSent,
            icon: MessageCircle,
            tint: 'bg-violet-100 text-violet-700',
        },
        {
            title: 'Contribution target',
            value: ugx(stats.contributionTarget),
            icon: Wallet,
            tint: 'bg-amber-100 text-amber-700',
        },
    ];

    return (
        <>
            <Head title={`${wedding.name} dashboard`} />
            <main className="min-h-full bg-[radial-gradient(circle_at_80%_0%,#d9f7ff,_transparent_32%),#f8fcff] p-4 sm:p-8">
                <section className="mx-auto max-w-6xl space-y-6">
                    <div className="rounded-[2rem] bg-slate-900 p-7 text-white shadow-lg shadow-sky-950/20">
                        <p className="text-sm text-sky-200">
                            {wedding.bride_name} &amp; {wedding.groom_name}
                        </p>
                        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight">
                                    {wedding.name}
                                </h1>
                                <p className="mt-2 text-slate-300">
                                    {new Date(
                                        wedding.wedding_date,
                                    ).toLocaleDateString('en-UG', {
                                        dateStyle: 'long',
                                    })}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-5 py-3 text-center">
                                <strong className="block text-3xl">
                                    {daysUntilWedding}
                                </strong>
                                <span className="text-xs text-sky-100">
                                    days to go
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {cards.map(({ title, value, icon: Icon, tint }) => (
                            <Card
                                key={title}
                                className="rounded-3xl border-white bg-white/90 shadow-sm"
                            >
                                <CardContent className="flex items-center justify-between pt-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {title}
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold">
                                            {value}
                                        </p>
                                    </div>
                                    <div className={`rounded-2xl p-3 ${tint}`}>
                                        <Icon className="size-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="rounded-3xl border-white">
                            <CardContent className="pt-6">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            Upcoming meeting
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Keep the committee in sync.
                                        </p>
                                    </div>
                                    <Link
                                        href={`/weddings/${wedding.id}/meetings`}
                                    >
                                        <Button
                                            variant="outline"
                                            className="rounded-xl"
                                        >
                                            View meetings
                                        </Button>
                                    </Link>
                                </div>
                                {nextMeeting ? (
                                    <div className="mt-6 rounded-2xl bg-sky-50 p-4">
                                        <p className="font-medium">
                                            {nextMeeting.title}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {new Date(
                                                nextMeeting.meeting_date,
                                            ).toLocaleDateString()}{' '}
                                            ·{' '}
                                            {nextMeeting.start_time.slice(0, 5)}{' '}
                                            {nextMeeting.venue &&
                                                `· ${nextMeeting.venue}`}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-muted-foreground">
                                        No planning meeting scheduled yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="rounded-3xl border-white">
                            <CardContent className="pt-6">
                                <p className="font-semibold">Quick actions</p>
                                <p className="text-sm text-muted-foreground">
                                    Grow your wedding workspace.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href={`/weddings/${wedding.id}/guests`}
                                    >
                                        <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
                                            Manage guests
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/weddings/${wedding.id}/messages`}
                                    >
                                        <Button
                                            variant="outline"
                                            className="rounded-xl"
                                        >
                                            Compose SMS
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
        </>
    );
}
WeddingDashboard.layout = (page: React.ReactNode) => (
    <AppLayout>{page}</AppLayout>
);
