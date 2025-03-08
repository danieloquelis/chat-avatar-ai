import useSWRMutation from "swr/mutation";

export const mutation = async <TResponse, TRequest>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: TRequest,
  options?: RequestInit,
): Promise<TResponse> => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  return json as TResponse;
};

export const useMutation = <TResponse, TRequest>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
) => {
  return useSWRMutation<TResponse, Error, string, TRequest>(
    url,
    async (url, { arg }) => mutation<TResponse, TRequest>(url, method, arg),
  );
};
