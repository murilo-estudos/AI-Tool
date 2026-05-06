import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthNavbar from '../components/AuthNavbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado local para o Dark Mode (ajuste conforme sua lógica global se necessário)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || !savedTheme; // Padrão escuro se não houver salvo
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Bem-vindo de volta!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao acessar: Verifique suas credenciais.');
    }
  }

  return (
    <div className="auth-page">
      {/* Agora as variáveis darkMode e toggleDarkMode existem no escopo */}
      <AuthNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-card">
          <div className="auth-header">
            <LogIn size={42} className="auth-logo-icon" />
            <h2>Login</h2>
            <p>Bem-vindo de volta!</p>
          </div>

          <div className="auth-form-content">
            <div className="input-group">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="E-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
          <div className="input-group">
              <Lock size={18} />
              <input 
                type={showPassword ? "text" : "password"} // Alterna o tipo
                placeholder="Senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn-primary">
              Entrar na plataforma
            </button>
          </div>

          <div className="auth-footer">
            <p>Não tem conta? <Link to="/register">Cadastre-se</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}