import { LegalShell } from "@/components/legal/legal-shell";
import {
	LEGAL_LAST_UPDATED,
	OPERATOR_ADDRESS,
	OPERATOR_CONTACT,
	OPERATOR_JURISDICTION,
	OPERATOR_NAME,
} from "@/lib/legal";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
	return (
		<LegalShell
			title="Privacy policy"
			subtitle="What Starloop collects, why it needs it, where it lives, how long it stays, and how to export or delete it. The short version: public GitHub data, your actions, and an encrypted credential."
			current="Privacy policy"
		>
			<p className="text-[10px] tracking-[0.12em] text-muted/60 uppercase">
				Effective {LEGAL_LAST_UPDATED} · Version 1.0
			</p>

			<div className="rounded-control border border-star/25 bg-star-soft/25 px-3.5 py-3 text-[11.5px] leading-5">
				<strong>Template notice.</strong> Replace the operator, contact, address, and jurisdiction
				placeholders before a public launch, and confirm the disclosures required in your
				jurisdiction. This document is a starting point, not legal advice.
			</div>

			<h2>1. Who controls your data</h2>
			<p>
				Starloop is operated by <strong>{OPERATOR_NAME}</strong>, with its principal address at{" "}
				<strong>{OPERATOR_ADDRESS}</strong>. For the purposes of applicable data-protection law, the
				operator is the data controller of the personal data described in this policy. Privacy
				questions and requests can be sent to <strong>{OPERATOR_CONTACT}</strong>.
			</p>
			<p>
				This policy applies to the Starloop website, application, and API. It does not apply to
				GitHub. Your use of GitHub is governed by GitHub&apos;s own privacy statement and terms.
			</p>

			<h2>2. What we collect</h2>
			<h3>2.1 GitHub identity and profile</h3>
			<p>
				When you connect GitHub, we receive your GitHub numeric ID, login, display name, avatar URL,
				bio, profile URL, and the primary email address GitHub returns (or that we request with the{" "}
				<code>user:email</code> scope). We store these to identify your account, render your
				profile, and communicate with you about the service.
			</p>
			<h3>2.2 GitHub credential</h3>
			<p>
				If you authorize with OAuth, we receive an OAuth access token and, where applicable, a
				refresh token. If you connect with a personal access token, we receive the token you paste.
				We encrypt tokens with AES-256-GCM before storing them and keep a short hint (such as the
				token prefix) so you can recognize the connection. Tokens are never returned to the browser
				after submission. We record the token kind, granted scopes, and expiry where available.
			</p>
			<h3>2.3 Repository and exchange data</h3>
			<p>
				When you bind a repository, we store its public GitHub metadata: numeric ID, full name,
				owner, description, homepage, language, star and fork counts, topics, avatar URL,
				visibility, fork and archive status, and the last push time. We also store your
				repository&apos;s active status and sync timestamps.
			</p>
			<p>
				When you participate in the exchange, we store the stars you give and receive (including
				repository, giver, owner, status, and verification times), your credit ledger (delta,
				resulting balance, reason, detail, and reference), and activity entries. These records are
				necessary to operate the exchange, reverse credits when a star disappears, and prevent
				abuse.
			</p>
			<h3>2.4 Sessions, security, and abuse prevention</h3>
			<p>
				We store a session record containing a hashed session identifier, your user ID, creation and
				expiry times, last-seen time, a hash of your IP address, and your browser user-agent string.
				We also store rate-limit counters keyed by hashed IP address or account, and CSRF/OAuth
				state cookies. These are used to keep you signed in, protect forms, enforce limits, and
				investigate abuse.
			</p>
			<h3>2.5 Reports and correspondence</h3>
			<p>
				If you report a repository, we store your account ID, the reported repository, the reason,
				any details you provide, and the report status. If you contact us, we keep the
				correspondence for as long as needed to resolve the matter and meet legal obligations.
			</p>
			<h3>2.6 What we do not collect</h3>
			<p>
				We do not receive your GitHub password. We do not intentionally collect payment card data
				because the service has no paid features. We do not use advertising cookies, cross-site
				trackers, or third-party analytics that profile you across sites. We do not read private
				repository contents.
			</p>

			<h2>3. Why we use your data</h2>
			<table>
				<thead>
					<tr>
						<th>Purpose</th>
						<th>Data used</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Authenticate you and maintain your session</td>
						<td>GitHub identity, session record, cookies</td>
					</tr>
					<tr>
						<td>Bind and display your active public repository</td>
						<td>Public repository metadata, ownership checks</td>
					</tr>
					<tr>
						<td>Give, verify, and withdraw stars when you ask</td>
						<td>Credential, star records, repository metadata</td>
					</tr>
					<tr>
						<td>Operate the credit ledger and reverse invalid credits</td>
						<td>Star records, ledger entries, activities</td>
					</tr>
					<tr>
						<td>Enforce daily caps and prevent abuse</td>
						<td>Rate limits, IP hash, user-agent, action history</td>
					</tr>
					<tr>
						<td>Respond to reports and support requests</td>
						<td>Report details, correspondence</td>
					</tr>
					<tr>
						<td>Comply with law and enforce our terms</td>
						<td>Records reasonably necessary for the claim or obligation</td>
					</tr>
				</tbody>
			</table>

			<h2>4. Legal bases</h2>
			<p>Where the GDPR or similar law applies, we rely on the following legal bases:</p>
			<ul>
				<li>
					<strong>Performance of a contract</strong> — to provide the exchange, authenticate you,
					maintain your credits, and operate your account.
				</li>
				<li>
					<strong>Legitimate interests</strong> — to secure the service, prevent fraud and abuse,
					enforce our rules, and improve the reliability of the exchange, balanced against your
					rights.
				</li>
				<li>
					<strong>Consent</strong> — where we ask for a specific optional action, such as accepting
					a new policy version. You can withdraw consent at any time, though that may mean you can
					no longer use the service.
				</li>
				<li>
					<strong>Legal obligation</strong> — to keep records, respond to lawful requests, and
					establish or defend legal claims.
				</li>
			</ul>

			<h2>5. How we store and protect it</h2>
			<p>
				Data is stored in a managed PostgreSQL database (currently Neon) and transmitted over HTTPS.
				GitHub credentials are encrypted at rest with AES-256-GCM using a key held in the server
				environment, separate from the database. Session identifiers are stored as hashes. The
				application enforces CSRF protection, origin checks, rate limits, and strict security
				headers.
			</p>
			<p>
				No system is perfectly secure. We cannot guarantee that unauthorized access, disclosure, or
				loss will never occur. If we become aware of a breach that materially affects your personal
				data, we will notify affected users and relevant authorities as required by law.
			</p>

			<h2>6. When we share data</h2>
			<p>
				We do not sell your personal data and do not share it for cross-context behavioral
				advertising. We share data only in these circumstances:
			</p>
			<ul>
				<li>
					<strong>GitHub</strong> — when you ask us to star, verify, or withdraw a star, we call
					GitHub&apos;s API with your credential. GitHub receives the request and processes it under
					its own privacy statement.
				</li>
				<li>
					<strong>Infrastructure providers</strong> — our database and hosting providers process
					data on our behalf under contractual confidentiality and security obligations. They are
					not permitted to use it for their own marketing.
				</li>
				<li>
					<strong>Legal and safety</strong> — if required by law, legal process, or a binding order,
					or if we believe disclosure is necessary to protect the rights, safety, or security of the
					operator, members, or the public.
				</li>
				<li>
					<strong>Business transfer</strong> — in connection with a merger, acquisition, financing,
					or sale of assets, subject to appropriate confidentiality protections.
				</li>
			</ul>

			<h2>7. Retention</h2>
			<p>
				We keep account and exchange data while your account is active. If you delete your account,
				we delete your user record, which cascades to your sessions, credential, repositories, given
				and received star records, ledger entries, activities, and reports. Some residual copies may
				remain in backups for a limited period, and we may retain records where necessary for fraud
				prevention, security, dispute resolution, or legal compliance.
			</p>
			<p>
				Rate-limit records expire automatically after their short window. Session records expire at
				the end of the session lifetime or when you sign out. Logs held by infrastructure providers
				are retained according to their standard policies.
			</p>

			<h2>8. Your rights</h2>
			<p>
				Depending on where you live, you may have the right to access, correct, delete, restrict, or
				object to the processing of your personal data, to receive a portable copy, and to lodge a
				complaint with a supervisory authority. You can exercise the main rights directly:
			</p>
			<ul>
				<li>
					<strong>Access and export</strong> — Settings → Data → Export account downloads a JSON
					file containing your account, repositories, exchange records, ledger, and activities.
				</li>
				<li>
					<strong>Correction</strong> — update your GitHub profile on GitHub; the service syncs
					public profile fields the next time you connect or sign in. For other corrections, contact
					us.
				</li>
				<li>
					<strong>Deletion</strong> — Settings → Data → Delete account removes your account and
					associated records after confirmation. You may also email us.
				</li>
				<li>
					<strong>Objection or restriction</strong> — email <strong>{OPERATOR_CONTACT}</strong> with
					the details. We may need to verify your identity before acting.
				</li>
			</ul>
			<p>
				We will respond within the timeframe required by applicable law. We will not discriminate
				against you for exercising a privacy right.
			</p>

			<h2>9. Cookies and local storage</h2>
			<p>
				We use only essential cookies. The session cookie keeps you signed in; the CSRF cookie
				protects state-changing requests; the OAuth state cookie binds a sign-in attempt to your
				browser. We do not use advertising cookies or third-party tracking cookies. The interface
				may store small preferences in your browser, but those are not used to build a profile
				across sites.
			</p>

			<h2>10. International transfers</h2>
			<p>
				The service and its infrastructure may process data in countries other than your own,
				including the United States. Where required, we rely on appropriate safeguards such as
				standard contractual clauses or an equivalent lawful transfer mechanism. You can request
				more information about the safeguards by contacting <strong>{OPERATOR_CONTACT}</strong>.
			</p>

			<h2>11. Children</h2>
			<p>
				The service is not directed to children under 18 (or the age of majority in your
				jurisdiction). We do not knowingly collect personal data from children. If you believe a
				child has provided data, contact us and we will take appropriate steps to delete it.
			</p>

			<h2>12. Changes to this policy</h2>
			<p>
				We may update this policy to reflect changes in the service, technology, or law. The revised
				version will be posted here with a new effective date. Material changes will be announced on
				the website or by email where appropriate. If we need your consent for a new use, we will
				ask for it separately.
			</p>

			<h2>13. Governing law and contact</h2>
			<p>
				This policy is governed by the laws of <strong>{OPERATOR_JURISDICTION}</strong>, without
				limiting any mandatory privacy rights you have where you live. Contact the controller at{" "}
				<strong>{OPERATOR_CONTACT}</strong> or by post at <strong>{OPERATOR_NAME}</strong>,{" "}
				<strong>{OPERATOR_ADDRESS}</strong>. If you are in the European Economic Area or the United
				Kingdom, you also have the right to complain to your local supervisory authority.
			</p>

			<p className="text-[10px] text-muted/60">
				Last updated {LEGAL_LAST_UPDATED}. This is a template document. It has not been reviewed by
				counsel and does not constitute legal advice.
			</p>
		</LegalShell>
	);
}
