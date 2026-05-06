import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {RefreshCw, Send, Trash2, Copy, RotateCcw, Eraser } from 'lucide-react';
import { sendMessageGroq } from '../config/groq'; 
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';

// Importações do Firebase - padrão npm
import { db } from '../config/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); 
  const [output, setOutput] = useState(() => {
  const salvo = localStorage.getItem('dashboard_outputs');
  return salvo ? JSON.parse(salvo) : { resumir: '', gerar: '', reescrever: '' };
  });
  const [loading, setLoading] = useState(false);
  const {currentUser } = useAuth();
  
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 1. CARREGAR MENSAGENS (MEMÓRIA)
  useEffect(() => {
    if (!currentUser) return;

    const docRef = doc(db, 'conversas', currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().historico || []);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

   // APAGAR MENSAGENS

const limparChat = () => {
  toast((t) => (
    <div className="confirm-toast-container">
      <strong>Apagar histórico?</strong>
      <p>Esta ação não pode ser desfeita.</p>
      
      <div className="toast-button-group">
        <button
          className="btn-toast-confirm"
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              const docRef = doc(db, 'conversas', currentUser.uid);
              await setDoc(docRef, { historico: [] }, { merge: true });
              setMessages([]);
              toast.success('Conversa limpa!', { icon: '🗑️' });
            } catch (e) {
              toast.error('Erro ao limpar histórico.');
            }
          }}
        >
          Confirmar
        </button>

        <button 
          className="btn-toast-cancel" 
          onClick={() => toast.dismiss(t.id)}
        >
          Cancelar
        </button>
      </div>
    </div>
  ), {
    id: 'confirm-clear',
  });
};

  // 2. SALVAR MENSAGENS
  const salvarNoFirebase = async (novasMensagens) => {
    try {
      const docRef = doc(db, 'conversas', currentUser.uid);
      await setDoc(docRef, { historico: novasMensagens }, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
    }
  };

  // Ajuste automático da altura do textarea
    useEffect(() => {
        if (textareaRef.current) {
        // Primeiro resetamos a altura para 'auto' para ele encolher se o texto for deletado
        textareaRef.current.style.height = "auto"; 
        
        // Agora calculamos a altura baseada no conteúdo
        const scrollHeight = textareaRef.current.scrollHeight;
        
        // Aplicamos a altura, respeitando um mínimo de 45px e máximo de 150px
        const newHeight = input === '' ? 45 : Math.min(scrollHeight, 150);
        textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [input]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
  localStorage.setItem('dashboard_outputs', JSON.stringify(output));
  }, [output]);

async function handleAction(tipo) {
  if (!input.trim()) return toast.error("Digite algo primeiro!");
  setLoading(true);
  try {
    const response = await sendMessageGroq(input, [], tipo);
    
    setOutput(prev => ({
      ...prev,
      [tipo]: response
    }));

  } catch (error) {
    console.error("Erro na ação:", error);
    toast.error("Erro ao processar com a IA.");
  } finally {
    setLoading(false);
  }
}
async function handleChat() {
    if (!input.trim() || !currentUser || loading) return;

    
    const textoParaEnviar = input;
    const userMessage = { role: 'user', text: textoParaEnviar };
    const novasMensagensComUsuario = [...messages, userMessage];
    
    setMessages(novasMensagensComUsuario);
    salvarNoFirebase(novasMensagensComUsuario);
    
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await sendMessageGroq(textoParaEnviar, messages, 'chat');
      
      const assistantMessage = { role: 'model', text: aiResponse };
      const historicoFinal = [...novasMensagensComUsuario, assistantMessage];
      
      setMessages(historicoFinal);
      salvarNoFirebase(historicoFinal);
    } catch (error) {
      console.error(error);
      const msgErro = error.message?.includes('429') 
        ? "Muitas mensagens! A Groq pediu um segundinho." 
        : "Erro ao contatar o chat.";
      toast.error(msgErro);
    } finally {
      setLoading(false);
    }
  }

const renderContent = () => {
    if (activeTab === 'chat') {
      return (
        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 && (
              <p className="empty-chat">
                Conversando com <strong>Llama 3.3 (via Groq)</strong>...
              </p>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.role}`}>
                <div className="message-content">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className="chat-input-area">
            <textarea 
              ref={textareaRef}
              className="chat-textarea-auto"
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
            />
            <button onClick={handleChat} disabled={loading || !input.trim()} className="send-btn">
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      );
    }

const copiarTextoCru = (texto) => {
  // 1. Remove negritos e itálicos: **texto**, __texto__, *texto*, _texto_
  let textoLimpo = texto.replace(/(\*\*|__)(.*?)\1/g, '$2');
  textoLimpo = textoLimpo.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // 2. Remove cabeçalhos: # Título, ## Subtítulo
  textoLimpo = textoLimpo.replace(/^#+\s+/gm, '');
  
  // 3. Remove blocos de código e crases: ```code```, `code`
  textoLimpo = textoLimpo.replace(/`{1,3}.*?`{1,3}/g, '');
  
  // 4. Remove links: [texto](url) -> mantém apenas o texto
  textoLimpo = textoLimpo.replace(/\[(.*?)\]\(.*?\)/g, '$1');

  // Copia para o clipboard
  navigator.clipboard.writeText(textoLimpo);
  toast.success("Texto limpo copiado!", { icon: '📋' });
};

return (
      <div className="tools-grid">
        <div className="tool-input-section">
          <div className="section-header">
            <label className="section-label">Entrada</label>
            <button 
              className="btn-icon-small" 
              onClick={() => setInput('')} 
              title="Limpar entrada"
            >
              <Eraser size={14} />
            </button>
          </div>
          <textarea 
            placeholder={`Insira o texto para ${activeTab}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="tool-textarea-split"
          />
          <button 
            onClick={() => handleAction(activeTab)} 
            disabled={loading} 
            className="btn-execute-tool"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Executar Tarefa'}
          </button>
        </div>

        <div className="tool-output-section">
        <div className="section-header">
          <label className="section-label">Resultado</label>
          {/* Verificamos se existe conteúdo para a aba ATIVA especificamente */}
          {output[activeTab] && (
            <div className="output-actions">
              <button onClick={() => handleAction(activeTab)} title="Refazer" className="btn-icon-action">
                <RotateCcw size={16} />
              </button>
              <button onClick={() => copiarTextoCru(output[activeTab])} title="Copiar" className="btn-icon-action">
                <Copy size={16} /> 
              </button>
              <button 
                onClick={() => setOutput(prev => ({ ...prev, [activeTab]: '' }))} 
                title="Apagar" 
                className="btn-icon-action delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="output-card">
          {!output[activeTab] && !loading && (
            <div className="empty-output">O resultado aparecerá aqui...</div>
          )}
          {loading && (
            <div className="loading-output">Processando com Llama 3.1...</div>
          )}
          {output[activeTab] && (
            <div className="result-text-markdown">
              <ReactMarkdown>{output[activeTab]}</ReactMarkdown>
            </div>
          )}
        </div>
        </div>
      </div>
    );
  };

return (
    <div className="dashboard-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} setOutput={setOutput} />
      <main className="main-content">
        <header className="main-header">
          <div className="header-info">
            <h1>{activeTab === 'chat' ? 'Chat Inteligente' : activeTab.toUpperCase()}</h1>
          </div>
          {activeTab === 'chat' && (
            <button onClick={limparChat} className="btn-clear-chat">
              <Trash2 size={18} />
              <span>Nova Conversa</span>
            </button>
          )}
        </header>
        {renderContent()}
      </main>
    </div>
  );
}