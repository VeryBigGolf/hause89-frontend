export default async function getAppointments(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';
  // Add populate parameter to get user and shop details
  const response = await fetch(`${baseUrl}/appointments?populate=user,shop`, {
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
