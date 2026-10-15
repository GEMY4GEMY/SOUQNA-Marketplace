export function smsReady(): boolean {
  return process.env.SMS_PROVIDER === "twilio" &&
    Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID));
}

export async function sendRegistrationCode(phone: string, code: string): Promise<void> {
  if (!smsReady()) throw new Error("SMS_UNAVAILABLE");
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const params = new URLSearchParams({
    To: "+2" + phone,
    Body: "SOUQNA verification code: " + code + ". Valid for 5 minutes."
  });
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) params.set("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
  else params.set("From", process.env.TWILIO_FROM!);
  const response = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + encodeURIComponent(sid) + "/Messages.json", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(sid + ":" + process.env.TWILIO_AUTH_TOKEN).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString(),
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error("SMS_SEND_FAILED");
}
