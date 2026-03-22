export default async function deleteShop(token: string, id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shops/${id}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete shop');
  }

  return await response.json();
}
