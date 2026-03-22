export default async function createShop(
  token: string,
  shopData: {
    name: string;
    address: string;
    tel: string;
    openTime: string;
    closeTime: string;
  }
) {
  const baseUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:5000/api/v1';
  const endpoint = `${baseUrl}/shops`;
  const normalizedToken = token.replace(/^Bearer\s+/i, '').trim();

  if (!normalizedToken) {
    throw new Error('Missing auth token. Please log out and log in again.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${normalizedToken}`,
    },
    body: JSON.stringify(shopData),
  });

  if (!response.ok) {
    const rawBody = await response.text();
    const errorData = (() => {
      try {
        return rawBody ? JSON.parse(rawBody) : {};
      } catch {
        return {};
      }
    })();

    const authMessage =
      response.status === 401 || response.status === 403
        ? 'Your session is invalid or does not have admin access. Please sign in again with an admin account.'
        : '';

    const errorMessage =
      authMessage ||
      errorData.message ||
      errorData.error ||
      (Array.isArray(errorData.errors)
        ? errorData.errors
            .map((e: { msg?: string; message?: string }) => e.msg || e.message)
            .filter(Boolean)
            .join(', ')
        : '') ||
      rawBody ||
      'Failed to create shop';

    console.error('createShop failed', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      requestBody: shopData,
      responseBody: rawBody,
      parsedError: errorData,
    });

    throw new Error(errorMessage);
  }

  return await response.json();
}
