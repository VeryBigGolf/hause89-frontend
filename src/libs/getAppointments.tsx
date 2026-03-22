export default async function getAppointments(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }

  return await response.json();
}
