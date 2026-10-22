import {
	createCipheriv,
	createDecipheriv,
	createHash,
	createHmac,
	randomBytes,
	timingSafeEqual,
} from "node:crypto";

const ENCRYPTION_VERSION = "v1";

function authSecret(): string {
	const secret = process.env.AUTH_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error(
			"AUTH_SECRET must be set to at least 32 characters. See the private environment template provided by the repository owner.",
		);
	}
	return secret;
}

function encryptionKey(): Buffer {
	const raw = process.env.TOKEN_ENCRYPTION_KEY;
	if (!raw) {
		throw new Error(
			"TOKEN_ENCRYPTION_KEY is required. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
		);
	}
	const key = Buffer.from(raw, "base64");
	if (key.length !== 32) {
		throw new Error("TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
	}
	return key;
}

/** AES-256-GCM. The IV is unique per secret; the tag detects tampering. */
export function encryptSecret(plaintext: string): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
	const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return [
		ENCRYPTION_VERSION,
		iv.toString("base64url"),
		tag.toString("base64url"),
		encrypted.toString("base64url"),
	].join(".");
}

export function decryptSecret(payload: string): string {
	const [version, iv, tag, data] = payload.split(".");
	if (version !== ENCRYPTION_VERSION || !iv || !tag || !data) {
		throw new Error("Unsupported encrypted token format.");
	}
	const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
	decipher.setAuthTag(Buffer.from(tag, "base64url"));
	return Buffer.concat([
		decipher.update(Buffer.from(data, "base64url")),
		decipher.final(),
	]).toString("utf8");
}

export function randomToken(bytes = 32): string {
	return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
	return createHash("sha256").update(value).digest("hex");
}

export function hmac(value: string, secret = authSecret()): string {
	return createHmac("sha256", secret).update(value).digest("base64url");
}

export function signValue(value: string): string {
	return `${value}.${hmac(value)}`;
}

export function unsignValue(signed: string): string | null {
	const separator = signed.lastIndexOf(".");
	if (separator < 1) return null;
	const value = signed.slice(0, separator);
	const signature = signed.slice(separator + 1);
	const expected = hmac(value);
	const a = Buffer.from(signature);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	return value;
}

export function hashIdentifier(value: string): string {
	return hmac(`identifier:${value}`).slice(0, 32);
}

export function safeEqual(a: string, b: string): boolean {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
}

export function tokenHint(token: string): string {
	return `•••• ${token.slice(-4)}`;
}
