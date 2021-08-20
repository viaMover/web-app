export function api<T>(url: string, params: RequestInit): Promise<T> {
  return fetch(url, params)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then((res: T) => {
      return res;
    });
}
