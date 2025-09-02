import { getSession } from "next-auth/react";

export async function fetchFromBackend(endpoint, options = {}) {
  const session = await getSession();
  console.log("session", session);
  if (!session) throw new Error("Not authenticated");

  // Check if body is FormData
  const isFormData = options.body instanceof FormData;

  const config = {
    method: options.method || "GET",
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session?.user?.idToken}`,
    },
  };

  // Handle body and Content-Type
  if (options.body) {
    if (isFormData) {
      // For FormData, don't set Content-Type - let browser set it with boundary
      config.body = options.body;
    } else {
      // For JSON data, ensure proper Content-Type and body handling
      config.headers["Content-Type"] = "application/json";
      config.body =
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body);
    }
  }

  console.log("Fetch config:", {
    url: `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`,
    method: config.method,
    headers: config.headers,
    bodyType: isFormData ? "FormData" : "JSON",
    bodyLength: config.body ? config.body.length : 0,
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`,
    config
  );

  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage;

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || "Backend request failed";
    } catch {
      errorMessage = errorText || "Backend request failed";
    }

    throw new Error(errorMessage);
  }

  return res.json();
}
