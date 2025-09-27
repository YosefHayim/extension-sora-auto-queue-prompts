"use server";

export const handleRegister = async (formData: FormData) => {
  // In a real application, you would handle user registration here.
  // This is a simplified example.
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  console.log("Registering user:", { username, email, password, confirmPassword });

  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return { error: errorData.message || 'Registration failed' };
  }
  console.log(response)
  // Registration successful
  // Add your registration logic here (e.g., API calls, database operations)
  // You might want to return a success/error message.
};