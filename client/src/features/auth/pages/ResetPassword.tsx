import {useState} from "react";
import {useResetPassword} from "../hooks/authHooks.ts";
import * as React from "react";

export default function ResetPassword() {
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token') || '';
  const {mutateAsync: resetPassword, isPending} = useResetPassword();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({token, password: formData.password});
      alert("Password reset successful! You can now log in.");
    } catch (err: any) {
      alert(err.message || 'Password reset failed. Please try again.');
    }
  }


  return (
    <>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>New Password: </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>

        <div>
          <label>Confirm Password: </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
          />
        </div>

        <button disabled={isPending} type="submit">Reset Password</button>
      </form>
    </>
  )
}