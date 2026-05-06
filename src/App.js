import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Importação das Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // Vamos criar a estrutura de abas aqui

// Importação do CSS
import './index.css';
import './auth.css';
import './dashboard.css';

// Componente de Rota Protegida
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    // Se não estiver logado, manda para o Login
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-center" 
          toastOptions={{
            // Aplica a classe para toasts simples (success, error)
            className: 'react-hot-toast-custom', 
            // Garante que o estilo inline também siga o tema se a classe falhar
            style: {
              background: 'var(--card-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--input-border)',
            },
          }} 
        />
        
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Privadas (Só acessa se estiver logado) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Redirecionamento Padrão: Se a rota não existir ou for a raiz, vai para o dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Opcional: Rota 404 */}
          <Route path="*" element={<div style={{padding: '20px'}}>Página não encontrada</div>} />
        </Routes>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;