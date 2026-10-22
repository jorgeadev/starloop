import { LegalShell } from "@/components/legal/legal-shell";
import {
	LEGAL_LAST_UPDATED,
	OPERATOR_CONTACT,
	OPERATOR_JURISDICTION,
	OPERATOR_NAME,
} from "@/lib/legal";

export const metadata = { title: "Acceptable use" };

export default function AcceptableUsePage() {
	return (
		<LegalShell
			title="Acceptable use rules"
			subtitle="The hard limits that keep the exchange human. They apply to every member, every repository, and every credential. Breaking them can end your access and reverse your credits."
			current="Acceptable use"
		>
			<p className="text-[10px] tracking-[0.12em] text-muted/60 uppercase">
				Effective {LEGAL_LAST_UPDATED} · Version 1.0
			</p>

			<div className="rounded-control border border-star/25 bg-star-soft/25 px-3.5 py-3 text-[11.5px] leading-5">
				<strong>Template notice.</strong> These rules are incorporated into the{" "}
				<a href="/terms">Terms of Service</a> and are part of the agreement. The operator should
				have them reviewed for the jurisdiction of operation before a public launch. They are not
				legal advice.
			</div>

			<h2>1. The one rule behind the rest</h2>
			<p>
				<strong>
					Every star must be a deliberate human action that reflects genuine interest in the
					project.
				</strong>{" "}
				Starloop exists to make attention reciprocal, not to manufacture it. If a behavior makes the
				exchange look more popular than the underlying human interest justifies, it is prohibited
				even if it is not listed below.
			</p>

			<h2>2. Prohibited conduct</h2>

			<h3>2.1 Automation and non-human activity</h3>
			<ul>
				<li>
					You may not use bots, scripts, browser automation, headless browsers, extensions, macros,
					or background jobs to star, unstar, verify, or otherwise interact with the exchange.
				</li>
				<li>
					You may not use a credential obtained from another person, a compromised account, a
					purchased account, or a shared service account.
				</li>
				<li>
					You may not circumvent rate limits, CSRF protections, daily caps, queue eligibility
					checks, or verification.
				</li>
			</ul>

			<h3>2.2 Payments and incentives</h3>
			<ul>
				<li>
					You may not buy, sell, trade, auction, or otherwise exchange money, goods, services,
					discounts, follows, reviews, or anything else of value for stars, credits, or queue
					placement.
				</li>
				<li>
					You may not offer rewards, giveaways, or &quot;star for star&quot; incentives outside the
					normal reciprocal credit mechanism.
				</li>
				<li>
					You may not use the service to launder engagement, inflate a repository for an acquisition
					or funding round, or create a false signal of adoption.
				</li>
			</ul>

			<h3>2.3 Multiple accounts and coordination</h3>
			<ul>
				<li>
					You may maintain only one Starloop account. Creating additional accounts, including
					through alternate GitHub identities, is prohibited.
				</li>
				<li>
					You may not organize or participate in a ring, pod, or coordinated group whose purpose is
					to star each other&apos;s repositories in order to move credits or inflate counts.
				</li>
				<li>
					You may not use another person&apos;s repository, organization, or identity without
					authority, or switch ownership solely to evade limits.
				</li>
			</ul>

			<h3>2.4 Repository eligibility and honesty</h3>
			<ul>
				<li>
					Your active repository must be public, owned by you, not a fork, and genuinely active. It
					must have an accurate description of what it does.
				</li>
				<li>
					You may not bind a repository that is primarily a landing page for an unrelated product, a
					placeholder, a mirror with no original work, or a repository created solely to participate
					in the exchange.
				</li>
				<li>
					You may not misrepresent a repository&apos;s purpose, ownership, license, maintenance
					status, security, or performance.
				</li>
				<li>
					You may not submit malware, spyware, phishing, credential stealers, exploits with no
					defensive purpose, or code intended to harm users or systems.
				</li>
				<li>
					You may not submit content that is illegal, sexually exploitative, harassing, hateful, or
					that violates another person&apos;s intellectual property or privacy.
				</li>
			</ul>

			<h3>2.5 Withdrawal abuse</h3>
			<ul>
				<li>
					You may withdraw a star you gave, and the associated credit will reverse. Withdrawing a
					star solely to punish another member, to re-enter the queue with a new repository, or to
					manipulate the ledger is prohibited.
				</li>
				<li>
					You may not coordinate withdrawals to strand another member&apos;s balance or force a
					repository out of the queue. If a project no longer deserves your star, withdraw it once
					and move on.
				</li>
			</ul>

			<h3>2.6 Harassment and retaliation</h3>
			<ul>
				<li>
					Do not harass, threaten, dox, impersonate, or retaliate against another member,
					maintainer, or the operator.
				</li>
				<li>
					Do not use the queue, reports, or star actions to target a person or project. Disagreement
					with a project is not a reason to abuse the exchange.
				</li>
				<li>
					Do not contact members outside the service to demand a return star or to pressure them
					into withdrawing a report.
				</li>
			</ul>

			<h3>2.7 Security and platform integrity</h3>
			<ul>
				<li>
					Do not attempt to access another member&apos;s account, session, token, ledger, or report
					data.
				</li>
				<li>
					Do not probe, scan, or test the vulnerability of the service without authorization (see
					the security-research section below).
				</li>
				<li>
					Do not introduce malware, denial-of-service traffic, scrapers that degrade the service, or
					code that interferes with the application or its infrastructure.
				</li>
			</ul>

			<h2>3. GitHub&apos;s rules still apply</h2>
			<p>
				Compliance with these rules does not establish compliance with GitHub. GitHub&apos;s
				Acceptable Use Policies prohibit rank abuse such as automated starring, inauthentic
				interactions, and activity incentivized by rewards such as credits, gifts, or giveaways. A
				star-for-credit exchange may be treated as incentivized inauthentic engagement even though a
				human performs the star. GitHub can remove stars, restrict or suspend accounts, or change
				its policies independently of Starloop. Read the full{" "}
				<a href="/legal#github-policy">GitHub policy risk disclosure</a>. You are responsible for
				your own GitHub account and for deciding whether to participate.
			</p>

			<h2>4. What we do not do</h2>
			<ul>
				<li>We do not star repositories on your behalf without your action.</li>
				<li>We do not run bots, cron-driven starring, or engagement pods.</li>
				<li>We do not sell stars, credits, queue positions, or featured placement.</li>
				<li>We do not guarantee a return star or any amount of growth.</li>
				<li>We do not use private repository contents or private contribution data.</li>
			</ul>

			<h2>5. Reporting a problem</h2>
			<p>
				Use the report action on a repository in the queue, or email{" "}
				<strong>{OPERATOR_CONTACT}</strong>. Include the repository, what you observed, and any
				relevant links or screenshots. Reports are visible to the operator and are not published
				with your identity. Knowingly false or malicious reports are themselves a violation.
			</p>
			<p>
				If you believe a star you received was produced by automation, a purchased account, or a
				coordinated ring, report it. The operator may reverse the credit, remove the repository from
				the queue, and suspend the account involved.
			</p>

			<h2>6. Enforcement</h2>
			<p>
				The operator applies these rules using the audit trail, verification results, and reports.
				Responses may include one or more of the following, depending on severity and history:
			</p>
			<table>
				<thead>
					<tr>
						<th>Behavior</th>
						<th>Typical response</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>First, minor or ambiguous issue</td>
						<td>Clarification, warning, repository correction request</td>
					</tr>
					<tr>
						<td>Ineligible or misleading repository</td>
						<td>Removal from the queue; credit adjustment where needed</td>
					</tr>
					<tr>
						<td>Automation, multiple accounts, coordinated ring</td>
						<td>Credits reversed; account suspension; credential revoked</td>
					</tr>
					<tr>
						<td>Bought or sold stars or credits</td>
						<td>Account termination; associated credits removed</td>
					</tr>
					<tr>
						<td>Harassment, threats, doxxing</td>
						<td>Immediate suspension or termination; report to authorities if appropriate</td>
					</tr>
					<tr>
						<td>Security attack or data access</td>
						<td>Immediate suspension; preservation of evidence; lawful disclosure</td>
					</tr>
				</tbody>
			</table>
			<p>
				Enforcement decisions are made in good faith but are not a court proceeding. Where
				practical, the operator will explain the reason and allow a response. Serious abuse may
				result in immediate action to protect members and the service. Credits have no cash value,
				so suspension or termination does not create a refund obligation.
			</p>

			<h2>7. Security research</h2>
			<p>
				We welcome good-faith security research. Please do not access, modify, or exfiltrate another
				person&apos;s data, degrade the service, or use social engineering against members. Report
				vulnerabilities privately to <strong>{OPERATOR_CONTACT}</strong> with enough detail to
				reproduce the issue. Give the operator a reasonable opportunity to fix it before public
				disclosure. We will not pursue legal action against researchers who follow these conditions,
				but this statement is not a waiver of any third party&apos;s rights.
			</p>

			<h2>8. Appeals and contact</h2>
			<p>
				If you believe an enforcement action was mistaken, email <strong>{OPERATOR_CONTACT}</strong>{" "}
				within 30 days with the account login, the action, and the reason you believe it was wrong.
				The operator will review the available records and respond. Appeals do not guarantee
				reinstatement.
			</p>
			<p>
				These rules are governed by the laws of <strong>{OPERATOR_JURISDICTION}</strong> and form
				part of the agreement with <strong>{OPERATOR_NAME}</strong>. If any provision is
				unenforceable, the remaining rules continue to apply.
			</p>

			<p className="text-[10px] text-muted/60">
				Last updated {LEGAL_LAST_UPDATED}. This is a template document. It has not been reviewed by
				counsel and does not constitute legal advice.
			</p>
		</LegalShell>
	);
}
