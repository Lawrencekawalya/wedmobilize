import { Head, Link } from '@inertiajs/react';
import { LegalPage } from '@/components/legal/legal-page';

export default function Terms() {
    return (
        <>
            <Head title="Terms and Conditions" />
            <LegalPage
                eyebrow="Service agreement"
                title="Terms and Conditions"
                summary="These terms govern access to WedMobilize and the sending of SMS through the platform. By creating an account, accessing the dashboard, or sending a message, you agree to them."
            >
                <section>
                    <h2>1. The service</h2>
                    <p>
                        WedMobilize provides tools for managing event contacts,
                        organizing groups, creating and scheduling SMS, and
                        viewing provider-reported message activity. SMS
                        transmission is supplied through third-party providers,
                        including Pahappa Limited/EgoSMS and mobile networks.
                    </p>
                </section>

                <section>
                    <h2>2. Account eligibility and security</h2>
                    <p>
                        You must provide accurate information, be legally able
                        to accept these terms, protect your credentials, and
                        promptly notify us of unauthorized access. Activity
                        performed through your account is treated as authorized
                        by you unless you report compromise without unreasonable
                        delay.
                    </p>
                </section>

                <section>
                    <h2>3. Your contacts and messages</h2>
                    <p>
                        You retain responsibility for the contacts and content
                        you enter, import, schedule, or send. You confirm that
                        you have a lawful basis and all necessary permissions to
                        process recipient details and communicate with them. You
                        must keep consent and authorization records where
                        applicable and honour opt-out requests promptly.
                    </p>
                    <p>
                        Your use must comply with our{' '}
                        <Link href="/acceptable-use">
                            Acceptable Use Policy
                        </Link>
                        , which forms part of these terms.
                    </p>
                </section>

                <section>
                    <h2>4. SMS delivery and sender identity</h2>
                    <p>
                        A message shown as accepted, submitted, sent, or
                        delivered reflects the information available from the
                        SMS provider and does not guarantee that a person read
                        it. Networks may replace, reject, delay, filter, or
                        restrict a requested sender ID. Delivery also depends on
                        handset availability, network conditions, valid phone
                        numbers, sufficient credits, provider systems, and
                        applicable rules.
                    </p>
                </section>

                <section>
                    <h2>5. Charges and credits</h2>
                    <p>
                        SMS use may consume provider credits based on the
                        recipient network, message length, character encoding,
                        and number of SMS parts. Estimates displayed before
                        sending are informational; the provider’s final rating
                        and balance records control where they differ. You are
                        responsible for maintaining sufficient credits.
                    </p>
                </section>

                <section>
                    <h2>6. Suspension and termination</h2>
                    <p>
                        We may block messages, suspend, restrict, or terminate
                        access where reasonably necessary to address suspected
                        misuse, security risk, provider direction, legal
                        requirements, unpaid usage, or a breach of these terms.
                        Serious or repeated abuse may result in immediate and
                        permanent termination.
                    </p>
                </section>

                <section>
                    <h2>7. Cooperation and records</h2>
                    <p>
                        We may preserve and provide relevant records to the SMS
                        provider, telecommunications networks, regulators,
                        courts, or law enforcement where required by law or
                        reasonably necessary to investigate abuse and protect
                        the service or affected persons.
                    </p>
                </section>

                <section>
                    <h2>8. Service availability</h2>
                    <p>
                        We aim to keep WedMobilize reliable but do not promise
                        uninterrupted or error-free availability. Maintenance,
                        provider outages, networks, force majeure events, and
                        circumstances outside our reasonable control may affect
                        access or delivery. Features may be changed or
                        discontinued where reasonably necessary.
                    </p>
                </section>

                <section>
                    <h2>9. Responsibility for misuse</h2>
                    <p>
                        To the extent permitted by law, you are responsible for
                        losses, liabilities, penalties, regulatory sanctions,
                        costs, damages, and reasonable legal expenses caused by
                        your unlawful, unauthorized, or abusive use of
                        WedMobilize. You agree to indemnify WedMobilize against
                        third-party claims arising from your breach of these
                        terms, your messages, or your use of recipient data.
                    </p>
                </section>

                <section>
                    <h2>10. Privacy</h2>
                    <p>
                        Our <Link href="/privacy">Privacy Policy</Link> explains
                        how the platform handles personal data. You must also
                        meet your own privacy obligations as an event organizer
                        or account holder.
                    </p>
                </section>

                <section>
                    <h2>11. Governing law and changes</h2>
                    <p>
                        These terms are governed by the laws of Uganda. We may
                        update them to reflect changes to the service, provider
                        requirements, risk, or law. Material changes will take
                        effect after reasonable notice where practicable;
                        continued use after the effective date means you accept
                        the updated terms.
                    </p>
                </section>

                <section>
                    <h2>12. Contact</h2>
                    <p>
                        Questions, complaints, and legal notices should be sent
                        through the official contact channels published by{' '}
                        <a href="https://syntaxsystems.co">Syntax Systems</a>.
                    </p>
                </section>
            </LegalPage>
        </>
    );
}
