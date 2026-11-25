import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          email: email.trim(),
          password
        })
      ).unwrap();

      // Only admin users can access the admin dashboard
      if (result.user.role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (error) {
      // Redux stores and displays the login error
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-heading">
          <h1>Dynamic Form Builder</h1>
          <p>Sign in to manage your forms</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {isAuthenticated && user?.role !== "ADMIN" && (
            <p className="error-message" role="alert">
              Admin access is required.
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
