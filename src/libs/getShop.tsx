export default async function getShop(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shops/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shop');
  }

  return await response.json();
}
