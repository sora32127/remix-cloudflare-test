import { ActionFunctionArgs, json } from "@remix-run/node";

const CF_TURNSTILE_SECRET_KEY = process.env.CF_TURNSTILE_SECRET_KEY;
const CF_TURNSTILE_VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";


export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  if (!token) {
    return json({ success: false, message: "token is required" });
  }

  if (!CF_TURNSTILE_SECRET_KEY) {
    return json({ success: false, message: "CF_TURNSTILE_SECRET_KEY is required" });
  }

  const verifyResponse = await fetch(CF_TURNSTILE_VERIFY_ENDPOINT, {
    method: 'POST',
    body: `secret=${encodeURIComponent(CF_TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  })
  const verifyData = await verifyResponse.json();
  if (verifyData.success) {
    return json({ success: true, message: "ok" });
  }
  return json({ success: false, message: "failed" });
}
