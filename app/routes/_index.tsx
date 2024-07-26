import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";

export async function loader(){
  const CF_TURNSTILE_SITE_KEY = process.env.CF_TURNSTILE_SITE_KEY;
  return json({ CF_TURNSTILE_SITE_KEY });
}

export default function Index() {
  const { CF_TURNSTILE_SITE_KEY } = useLoaderData<typeof loader>();

  const [token, setToken] = useState<string>("");
  const [isValidUser, setIsValidUser] = useState<boolean>(false);

  const fetcher = useFetcher();

  const handleTurnstileSuccess = (token: string) => {
    setToken(token);
    setIsValidUser(true);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("token", token);
    fetcher.submit(formData, {
      method: "post",
      action: "/?index",
    });

  }

  if (!CF_TURNSTILE_SITE_KEY) {
    return <p>No CF_TURNSTILE_SITE_KEY found</p>;
  }

  return (
    <>
      <h1>React-Turnstile-Demo</h1>
      <Turnstile siteKey={CF_TURNSTILE_SITE_KEY} onSuccess={(token) => handleTurnstileSuccess(token)} />
      <button
        disabled={!isValidUser}
        onClick={handleSubmit}
        className={`bg-blue-500 text-white px-4 py-2 rounded-md ${!isValidUser ? "bg-gray-200 cursor-not-allowed" : ""}`}>Submit</button>
    </>
 
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();  
  const origin = new URL(request.url).origin;
  const response = await fetch(`${origin}/api/verify`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (data.success) {
    return json({ message: "ok" });
  }

  return json({ message: "error" });
}