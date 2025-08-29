import { getSession } from "next-auth/react";

export async function fetchFromBackend(endpoint, options) {
  const session = await getSession();

  if (!session) throw new Error("Not authenticated");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session?.user?.accessToken}`, // 👈 send token
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Backend request failed");
  return res.json();
}
