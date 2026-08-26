import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const EMAIL_TIMEOUT_MS = 10_000;

interface ResendResponse {
  id?: unknown;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  idempotencyKey: string;
}

export interface EmailSettings {
  from: string;
  notificationTo: string;
  replyTo: string;
}

export class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

export class EmailDeliveryError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`The email provider returned HTTP ${status}.`);
    this.name = "EmailDeliveryError";
    this.status = status;
  }
}

export function isEmailDeliveryEnabled(): boolean {
  return process.env.CONTACT_EMAIL_PROVIDER?.toLowerCase() === "resend";
}

export function getEmailSettings(): EmailSettings {
  if (!isEmailDeliveryEnabled()) {
    throw new EmailConfigurationError(
      'CONTACT_EMAIL_PROVIDER must be set to "resend".'
    );
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const notificationTo =
    process.env.CONTACT_TO_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim();

  if (!process.env.RESEND_API_KEY?.trim()) {
    throw new EmailConfigurationError("RESEND_API_KEY is not configured.");
  }
  if (!from) {
    throw new EmailConfigurationError("RESEND_FROM_EMAIL is not configured.");
  }
  if (!notificationTo) {
    throw new EmailConfigurationError(
      "CONTACT_TO_EMAIL or ADMIN_EMAIL must be configured."
    );
  }

  const replyTo =
    process.env.RESEND_REPLY_TO_EMAIL?.trim() || notificationTo;

  return { from, notificationTo, replyTo };
}

export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const settings = getEmailSettings();
  if (!apiKey) {
    throw new EmailConfigurationError("RESEND_API_KEY is not configured.");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey.slice(0, 256),
    },
    body: JSON.stringify({
      from: settings.from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
      reply_to: input.replyTo,
    }),
    signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
  });

  if (!response.ok) {
    // Do not expose provider response bodies, which can contain addresses or content.
    throw new EmailDeliveryError(response.status);
  }

  const payload = (await response.json()) as ResendResponse;
  if (typeof payload.id !== "string" || !payload.id) {
    throw new EmailDeliveryError(502);
  }

  return { id: payload.id };
}
