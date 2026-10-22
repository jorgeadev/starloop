export const LEGAL_LAST_UPDATED = "October 22, 2026";
export const LEGAL_VERSION = "1.0";

/**
 * The operator must replace these before a public launch. They are rendered as
 * placeholders on purpose: inventing a legal entity, address, or jurisdiction
 * would be worse than showing that the document is unfinished.
 */
export const OPERATOR_NAME = "[OPERATOR LEGAL NAME]";
export const OPERATOR_CONTACT = "[CONTACT EMAIL]";
export const OPERATOR_ADDRESS = "[OPERATOR POSTAL ADDRESS]";
export const OPERATOR_JURISDICTION = "[JURISDICTION]";

export const legalDocuments = [
	{ href: "/legal", label: "Trust center" },
	{ href: "/terms", label: "Terms of service" },
	{ href: "/privacy", label: "Privacy policy" },
	{ href: "/acceptable-use", label: "Acceptable use" },
];
