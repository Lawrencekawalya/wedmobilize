import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

export default function CreateWedding() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        bride_name: '',
        groom_name: '',
        wedding_date: '',
        venue: '',
        contribution_target: '',
        primary_contact_phone: '',
        description: '',
    });
    const fields = [
        ['name', 'Wedding name'],
        ['bride_name', 'Bride name'],
        ['groom_name', 'Groom name'],
        ['wedding_date', 'Wedding date'],
        ['venue', 'Venue'],
        ['contribution_target', 'Contribution target (UGX)'],
        ['primary_contact_phone', 'Primary contact phone'],
    ] as const;

    return (
        <>
            <Head title="Create your wedding" />
            <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_#dff7ff,_transparent_36%),linear-gradient(135deg,#f8fcff,#e9f5ff)] p-4 sm:p-8">
                <Card className="mx-auto max-w-3xl rounded-[2rem] border-white/80 bg-white/85 shadow-xl shadow-sky-950/10 backdrop-blur">
                    <CardHeader>
                        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-600 uppercase">
                            WedMobilize setup
                        </p>
                        <CardTitle className="text-3xl">
                            Let’s plan something beautiful.
                        </CardTitle>
                        <p className="text-muted-foreground">
                            Create a private workspace for your wedding
                            committee.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                post('/weddings');
                            }}
                            className="grid gap-5 sm:grid-cols-2"
                        >
                            {fields.map(([key, label]) => (
                                <div
                                    key={key}
                                    className={
                                        key === 'name' ? 'sm:col-span-2' : ''
                                    }
                                >
                                    <Label htmlFor={key}>{label}</Label>
                                    <Input
                                        id={key}
                                        type={
                                            key === 'wedding_date'
                                                ? 'date'
                                                : key === 'contribution_target'
                                                  ? 'number'
                                                  : 'text'
                                        }
                                        min={
                                            key === 'contribution_target'
                                                ? 0
                                                : undefined
                                        }
                                        value={data[key]}
                                        onChange={(e) =>
                                            setData(key, e.target.value)
                                        }
                                        className="mt-2 rounded-xl"
                                    />
                                    <InputError
                                        message={errors[key]}
                                        className="mt-1"
                                    />
                                </div>
                            ))}
                            <div className="sm:col-span-2">
                                <Label htmlFor="description">
                                    A little about the celebration
                                </Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="mt-2 min-h-24 w-full rounded-xl border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex justify-end sm:col-span-2">
                                <Button
                                    className="rounded-xl bg-emerald-500 px-6 hover:bg-emerald-600"
                                    disabled={processing}
                                >
                                    Create wedding workspace
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateWedding.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
