import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useSendEmailToResetPassword} from "../hooks/authHooks.ts";
import * as React from "react";

export default function ForgetPassword () {
  const navigate = useNavigate();
  const {mutateAsync: sendEmailToResetPassword, isPending} = useSendEmailToResetPassword()

  const [form, setForm] = useState({
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await sendEmailToResetPassword(form.email);
    } catch (err: any) {
      alert(err.message || 'Login failed. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forget password?</h2>
      <br/>

      <div>
        <label>Email: </label>
        <input
          value={form.email}
          onChange={(e) => {
            setForm({...form, email: e.target.value})
          }}
        />
      </div>

      <br/>

      <button
        disabled={isPending}
        type={"submit"}
      >
        Submit
      </button>
      <br/>
      <br/>

      <p>Already have an account?</p>
      <button
        type={"button"}
        onClick={() => navigate('/login')}
      >
        Login
      </button>

      <p>Don't have an account?</p>
      <button
        type={"button"}
        onClick={() => navigate('/register')}
      >
        Register
      </button>
    </form>
  )

}