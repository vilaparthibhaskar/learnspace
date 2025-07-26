import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {changeAddress, changeEmail, changePhoneNumber, changeUserName, changeRole } from "../store/slices/userSlice";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleSubmit = (e) => {
  e.preventDefault();

  fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(async (res) => {
      console.log(res);
      if (!res.ok) {
        const errorText = await res.text();
        console.log("this is your " + errorText);
        throw new Error(errorText || 'Login failed');
      }
      return res.json();
    })
    .then(data => {
      const {userName, email, address, PhoneNumber, role} = data;
      if (data.token) {
        localStorage.setItem('jwt', data.token);
        dispatch(changeUserName(userName))
        dispatch(changeAddress(address))
        dispatch(changeEmail(email))
        dispatch(changePhoneNumber(PhoneNumber))
        dispatch(changeRole(role))
        alert('Login successful!');
        navigate('/home');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Invalid credentials. Please try again.');
    });
};

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header text-center">
              <h3>Login</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Login
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <small>
                Dont Have an Account
                    <Link to="/signup">
                        {" "}Register
                    </Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
