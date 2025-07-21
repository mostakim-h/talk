import {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {useLogin} from "../hooks/authHooks.js";
import {useSelector} from "react-redux";

export default function Login() {
  const [form, setForm] = useState({email: 'iamlearner.forme@gmail.com', password: '555555'})
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const {mutateAsync: login, isPending } = useLogin()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await login(form);
    } catch (err) {
      alert(err.message || 'Login failed. Please try again.');
    }
  }

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>

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

      <div>
        <label>Password: </label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => {
            setForm({...form, password: e.target.value})
          }}
        />
      </div>

      <button
        disabled={isPending}
        type={"submit"}
      >
        Login
      </button>
      <br/>
      <p style={{cursor: "pointer"}} onClick={() => navigate('/forget-password')}>Forget password?</p>
      <br/>
      <br/>
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