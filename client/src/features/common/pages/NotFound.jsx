import {useNavigate} from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <button onClick={() => navigate('/')}>Go to Home</button>
    </div>
  );
}