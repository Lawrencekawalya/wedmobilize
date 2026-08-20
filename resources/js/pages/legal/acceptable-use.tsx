import { Head } from '@inertiajs/react';
import { LegalPage } from '@/components/legal/legal-page';

export default function AcceptableUse() {
    return (
        <>
            <Head title="Acceptable Use Policy" />
            <LegalPage
                eyebrow="Responsible messaging"
                title="Acceptable Use Policy"
                summary="These rules protect recipients, event organizers, WedMobilize, and our SMS provider. Every account holder is responsible for the contacts, content, and campaigns sent through their account."
            >
                <section>
                    <h2>1. Permission to contact recipients</h2>
                    <p>You may send an SMS only where you can show that:</p>
                    <ul>
                        <li>
                            the recipient gave valid consent, requested the
                            message, or another lawful basis clearly permits it;
                        </li>
                        <li>
                            the phone number was obtained transparently for a
                            purpose compatible with the message; and
                        </li>
                        <li>
                            you have authority to upload, store, group, and use
                            that recipient’s details.
                        </li>
                    </ul>
                    <p>
                        Buying lists, scraping numbers, guessing numbers, or
                        using contacts collected for an unrelated purpose is
                        prohibited.
                    </p>
                </section>

                <section>
                    <h2>2. Prohibited conduct and content</h2>
                    <p>You must not use WedMobilize to send or facilitate:</p>
                    <ul>
                        <li>
                            spam, unsolicited bulk messages, or messages sent
                            after a recipient has opted out;
                        </li>
                        <li>
                            phishing, impersonation, fraud, scam promotions,
                            deceptive claims, or requests intended to steal
                            money, credentials, or personal data;
                        </li>
                        <li>
                            abusive, threatening, harassing, malicious,
                            discriminatory, obscene, or otherwise prohibited
                            content;
                        </li>
                        <li>
                            illegal goods, services, activity, or content that
                            infringes another person’s intellectual-property or
                            privacy rights;
                        </li>
                        <li>
                            misleading sender identities or attempts to evade
                            network, provider, legal, or platform controls; or
                        </li>
                        <li>
                            messages on behalf of an international entity that
                            is not duly registered or authorized to operate in
                            Uganda as required by law.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>3. Messaging standards</h2>
                    <ul>
                        <li>
                            Identify the event or organization responsible for
                            the message and do not misrepresent the sender.
                        </li>
                        <li>
                            Keep evidence of consent and promptly honour
                            withdrawal, objection, and opt-out requests.
                        </li>
                        <li>
                            Do not schedule commercial communications between
                            7:00 PM and 6:00 AM unless the recipient explicitly
                            agreed or applicable law permits it.
                        </li>
                        <li>
                            Protect account credentials and restrict access to
                            trusted, authorized users.
                        </li>
                    </ul>
                    <p>
                        These standards should be read together with the{' '}
                        <a href="https://www.ucc.co.ug/download/the-uganda-communications-text-and-multimedia-messaging-regulations-2019/">
                            Uganda Communications (Text and Multimedia
                            Messaging) Regulations, 2019
                        </a>
                        .
                    </p>
                </section>

                <section>
                    <h2>4. Monitoring and investigation</h2>
                    <p>
                        We may review account activity, delivery records,
                        complaints, and message metadata to detect abuse, secure
                        the service, satisfy provider requirements, and comply
                        with lawful requests. We may require evidence of consent
                        or authority before allowing a campaign to proceed.
                    </p>
                </section>

                <section>
                    <h2>5. Consequences of misuse</h2>
                    <p>
                        If misuse is suspected or confirmed, WedMobilize may,
                        depending on the risk and severity:
                    </p>
                    <ul>
                        <li>
                            block or cancel a message or campaign without prior
                            notice;
                        </li>
                        <li>
                            temporarily suspend access while an investigation is
                            completed;
                        </li>
                        <li>
                            permanently terminate the account and request the
                            SMS provider to restrict the sender;
                        </li>
                        <li>
                            preserve relevant records and cooperate with
                            Pahappa/EgoSMS, mobile networks, regulators, or law
                            enforcement where legally required; and
                        </li>
                        <li>
                            seek recovery of losses, liabilities, penalties,
                            regulatory sanctions, costs, damages, and reasonable
                            legal expenses caused by the misuse.
                        </li>
                    </ul>
                    <p>
                        Misuse may also expose the account holder to civil,
                        regulatory, or criminal consequences under applicable
                        law.
                    </p>
                </section>

                <section>
                    <h2>6. Reporting abuse</h2>
                    <p>
                        Report suspected misuse through the official contact
                        channels published by{' '}
                        <a href="https://syntaxsystems.co">Syntax Systems</a>.
                        Include the sender name, receiving number, message, and
                        approximate time where possible.
                    </p>
                </section>
            </LegalPage>
        </>
    );
}
