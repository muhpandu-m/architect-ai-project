import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import "./App.css";

// Message type for chat
interface Message {
   id: string;
   text: string;
   imageUrl?: string;
   sender: "user" | "bot";
}

const N8N_API_URL = "https://n8n.muhpandu.com/webhook/architect-ai-bot-hook"; // Production n8n webhook URL

// ...existing code...

function App() {
   const [messages, setMessages] = useState<Message[]>([]);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [sessionId, setSessionId] = useState<string | null>(null);
   const [chatStarted, setChatStarted] = useState(false);
   const [initialInput, setInitialInput] = useState("");
   const messagesEndRef = useRef<HTMLDivElement | null>(null);
   const inputRef = useRef<HTMLInputElement | null>(null);
   const textareaRef = useRef<HTMLTextAreaElement | null>(null);
   const initialTextareaRef = useRef<HTMLTextAreaElement | null>(null);

   // Start a new chat session
   const startNewSession = () => {
      const newSessionId = Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem("architect_ai_session_id", newSessionId);
      setSessionId(newSessionId);
      setMessages([]);
      setChatStarted(true);
   };

   // Start initial chat with first message
   const startInitialChat = async () => {
      if (!initialInput.trim()) return;

      const newSessionId = Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem("architect_ai_session_id", newSessionId);
      setSessionId(newSessionId);

      const userMsg: Message = {
         id: Date.now() + "-user",
         text: initialInput,
         sender: "user",
      };
      setMessages([userMsg]);
      setChatStarted(true);
      setLoading(true);

      try {
         const res = await fetch(N8N_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               message: initialInput,
               sessionId: newSessionId,
            }),
         });
         const data = await res.json();
         const botMsg: Message = {
            id: Date.now() + "-bot",
            text: data.text,
            imageUrl: data.imageUrl,
            sender: "bot",
         };
         setMessages((msgs) => [...msgs, botMsg]);
      } catch (err) {
         setMessages((msgs) => [
            ...msgs,
            {
               id: Date.now() + "-error",
               text: "Oops, something went wrong with the bot. Try asking again.",
               sender: "bot",
            },
         ]);
      } finally {
         setLoading(false);
      }
   };

   // Regenerate sessionId and clear chat
   const regenerateSession = () => {
      startNewSession();
   };

   // On mount, require user to start chat
   React.useEffect(() => {
      setChatStarted(false);
      setMessages([]);
      setInput("");
      setSessionId(null);
   }, []);

   // Scroll to bottom when messages change
   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   // Auto-resize textarea and expand upward
   useEffect(() => {
      if (textareaRef.current) {
         textareaRef.current.style.height = "auto";
         textareaRef.current.style.height =
            textareaRef.current.scrollHeight + "px";
      }
   }, [input]);

   // Initial textarea stays fixed height (one line)
   // No auto-resize for initial input to keep it single line

   // Send message to n8n
   const sendMessage = async () => {
      if (!input.trim()) return;
      const userMsg: Message = {
         id: Date.now() + "-user",
         text: input,
         sender: "user",
      };
      setMessages((msgs) => [...msgs, userMsg]);
      setLoading(true);
      setInput("");
      // Focus input after sending
      setTimeout(() => {
         inputRef.current?.focus();
      }, 0);
      try {
         const res = await fetch(N8N_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: input, sessionId }),
         });
         const data = await res.json();
         // Expecting bot response: { text: string, imageUrl?: string }
         const botMsg: Message = {
            id: Date.now() + "-bot",
            text: data.text,
            imageUrl: data.imageUrl,
            sender: "bot",
         };
         setMessages((msgs) => [...msgs, botMsg]);
      } catch (err) {
         setMessages((msgs) => [
            ...msgs,
            {
               id: Date.now() + "-error",
               text: "Oops, something went wrong with the bot. Try asking again.",
               sender: "bot",
            },
         ]);
      } finally {
         setLoading(false);
      }
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         sendMessage();
      }
   };

   const handleInitialKeyDown = (
      e: React.KeyboardEvent<HTMLTextAreaElement>
   ) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         startInitialChat();
      }
   };

   return (
      <>
         <div className="chat-title">Make Your Design with AI Assistant</div>
         {!chatStarted ? (
            <div className="initial-chat-container">
               <div className="initial-question">
                  Desain apa yang ingin kamu buat?
               </div>
               <div className="initial-chat-input">
                  <textarea
                     ref={initialTextareaRef}
                     value={initialInput}
                     onChange={(e) => setInitialInput(e.target.value)}
                     onKeyDown={handleInitialKeyDown}
                     placeholder="Contoh: Aku ingin membuat desain rumah tinggal"
                     disabled={loading}
                     rows={1}
                  />
                  <button
                     onClick={startInitialChat}
                     disabled={loading || !initialInput.trim()}
                  >
                     Send
                  </button>
               </div>
            </div>
         ) : (
            <>
               <div className="session-bar">
                  <span>
                     Session ID: <code>{sessionId}</code>
                  </span>
                  <button
                     className="session-btn"
                     onClick={regenerateSession}
                     disabled={loading}
                  >
                     Regenerate Session
                  </button>
               </div>
               <div className="chat-container">
                  <div className="chat-messages">
                     {messages.map((msg) => (
                        <div
                           key={msg.id}
                           className={`chat-message ${msg.sender}`}
                        >
                           <div className="chat-bubble">
                              {msg.sender === "bot" && msg.text ? (
                                 <span
                                    dangerouslySetInnerHTML={{
                                       __html: marked(msg.text),
                                    }}
                                 />
                              ) : msg.text ? (
                                 <span
                                    dangerouslySetInnerHTML={{
                                       __html: marked(msg.text),
                                    }}
                                 />
                              ) : null}
                              {msg.imageUrl && (
                                 <iframe
                                    src={msg.imageUrl ?? ""}
                                    title="chat-image"
                                    className="chat-image"
                                    width="360"
                                    height="180"
                                    style={{ border: "none" }}
                                    allowFullScreen
                                 />
                              )}
                           </div>
                        </div>
                     ))}
                     {loading && (
                        <div className="chat-message bot">
                           <div className="chat-bubble">
                              <span className="bouncing-dots">
                                 <span>•</span>
                                 <span>•</span>
                                 <span>•</span>
                              </span>
                           </div>
                        </div>
                     )}
                     <div ref={messagesEndRef} />
                  </div>
                  <div className="chat-input">
                     <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={loading}
                        rows={1}
                     />
                     <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                     >
                        Send
                     </button>
                  </div>
               </div>
            </>
         )}
      </>
   );
}

export default App;
