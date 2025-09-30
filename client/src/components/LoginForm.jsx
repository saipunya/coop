import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // added: prevent double submit
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await login(username, password, remember);
      // Redirect (accounts list is part of dashboard)
      nav('/dashboard');
    } catch (e) {
      if (e.response) {
        setError(e.response.data?.error || 'เข้าสู่ระบบไม่สำเร็จ');
      } else if (e.request) {
        setError('เครือข่ายมีปัญหา กรุณาลองใหม่');
      } else {
        setError('เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{maxWidth:400,margin:'2rem auto'}}>
      <div>
        <label>Username / Member No</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} required autoComplete="username" />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      <div>
        <label>
          <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>
          {' '}Remember Me
        </label>
      </div>
      <button type="submit" disabled={loading} style={{minWidth:120}}>
        {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
      </button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
