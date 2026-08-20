import { Head } from '@inertiajs/react';
import { LegalPage } from '@/components/legal/legal-page';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy" />
            <LegalPage
                eyebrow="Your data and your contacts"
                title="Privacy Policy"
                summary="This policy explains how WedMobilize handles account information, uploaded contacts, SMS content, and delivery activity when you use the platform."
            >
                <section>
                    <h2>1. Who is responsible for the data?</h2>
                    <p>
                        WedMobilize operates the platform and determines how
                        account, security, billing, and service data is used. An
                        event organizer generally determines why recipient
                        contacts are collected and messaged. Organizers must
                        therefore ensure that their collection and use of each
                        contact is lawful, fair, and transparent.
                    </p>
                </section>

                <section>
                    <h2>2. Information we process</h2>
                    <ul>
                        <li>
                            account information, such as name, email address,
                            login and security records;
                        </li>
                        <li>
                            contact information uploaded or entered by an
                            organizer, including names, phone numbers, email
                            addresses, and group membership;
                        </li>
                        <li>
                            SMS content, templates, schedules, sender identity,
                            recipient selections, campaigns, and delivery
                            status;
                        </li>
                        <li>
                            technical and usage information needed for sessions,
                            security, diagnostics, and audit trails; and
                        </li>
                        <li>
                            support, complaint, and compliance communications.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>3. Why we use information</h2>
                    <p>We use information to:</p>
                    <ul>
                        <li>
                            provide contact management, message composition,
                            scheduling, sending, and delivery reporting;
                        </li>
                        <li>
                            authenticate users, prevent fraud and abuse, and
                            protect the platform;
                        </li>
                        <li>
                            provide support, maintain records, and improve
                            reliability;
                        </li>
                        <li>
                            enforce our Terms and Acceptable Use Policy; and
                        </li>
                        <li>
                            comply with legal, regulatory, and SMS-provider
                            obligations.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>4. Sharing and service providers</h2>
                    <p>
                        Phone numbers, message content, sender information, and
                        related delivery data are shared with Pahappa
                        Limited/EgoSMS and relevant telecommunications networks
                        so messages can be transmitted and reported. We may also
                        use hosting, database, security, and support providers
                        that process data only to provide their services to us.
                        We may disclose information where required by law, a
                        regulator, a court, or to protect people and the service
                        from harm.
                    </p>
                    <p>We do not sell contact lists or personal data.</p>
                </section>

                <section>
                    <h2>5. Retention and deletion</h2>
                    <p>
                        We retain information while an account is active and for
                        as long as reasonably necessary to provide the service,
                        resolve disputes, investigate abuse, maintain audit
                        records, and meet legal or provider obligations. Data
                        that is no longer required is deleted or anonymized,
                        subject to backups and lawful retention requirements.
                    </p>
                </section>

                <section>
                    <h2>6. Security</h2>
                    <p>
                        We use reasonable technical and organizational
                        safeguards designed to protect personal data. No online
                        system is completely secure, so account holders must
                        also use strong credentials, limit account access, and
                        promptly report suspected compromise.
                    </p>
                </section>

                <section>
                    <h2>7. Your rights</h2>
                    <p>
                        Subject to Uganda’s Data Protection and Privacy Act and
                        applicable exceptions, an individual may request access
                        to personal data, correction, blocking, erasure or
                        destruction, object to direct marketing, and complain
                        about unlawful processing. Requests should be made
                        through the official contact channels published by{' '}
                        <a href="https://syntaxsystems.co">Syntax Systems</a>.
                        We may need to verify identity and coordinate with the
                        event organizer that supplied the data.
                    </p>
                    <p>
                        Individuals may also contact Uganda’s{' '}
                        <a href="https://www.pdpo.go.ug/">
                            Personal Data Protection Office
                        </a>
                        .
                    </p>
                </section>

                <section>
                    <h2>8. Organizer responsibilities</h2>
                    <p>
                        An organizer uploading contacts must give recipients any
                        legally required notice, maintain a valid basis for
                        processing and messaging, keep the data accurate, honour
                        opt-outs and rights requests, and delete data when it is
                        no longer needed. Do not upload sensitive or children’s
                        data unless you are legally authorized and it is
                        necessary for the stated event purpose.
                    </p>
                </section>

                <section>
                    <h2>9. Changes to this policy</h2>
                    <p>
                        We may update this policy as the service, providers, or
                        law changes. The current version and effective date will
                        remain available on this page.
                    </p>
                </section>
            </LegalPage>
        </>
    );
}
