import useSWR from "swr";

export const fetcher = async <TResponse>(
  url: string,
  options?: RequestInit,
): Promise<TResponse> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers, // Allow custom headers
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        errorBody,
      }),
    );
  }

  return (await response.json()) as Promise<TResponse>;
};

export const useQuery = <TResponse>(
  url: string,
  options?: RequestInit, // Optional fetch configuration
) => {
  return useSWR<TResponse, Error>(url, (url: string) =>
    fetcher<TResponse>(url, options),
  );
};
