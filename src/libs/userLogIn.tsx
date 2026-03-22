export default async function userLogIn(email: string, password: string) {
  const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000/api/v1'}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to login');
  }

  return await response.json();
}
