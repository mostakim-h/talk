import {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {useRegister} from "../hooks/authHooks.js";
import {useSelector} from "react-redux";

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const navigate = useNavigate();
  const {user} = useSelector((state) => state.auth);
  const {mutateAsync: register, isPending} = useRegister();

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await register(form);
    } catch (err) {
      alert(err.message || 'Register failed. Please try again.');
    }
  }

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <form onSubmit={handleSubmit}>
      <h1>Register</h1>

      <div>
        <label>First Name: </label>
        <input
          value={form.firstName}
          onChange={(e) => {
            setForm({...form, firstName: e.target.value})
          }}
        />
      </div>

      <div>
        <label>Last Name: </label>
        <input
          value={form.lastName}
          onChange={(e) => {
            setForm({...form, lastName: e.target.value})
          }}
        />
      </div>

      <div>
        <label>Email: </label>
        <input
          value={form.email}
          onChange={(e) => {
            setForm({...form, email: e.target.value})
          }}
        />
      </div>
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
      <div>
        <label>Confirm Password: </label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => {
            setForm({...form, confirmPassword: e.target.value})
          }}
        />
      </div>

      <button
        type={"submit"}
        disabled={isPending}
      >
        Register
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
      <p style={{cursor: "pointer"}} onClick={() => navigate('/forget-password')}>Forget password?</p>
    </form>
  )

}