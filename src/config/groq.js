import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true 
});

// Configuração dos especialistas
const MODELS = {
    chat: "llama-3.3-70b-versatile",
    text: "llama-3.1-8b-instant" 
};

const SYSTEM_PROMPTS = {
    chat: "Você é um assistente prestativo, amigável e rápido.",
    gerar: "Você é um redator profissional. Escreva textos claros, envolventes e bem estruturados seguindo as instruções do usuário.",
    resumir: "Você é um especialista em síntese. Seu objetivo é extrair as ideias principais de textos longos de forma concisa e objetiva.",
    reescrever: "Você é um especialista em linguística. Reescreva o texto do usuário melhorando o vocabulário e a fluidez, mantendo o sentido original."
};

export const sendMessageGroq = async (message, history = [], mode = 'chat') => {
    try {
        // Seleciona o modelo: se for chat usa Llama, se for texto usa Mixtral
        const selectedModel = mode === 'chat' ? MODELS.chat : MODELS.text;
        
        // Seleciona o prompt de sistema baseado na aba/função
        const systemContent = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chat;

        // Formata o histórico (apenas para o Chat)
        const chatHistory = history.slice(-6).map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.text
        }));

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemContent },
                ...(mode === 'chat' ? chatHistory : []), 
                { role: "user", content: message }
            ],
            model: selectedModel,
            temperature: mode === 'chat' ? 0.7 : 0.5, 
            max_tokens: mode === 'chat' ? 2048 : 4096, 
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Erro Groq:", error);
        throw error;
    }
};