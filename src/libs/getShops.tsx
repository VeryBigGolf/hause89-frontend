export default async function getShops() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shops`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shops');
  }

  return await response.json();
}
