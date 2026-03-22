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
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(shopData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create shop');
  }

  return await response.json();
}
