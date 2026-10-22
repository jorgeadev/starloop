import { LegalShell } from "@/components/legal/legal-shell";
import {
	LEGAL_LAST_UPDATED,
	OPERATOR_ADDRESS,
	OPERATOR_CONTACT,
	OPERATOR_JURISDICTION,
	OPERATOR_NAME,
} from "@/lib/legal";

export const metadata = { title: "Terms of service" };

export default function TermsPage() {
	return (
		<LegalShell
			title="Terms of service"
			subtitle="The agreement between you and the operator of Starloop. It covers eligibility, the credit model, acceptable conduct, GitHub-related risk, and the limits of what this service promises."
			current="Terms of service"
		>
			<p className="text-[10px] tracking-[0.12em] text-muted/60 uppercase">
				Effective {LEGAL_LAST_UPDATED} · Version 1.0
			</p>

			<div className="rounded-control border border-star/25 bg-star-soft/25 px-3.5 py-3 text-[11.5px] leading-5">
				<strong>Template notice.</strong> This document contains bracketed placeholders for the
				operator&apos;s legal identity, contact details, postal address, and jurisdiction. It is a
				starting point for review by qualified counsel, not legal advice. Do not operate a public
				deployment until every placeholder has been replaced and the document has been reviewed.
			</div>

			<h2>1. Who we are and what this agreement covers</h2>
			<p>
				Starloop (&quot;the service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;the
				operator&quot;) is an independent, human-powered GitHub star exchange. It is operated by{" "}
				<strong>{OPERATOR_NAME}</strong>, reachable at <strong>{OPERATOR_CONTACT}</strong>, with its
				principal address at <strong>{OPERATOR_ADDRESS}</strong>.
			</p>
			<p>
				These Terms of Service (&quot;Terms&quot;) govern your access to and use of the service,
				including the website, application, queue, credit ledger, and any related features. By
				connecting a GitHub account or otherwise using the service, you agree to these Terms, the{" "}
				<a href="/privacy">Privacy Policy</a>, and the{" "}
				<a href="/acceptable-use">Acceptable Use Rules</a>. If you do not agree, do not use the
				service.
			</p>
			<p>
				Starloop is{" "}
				<strong>not affiliated with, endorsed by, sponsored by, or operated by GitHub, Inc.</strong>{" "}
				GitHub is a trademark of GitHub, Inc. Your use of GitHub remains governed by GitHub&apos;s
				own terms and policies.
			</p>

			<h2>2. Eligibility</h2>
			<ul>
				<li>
					You must be at least 18 years old, or the age of majority in your jurisdiction, and
					legally able to enter into this agreement.
				</li>
				<li>
					You must own and control the GitHub account you connect. You may not connect an account on
					behalf of another person without their authority.
				</li>
				<li>
					You must not be barred from using the service under applicable law or under a prior
					suspension by the operator.
				</li>
				<li>
					You may maintain only one Starloop account. Creating additional accounts to obtain
					additional credits, queue positions, or stars is prohibited.
				</li>
			</ul>
			<p>
				The service is offered to the public as described on the website. The operator may impose
				additional eligibility or geographic restrictions where required by law or platform policy.
			</p>

			<h2>3. GitHub connection and credentials</h2>
			<p>
				Starloop authenticates users through GitHub OAuth or a personal access token
				(&quot;PAT&quot;), including classic and fine-grained PATs. You choose the method. You
				authorize the service to use the credential for the limited purposes described below:
			</p>
			<ul>
				<li>reading your public GitHub profile and primary email address;</li>
				<li>listing repositories you own so you can bind one active project;</li>
				<li>
					reading and changing the star state of a repository when you explicitly initiate a star,
					verification, or withdrawal;
				</li>
				<li>checking whether a star is still present during verification.</li>
			</ul>
			<p>
				Credentials are encrypted at rest with AES-256-GCM and are never displayed in the browser
				after submission. Starloop does not ask for your GitHub password and does not use your
				credential to perform actions you did not initiate. You can revoke access from GitHub at any
				time; doing so disables star actions until you reconnect. The operator may revoke or require
				replacement of a credential that appears compromised or abusive.
			</p>
			<p>
				You are responsible for keeping your GitHub account secure and for all activity performed
				through your credential. Notify the operator promptly at <strong>{OPERATOR_CONTACT}</strong>{" "}
				if you believe your account or credential has been compromised.
			</p>

			<h2>4. The exchange and credits</h2>
			<p>
				The service maintains a reciprocity ledger. The core rule is simple:{" "}
				<strong>
					one verified star given moves one credit from the receiving project&apos;s owner to the
					giver.
				</strong>{" "}
				A star your project receives spends one of your credits. The purpose is to make attention
				reciprocal rather than free.
			</p>
			<h3>4.1 No monetary value</h3>
			<p>
				Credits are a non-transferable accounting unit. They have <strong>no cash value</strong>,
				cannot be purchased, sold, traded, gifted, inherited, withdrawn, or redeemed for money or
				anything of monetary value, and do not represent a security, deposit, or stored-value
				instrument. The operator may adjust balances to correct errors, abuse, reversals, or
				fraudulent activity.
			</p>
			<h3>4.2 Eligibility of repositories</h3>
			<p>
				Each member may have one active public repository at a time. A repository must be public,
				owned by the member, not a fork, and must meet the technical and quality checks shown in the
				application, including a description and recent activity. The operator may decline or remove
				a repository that does not meet the published criteria, that is misleading, or that creates
				legal, security, or platform risk.
			</p>
			<h3>4.3 Daily limits and queue behavior</h3>
			<p>
				The operator enforces daily outgoing and incoming star limits, one active repository per
				member, and other anti-abuse controls. Queue position is determined by the service&apos;s
				ordering logic and available credits, not by payment. A repository with no credits may leave
				the queue until credits are earned again. The operator may pause a queue, a repository, or
				the entire service for maintenance, verification, or safety.
			</p>
			<h3>4.4 Verification and reversal</h3>
			<p>
				The service verifies that a star is present using the credential of the member who gave it.
				If a star is removed or can no longer be verified, the corresponding credit transfer may be
				reversed on both sides and the ledger will record the reversal. You may withdraw a star you
				gave; doing so reverses the associated credit. Withdrawing a star after receiving a return
				star, or repeatedly cycling stars to manipulate the ledger, is prohibited.
			</p>

			<h2>5. Acceptable conduct</h2>
			<p>
				Your use of the service is subject to the <a href="/acceptable-use">Acceptable Use Rules</a>
				, which are incorporated into these Terms by reference. In summary, you must not:
			</p>
			<ul>
				<li>
					use bots, scripts, browser automation, extensions, purchased engagement, or any other
					non-human means to give, receive, or verify stars;
				</li>
				<li>
					offer or accept money, goods, services, or other consideration in exchange for stars,
					credits, or queue placement;
				</li>
				<li>
					operate multiple accounts, coordinate a ring of accounts, or manipulate the queue through
					fake, compromised, or borrowed accounts;
				</li>
				<li>
					bind a repository you do not own or lack authority to promote, or misrepresent a
					repository&apos;s purpose, ownership, or activity;
				</li>
				<li>
					harass, threaten, dox, or retaliate against other members, including by withdrawing stars
					to punish a person rather than to correct a genuine mistake;
				</li>
				<li>
					interfere with the service, attempt to access another member&apos;s data, probe the
					service without authorization, or bypass rate limits and access controls.
				</li>
			</ul>
			<p>
				GitHub&apos;s own rules apply independently. Nothing in these Terms permits conduct that
				GitHub prohibits, and nothing in these Terms requires you to star any project. A star must
				reflect your genuine willingness to support the project.
			</p>

			<h2>6. GitHub policy risk and no guarantee of stars</h2>
			<p>
				<strong>Reciprocal star exchange carries platform risk.</strong> GitHub&apos;s Acceptable
				Use Policies prohibit rank abuse such as automated starring or following, inauthentic
				interactions, and activity incentivized by rewards such as credits, gifts, or giveaways. A
				star-for-credit exchange may be treated as incentivized inauthentic engagement even though a
				human performs the star and credits have no cash value. GitHub may remove stars, restrict or
				suspend accounts, or change its policies without notice. The operator does not control
				GitHub and cannot protect your account from GitHub&apos;s enforcement decisions.
			</p>
			<p>
				The service does not guarantee that you will receive any stars, any particular number of
				stars, any queue position, any visibility, or any commercial or reputational outcome.
				Incoming stars depend on other members choosing to participate. The operator does not
				automate stars and does not promise growth. Read the full{" "}
				<a href="/legal#github-policy">GitHub policy risk disclosure</a> before joining.
				Participation is voluntary and at your own risk.
			</p>

			<h2>7. Your content and repository data</h2>
			<p>
				You retain ownership of your repository, profile, and any content you submit. You grant the
				operator a limited, non-exclusive, worldwide, royalty-free license to host, display, and
				process the public metadata of your repository (name, description, topics, language, star
				count, owner profile, and related public information) for the purpose of operating and
				displaying the exchange. This license ends when you remove the repository from the service
				or delete your account, except for backups and records retained as described in the Privacy
				Policy.
			</p>
			<p>
				You represent that you have the right to submit the repository and that its description and
				metadata are accurate. Do not submit confidential information, trade secrets, or content you
				do not have permission to publish.
			</p>
			<p>
				The service&apos;s own code, design, and branding are the property of the operator or its
				licensors and are protected by applicable law. The repository is made available for viewing
				and evaluation only; no license to reuse, modify, deploy, or redistribute the code is
				granted except by prior written permission. Any separate written license would govern the
				code, not the Starloop name, logo, or service marks.
			</p>

			<h2>8. Suspension and termination</h2>
			<p>
				You may stop using the service at any time. You may delete your account from the Settings
				page; deletion removes your profile, repository binding, connection, and sessions, and
				anonymizes or removes associated ledger data as described in the Privacy Policy. Some
				records may be retained where necessary for security, fraud prevention, dispute resolution,
				or legal compliance.
			</p>
			<p>
				The operator may suspend, restrict, or terminate your access, remove a repository, reverse
				credits, or revoke a credential if the operator reasonably believes you have violated these
				Terms, the Acceptable Use Rules, applicable law, or GitHub policy, or if your account
				creates risk for the service or other members. Where practical, the operator will provide
				notice and an opportunity to respond. Serious abuse may result in immediate action without
				notice.
			</p>

			<h2>9. Disclaimers</h2>
			<p>
				THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;. TO THE MAXIMUM
				EXTENT PERMITTED BY LAW, THE OPERATOR DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR
				STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE,
				NON-INFRINGEMENT, ACCURACY, AND QUIET ENJOYMENT. THE OPERATOR DOES NOT WARRANT THAT THE
				SERVICE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS, OR THAT
				ANY STAR, CREDIT, OR LEDGER ENTRY WILL REMAIN AVAILABLE.
			</p>
			<p>
				Some jurisdictions do not allow the exclusion of certain warranties, so some of the above
				may not apply to you. Nothing in these Terms excludes non-waivable consumer rights.
			</p>

			<h2>10. Limitation of liability</h2>
			<p>
				TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE OPERATOR AND ITS CONTRACTORS, SUPPLIERS, AND
				LICENSORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
				EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL,
				REPUTATION, GITHUB ACCOUNT ACCESS, OR BUSINESS OPPORTUNITY, ARISING OUT OF OR RELATING TO
				THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
			</p>
			<p>
				TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE OPERATOR&apos;S TOTAL AGGREGATE LIABILITY FOR
				ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE
				AMOUNT YOU PAID THE OPERATOR FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE EVENT GIVING
				RISE TO THE CLAIM, OR (B) USD $50. BECAUSE THE SERVICE IS CURRENTLY FREE, THIS WILL USUALLY
				BE USD $50. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS, SO PARTS OF THIS SECTION
				MAY NOT APPLY TO YOU.
			</p>

			<h2>11. Indemnity</h2>
			<p>
				To the maximum extent permitted by law, you agree to indemnify, defend, and hold harmless
				the operator and its contractors, suppliers, and licensors from and against any claims,
				liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of
				or relating to your use of the service, your repository or content, your violation of these
				Terms or the Acceptable Use Rules, or your violation of any law or third-party right,
				including GitHub&apos;s policies. The operator may assume the defense of any matter subject
				to this section, and you agree to cooperate.
			</p>

			<h2>12. Changes to the service or these Terms</h2>
			<p>
				The operator may modify the service, add or remove features, change the credit mechanics, or
				update these Terms from time to time. Material changes will be announced on the website or
				by email where appropriate. The updated Terms will be effective when posted, and the
				&quot;Last updated&quot; date will change. If you continue to use the service after the
				effective date, you accept the updated Terms. If you do not agree, stop using the service
				and delete your account.
			</p>

			<h2>13. Governing law and disputes</h2>
			<p>
				These Terms are governed by the laws of <strong>{OPERATOR_JURISDICTION}</strong>, without
				regard to conflict-of-law rules. Subject to any non-waivable consumer protections, you and
				the operator agree to the exclusive jurisdiction of the courts located in{" "}
				<strong>{OPERATOR_JURISDICTION}</strong> for any dispute arising out of or relating to the
				service.
			</p>
			<p>
				Before filing a claim, please contact <strong>{OPERATOR_CONTACT}</strong> and allow a
				reasonable opportunity to resolve the issue informally. Nothing in this section prevents
				either party from seeking urgent injunctive relief or from bringing a claim in a court where
				mandatory law requires it.
			</p>

			<h2>14. General</h2>
			<p>
				If any provision of these Terms is held unenforceable, the remaining provisions remain in
				effect. A failure to enforce a provision is not a waiver. You may not assign these Terms
				without the operator&apos;s written consent; the operator may assign them in connection with
				a merger, acquisition, or transfer of the service. These Terms and the documents
				incorporated by reference are the entire agreement between you and the operator regarding
				the service. There is no agency, partnership, joint venture, or employment relationship
				between you and the operator.
			</p>

			<h2>15. Contact</h2>
			<p>
				Questions about these Terms should be sent to <strong>{OPERATOR_CONTACT}</strong>. Legal
				notices should be sent to <strong>{OPERATOR_NAME}</strong>,{" "}
				<strong>{OPERATOR_ADDRESS}</strong>. The operator may also provide notices to you through
				the service or the email address associated with your GitHub account.
			</p>

			<p className="text-[10px] text-muted/60">
				Last updated {LEGAL_LAST_UPDATED}. This is a template document. It has not been reviewed by
				counsel and does not constitute legal advice.
			</p>
		</LegalShell>
	);
}
