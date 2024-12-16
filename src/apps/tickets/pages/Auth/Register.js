import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://127.0.0.1:8000/api/auth/register/"; // Replace with your actual API endpoint

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|io|co\.in)$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!validateEmail(email)) {
      setErrorMessage(
        "Please enter a valid email address with domains like .com, .io, or .co.in."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setErrorMessage(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    setLoading(true); // Show loading state

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setSuccessMessage("Registration successful! Please login.");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setErrorMessage(""); // Clear any previous error messages
      } else {
        const error = await response.json();
        setErrorMessage(error.detail || "An error occurred during registration.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center align-items-center">
      <div
        className="card shadow-lg"
        style={{ width: "100%", maxWidth: "450px", borderRadius: "10px" }}
      >
        <div className="card-body p-4">
          <h2
            className="card-title text-center mb-4"
            style={{ fontWeight: "bold", color: "#343a40" }}
          >
            Create Account
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaUser />
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {errorMessage && (
              <div className="alert alert-danger text-center p-2" role="alert">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="alert alert-success text-center p-2" role="alert">
                {successMessage}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary w-100"
              style={{ fontWeight: "bold" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <a
              href="/login"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
