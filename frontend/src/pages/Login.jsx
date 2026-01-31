import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      const res = await fetch('https://my-farm-app-2n3x.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        

        const displayName = data.user.businessName || data.user.email;
        
       
        localStorage.setItem('userName', displayName);
    

        navigate('/dashboard'); 
      } else {
        setError(data.message); 
      }
    } catch (err) {
      setError("Server eka sambanda kara ganna ba. Backend run wenawada?");
    }
  };

  // --- STYLEs---
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
      borderRadius: '16px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
      width: '100%',
      maxWidth: '400px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#166534', 
      fontSize: '24px',
      fontWeight: 'bold',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#374151',
      fontSize: '14px',
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '16px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s',
    },
    forgotPassword: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '20px',
    },
    forgotLink: {
      color: '#dc2626', 
      textDecoration: 'none',
      fontSize: '13px',
      cursor: 'pointer',
    },
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#16a34a', 
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    footer: {
      marginTop: '25px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#6b7280',
    },
    registerLink: {
      color: '#16a34a',
      textDecoration: 'none',
      fontWeight: 'bold',
      marginLeft: '5px',
    },
    errorBox: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '10px',
      borderRadius: '6px',
      marginBottom: '20px',
      textAlign: 'center',
      fontSize: '14px',
      border: '1px solid #fecaca',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>🔐 Login to Harvest</h2>
        
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="admin@harvest.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input} 
            />
          </div>

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
          
          <div style={styles.forgotPassword}>
             <a href="#" onClick={() => alert("Admin contact karanna password reset karanna!")} style={styles.forgotLink}>
               Password Amathakada?
             </a>
          </div>

          <button type="submit" style={styles.button} onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'} onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}>
            Login
          </button>
        </form>
        
        <div style={styles.footer}>
          Oya Owner kenekda? 
          <Link to="/register" style={styles.registerLink}>Register Wenna</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;