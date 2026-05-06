import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthNavbar from '../components/AuthNavbar';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para o Dark Mode sincronizado com o localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || !savedTheme;
  });

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Aplica a classe no body e salva a preferência
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
      await signup(email, password);
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Falha ao criar conta: ' + error.message);
    }
  }

  return (
    <div className="auth-page">
      <AuthNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-card">
          <div className="auth-header">
            <UserPlus size={42} className="auth-logo-icon" />
            <h2>Criar Conta</h2>
            <p>Junte-se a nós para começar!</p>
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
              Registrar agora
            </button>
          </div>

          <div className="auth-footer">
            <p>Já tem uma conta? <Link to="/login">Entrar</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}