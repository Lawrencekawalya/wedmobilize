import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

type Guest = { id: number; name: string; phone_number: string };
type Props = {
    wedding: { id: number; name: string };
    guests: Guest[];
    messages: {
        data: {
            id: number;
            recipient_name: string | null;
            recipient_phone: string;
            message: string;
            status: string;
            created_at: string;
        }[];
    };
};
export default function Messages({ wedding, guests, messages }: Props) {
    const form = useForm({
        recipientIds: [] as string[],
        message: '',
        message_type: 'announcement',
    });
    const selected = guests.filter((guest) =>
        form.data.recipientIds.includes(String(guest.id)),
    );
    const send = () => {
        form.transform((data) => ({
            recipients: selected.map((guest) => ({
                phone_number: guest.phone_number,
                name: guest.name,
            })),
            message: data.message,
            message_type: data.message_type,
        }));
        form.post(`/weddings/${wedding.id}/messages`);
    };

    return (
        <>
            <Head title="Messages" />
            <main className="min-h-full bg-sky-50/50 p-4 sm:p-8">
                <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_.8fr]">
                    <Card className="rounded-3xl border-white">
                        <CardContent className="pt-6">
                            <p className="text-sm font-medium text-emerald-600">
                                {wedding.name}
                            </p>
                            <h1 className="text-3xl font-semibold">
                                Compose SMS
                            </h1>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    send();
                                }}
                                className="mt-6 space-y-4"
                            >
                                <div className="max-h-52 space-y-2 overflow-auto rounded-2xl bg-sky-50 p-3">
                                    {guests.length ? (
                                        guests.map((guest) => (
                                            <label
                                                key={guest.id}
                                                className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.recipientIds.includes(
                                                        String(guest.id),
                                                    )}
                                                    onChange={() =>
                                                        form.setData(
                                                            'recipientIds',
                                                            form.data.recipientIds.includes(
                                                                String(
                                                                    guest.id,
                                                                ),
                                                            )
                                                                ? form.data.recipientIds.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          String(
                                                                              guest.id,
                                                                          ),
                                                                  )
                                                                : [
                                                                      ...form
                                                                          .data
                                                                          .recipientIds,
                                                                      String(
                                                                          guest.id,
                                                                      ),
                                                                  ],
                                                        )
                                                    }
                                                />
                                                <span>
                                                    {guest.name}
                                                    <small className="ml-2 text-muted-foreground">
                                                        {guest.phone_number}
                                                    </small>
                                                </span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="p-3 text-sm text-muted-foreground">
                                            Add guests with phone numbers before
                                            sending a message.
                                        </p>
                                    )}
                                </div>
                                <select
                                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                                    value={form.data.message_type}
                                    onChange={(e) =>
                                        form.setData(
                                            'message_type',
                                            e.target.value,
                                        )
                                    }
                                >
                                    {[
                                        'announcement',
                                        'meeting_invitation',
                                        'meeting_reminder',
                                        'wedding_invitation',
                                        'contribution_acknowledgement',
                                    ].map((x) => (
                                        <option key={x} value={x}>
                                            {x.replaceAll('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                                <textarea
                                    maxLength={918}
                                    value={form.data.message}
                                    onChange={(e) =>
                                        form.setData('message', e.target.value)
                                    }
                                    placeholder="Write a warm, clear message…"
                                    className="min-h-36 w-full rounded-2xl border bg-background p-3 text-sm"
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{selected.length} recipients</span>
                                    <span>
                                        {form.data.message.length}/918
                                        characters
                                    </span>
                                </div>
                                <Button
                                    disabled={
                                        form.processing ||
                                        !selected.length ||
                                        !form.data.message
                                    }
                                    className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                                >
                                    Record messages for delivery
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-white">
                        <CardContent className="pt-6">
                            <h2 className="font-semibold">
                                Recent message activity
                            </h2>
                            <div className="mt-4 space-y-3">
                                {messages.data.length ? (
                                    messages.data.map((message) => (
                                        <div
                                            key={message.id}
                                            className="rounded-2xl bg-sky-50 p-3"
                                        >
                                            <p className="font-medium">
                                                {message.recipient_name ||
                                                    message.recipient_phone}
                                            </p>
                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                {message.message}
                                            </p>
                                            <span className="mt-2 inline-block text-xs text-amber-700">
                                                {message.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No messages recorded yet.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
Messages.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
