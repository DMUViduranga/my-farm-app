import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 1. Validation
    if (password !== confirmPassword) {
      setError("Password deka samana natha!");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, email, password }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Success! Dan Login wenna.");
        navigate('/'); 
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server Error! Backend eka wada da balanna.");
    }
  };

  // --- STYLES  ---
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0fdf4', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
      width: '100%',
      maxWidth: '450px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#166534', 
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#374151',
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '16px',
      outline: 'none',
      boxSizing: 'border-box', // Box model fix
    },
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#16a34a', // Bright Green
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background 0.3s',
    },
    error: {
      color: '#dc2626',
      backgroundColor: '#fef2f2',
      padding: '10px',
      borderRadius: '5px',
      marginBottom: '20px',
      textAlign: 'center',
      fontSize: '14px',
    },
    linkText: {
      textAlign: 'center',
      marginTop: '20px',
      fontSize: '14px',
      color: '#6b7280',
    },
    link: {
      color: '#16a34a',
      textDecoration: 'none',
      fontWeight: 'bold',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>🌾 Register Business</h2>
        
        {/* Error Message eka pennanna */}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleRegister}>
          
          {/* Business Name Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Business Name</label>
            <input 
              type="text" 
              placeholder="Ex: Gamage Harvester"
              value={businessName} 
              onChange={(e) => setBusinessName(e.target.value)} 
              required 
              style={styles.input} 
            />
          </div>

          {/* Email Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input} 
            />
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input} 
            />
          </div>

          {/* Confirm Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              style={styles.input} 
            />
          </div>

          <button type="submit" style={styles.button}>Create Account</button>
        </form>

        <p style={styles.linkText}>
          Already have an account? <Link to="/" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;