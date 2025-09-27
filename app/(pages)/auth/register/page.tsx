"use client";

import { useState } from "react";
import { handleRegister } from "./action";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <div>
      <h1>Register</h1>
      <form action={handleRegister}>
        <div>
          <label htmlFor="username">Username:</label>
          <input id="username" name="username" onChange={handleChange} required type="text" value={formData.username} />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" onChange={handleChange} required type="email" value={formData.email} />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" onChange={handleChange} required type="password" value={formData.password} />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input id="confirmPassword" name="confirmPassword" onChange={handleChange} required type="password" value={formData.confirmPassword} />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
