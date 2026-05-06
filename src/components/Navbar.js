import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
// Adicionei Menu e X do lucide-react aqui:
import { LogOut, FileText, AlignLeft, RefreshCw, MessageSquare, Sun, Moon, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, setOutput }) {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (setOutput) setOutput('');
    setIsSidebarOpen(false); // Fecha o menu automaticamente ao clicar em um item no mobile
  };

return (
  <>
    <div className="mobile-top-bar">
      <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Menu">
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className="mobile-logo">AI Tool</div>
      <button onClick={toggleTheme} className="theme-toggle-btn-mobile">
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>

    {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

    <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="logo-section">
        <div className="logo">AI Tool</div>
        <button onClick={toggleTheme} className="theme-toggle-btn desktop-only" title="Trocar Tema">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="menu-items">
        <button 
          onClick={() => handleTabChange('chat')} 
          className={activeTab === 'chat' ? 'active' : ''}
        >
          <MessageSquare size={20} /> Chat AI
        </button>
        <button 
          onClick={() => handleTabChange('gerar')} 
          className={activeTab === 'gerar' ? 'active' : ''}
        >
          <FileText size={20} /> Gerar Texto
        </button>
        <button 
          onClick={() => handleTabChange('resumir')} 
          className={activeTab === 'resumir' ? 'active' : ''}
        >
          <AlignLeft size={20} /> Resumir
        </button>
        <button 
          onClick={() => handleTabChange('reescrever')} 
          className={activeTab === 'reescrever' ? 'active' : ''}
        >
          <RefreshCw size={20} /> Reescrever
        </button>
      </div>

      <button className="logout-btn" onClick={logout}>
        <LogOut size={20} /> Sair
      </button>
    </nav>
  </>
);
}