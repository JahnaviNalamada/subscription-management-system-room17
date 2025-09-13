import React, { useState, useEffect } from 'react';

// --- STYLES ---
// All styles are in this single block as requested, instead of a separate .css file.
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --primary-color: #4f46e5;
      --primary-hover-color: #4338ca;
      --background-color: #f3f4f6;
      --card-background-color: #ffffff;
      --text-color: #111827;
      --subtle-text-color: #6b7280;
      --border-color: #d1d5db;
      --error-color: #ef4444;
      --success-color: #22c55e;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
      display: grid;
      place-items: center;
      min-height: 100vh;
      line-height: 1.5;
    }

    /* Animation for the card */
    @keyframes slideUpFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-container {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      background-color: var(--card-background-color);
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      animation: slideUpFadeIn 0.5s ease-out forwards;
    }
    
    /* Responsive adjustments for smaller screens */
    @media (max-width: 480px) {
      .login-container {
        max-width: 100%;
        height: 100vh;
        border-radius: 0;
        box-shadow: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .login-header p {
      color: var(--subtle-text-color);
    }
    
    /* --- RoleSelector Component Styles --- */
    .role-selector {
      display: flex;
      background-color: var(--background-color);
      border-radius: 0.5rem;
      padding: 0.25rem;
      margin-bottom: 1.5rem;
    }

    .role-button {
      flex: 1;
      padding: 0.75rem 0;
      border: none;
      background-color: transparent;
      color: var(--subtle-text-color);
      font-weight: 600;
      font-size: 0.875rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .role-button.active {
      background-color: var(--card-background-color);
      color: var(--primary-color);
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    
    /* --- LoginForm Component Styles --- */
    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    }

    .error-message {
      color: var(--error-color);
      font-size: 0.875rem;
      margin-top: 0.25rem;
      min-height: 1.25rem; /* Prevents layout shift */
    }

    .remember-me {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }
    
    .remember-me label {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: var(--subtle-text-color);
    }

    .remember-me input[type="checkbox"] {
      margin-right: 0.5rem;
      height: 1rem;
      width: 1rem;
      cursor: pointer;
    }

    .login-button {
      width: 100%;
      padding: 0.875rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    }

    .login-button:hover {
      background-color: var(--primary-hover-color);
    }

    .login-button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    .form-message {
      margin-top: 1rem;
      text-align: center;
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-weight: 500;
    }
    .form-message.success {
      background-color: #d1fae5;
      color: #065f46;
    }
    .form-message.error {
        background-color: #fee2e2;
        color: #991b1b;
    }

    /* --- AuthModeToggle Component Styles --- */
    .auth-mode-toggle {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.875rem;
        color: var(--subtle-text-color);
    }
    .auth-mode-toggle button {
        background: none;
        border: none;
        color: var(--primary-color);
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        margin-left: 0.25rem;
    }
    .auth-mode-toggle button:hover {
        text-decoration: underline;
    }
  `}</style>
);

// --- RoleSelector Component ---
// Manages the selection between 'User' and 'Admin' roles.
const RoleSelector = ({ selectedRole, onRoleChange }) => {
  return (
    <div className="role-selector">
      <button
        className={`role-button ${selectedRole === 'User' ? 'active' : ''}`}
        onClick={() => onRoleChange('User')}
      >
        User
      </button>
      <button
        className={`role-button ${selectedRole === 'Admin' ? 'active' : ''}`}
        onClick={() => onRoleChange('Admin')}
      >
        Admin
      </button>
    </div>
  );
};

// --- LoginForm Component ---
// Handles input fields, validation, and submission logic for both Login and Sign Up.
const AuthForm = ({ role, mode, onSubmit }) => {
  // State for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // State for validation errors and submission status
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear form and errors when mode changes (login <-> signup)
  useEffect(() => {
      setName('');
      setEmail('');
      setPhone('');
      setErrors({});
  }, [mode]);

  // Client-side validation function
  const validateForm = () => {
    const newErrors = {};
    if (mode === 'signup' && !name.trim()) {
        newErrors.name = 'Name is required.';
    }
    if (!email.trim()) {
        newErrors.email = 'Email is required.';
    } else if (!email.includes('@')) {
        newErrors.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    
    const formData = mode === 'signup' 
        ? { role, name, email, phone }
        : { role, email, phone };

    await onSubmit(formData); // Pass data to parent handler

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {mode === 'signup' && (
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="e.g. Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {errors.email && <p className="error-message">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          placeholder="10-digit number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          maxLength="10"
          required
        />
        {errors.phone && <p className="error-message">{errors.phone}</p>}
      </div>
      
      {mode === 'login' && (
        <div className="remember-me">
            <label>
            <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
            </label>
        </div>
      )}

      <button type="submit" className="login-button" disabled={isSubmitting}>
        {isSubmitting
          ? mode === 'login' ? 'Logging In...' : 'Signing Up...'
          : mode === 'login' ? `Login as ${role}` : `Sign Up as ${role}`
        }
      </button>
    </form>
  );
};

// --- AuthModeToggle Component ---
// Displays text and a button to switch between login and signup modes.
const AuthModeToggle = ({ mode, onToggle }) => {
    const text = mode === 'login' 
        ? "Don't have an account?"
        : "Already have an account?";
    const buttonText = mode === 'login' ? 'Sign Up' : 'Login';

    return (
        <div className="auth-mode-toggle">
            {text}
            <button onClick={onToggle}>{buttonText}</button>
        </div>
    );
};


// --- LoginPage Component ---
// The main container component for the login page.
const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('User'); // Default role
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [registeredUsers, setRegisteredUsers] = useState([]); // In-memory user store
  const [message, setMessage] = useState({ text: '', type: '' }); // For success/error messages

  // Function to handle user sign-up
  const handleSignUp = (userData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Check if user already exists
            const userExists = registeredUsers.some(user => user.email === userData.email);
            if (userExists) {
                setMessage({ text: 'An account with this email already exists.', type: 'error' });
            } else {
                setRegisteredUsers([...registeredUsers, userData]);
                setMessage({ text: 'Sign up successful! Please log in to continue.', type: 'success' });
                setAuthMode('login'); // Switch to login view after successful signup
            }
            resolve();
        }, 1000);
    });
  };

  // Function to handle user login
  const handleLogin = (userData) => {
     return new Promise(resolve => {
        setTimeout(() => {
            // Check if credentials match a registered user
            const userFound = registeredUsers.find(
                user => user.email === userData.email && user.phone === userData.phone && user.role === userData.role
            );
            if (userFound) {
                 const redirectPath = userFound.role === 'Admin' 
                    ? 'Admin Dashboard' 
                    : 'User Subscriptions Page';
                const successMsg = `Login successful! As an "${userFound.role}", you would be redirected to the ${redirectPath}.`;
                setMessage({ text: successMsg, type: 'success' });
            } else {
                setMessage({ text: 'Invalid credentials or role mismatch. Please try again.', type: 'error' });
            }
            resolve();
        }, 1000);
    });
  };
  
  // Clear message when auth mode or role changes
  useEffect(() => {
    setMessage({ text: '', type: '' });
  }, [authMode, selectedRole]);

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
        <p>Please {authMode === 'login' ? 'select your role and sign in.' : 'fill in the details to register.'}</p>
      </div>
      <RoleSelector
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />
      
      {message.text && (
        <div className={`form-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <AuthForm 
        role={selectedRole} 
        mode={authMode} 
        onSubmit={authMode === 'login' ? handleLogin : handleSignUp}
      />

      <AuthModeToggle 
        mode={authMode}
        onToggle={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
      />
    </div>
  );
};


// --- App Component (Root) ---
// This is the main entry point of the application.
export default function App() {
  return (
    <>
      <GlobalStyles />
      <LoginPage />
    </>
  );
}
