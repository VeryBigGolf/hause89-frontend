export default async function updateShop(
  token: string,
  id: string,
  shopData: {
    name?: string;
    address?: string;
    tel?: string;
    openTime?: string;
    closeTime?: string;
  }
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shops/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(shopData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update shop');
  }

  return await response.json();
}
