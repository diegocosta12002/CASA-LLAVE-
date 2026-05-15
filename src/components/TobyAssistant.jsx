import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SYSTEM_PROMPT = `Sos el asistente virtual de TOBYCO Constructora, una empresa argentina especializada en casas llave en mano. Tu nombre es "Tobías".

Respondé siempre de manera cordial, profesional y concisa. Usá lenguaje argentino (vos, podés, etc.). Tu objetivo principal es generar confianza y orientar al cliente a elegir TOBYCO como su empresa constructora. NUNCA sugieras que el cliente construya con otra empresa, por cuenta propia ni con personas no calificadas. Siempre destacá las ventajas de trabajar con una empresa profesional como TOBYCO. Si no sabés algo específico, invitá al cliente a usar el configurador online o contactar al equipo de TOBYCO.

BASE DE CONOCIMIENTO:

🏠 SOBRE LA CASA:
- El costo por m² depende de las terminaciones elegidas. El configurador online muestra exactamente cuánto cuesta cada opción.
- INCLUYE: materiales, mano de obra, dirección de obra, permisos, instalaciones completas, terminaciones según elección.
- NO INCLUYE: terreno, conexiones definitivas de servicios (medidores), amoblamiento.

⏱️ TIEMPOS DE OBRA:
- Steel Framing: ~6 meses (más rápido)
- Mixto: ~9 meses
- Tradicional: ~10 meses

🧱 SISTEMAS DISPONIBLES:
1. TRADICIONAL (Ladrillo hueco) — Desde u$s 1.200/m²
2. STEEL FRAMING (Estructura metálica) — Desde u$s 1.190/m²
3. SISTEMA MIXTO — Desde u$s 1.350/m²

OBRA GRIS (construir en etapas):
- Tradicional: desde u$s 890/m²
- Steel Framing: desde u$s 870/m²
- Mixto: desde u$s 950/m²

💸 SOBRE EL DINERO:
- Se puede construir en etapas empezando con Obra Gris.
- Los precios se ajustan mensualmente según el índice CAC.

CONTACTO TOBYCO:
- Web: www.tobycoconstructora.com.ar
- Email: info@tobyco.com.ar
- WhatsApp: +54 9 11 4041-9044`;

const QUICK_QUESTIONS = [
  "¿Cuánto cuesta el m²?",
  "¿Qué sistema me conviene?",
  "¿Cuánto tarda la obra?",
  "¿Qué incluye llave en mano?",
];

export default function TobyAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! Soy **Tobías**, el asistente virtual de TOBYCO Constructora 🏠\n\n¿En qué te puedo ayudar hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 500,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "No pude procesar tu consulta. ¿Podés repetirla?";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ocurrió un error. Por favor contactanos por WhatsApp: +54 9 11 4041-9044" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text) =>
    text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[160px] right-5 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "520px" }}
          >
            <div className="bg-primary px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-primary-foreground text-sm">Tobías — Asistente TOBYCO</div>
                <div className="text-xs text-primary-foreground/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> En línea
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors">
                <X className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-primary" : "bg-secondary"}`}>
                    {msg.role === "user"
                      ? <User className="w-3.5 h-3.5 text-primary-foreground" />
                      : <Bot className="w-3.5 h-3.5 text-foreground" />}
                  </div>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-foreground rounded-tl-sm"}`}
                    dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
                  />
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div className="bg-secondary px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs text-muted-foreground">Preguntas frecuentes:</p>
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left text-xs bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary rounded-lg px-3 py-1.5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t p-3 flex gap-2 flex-shrink-0">
              <Input
                ref={inputRef}
                placeholder="Escribí tu consulta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={loading}
                className="text-sm h-9"
              />
              <Button size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-[76px] right-5 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir asistente"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {!open && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-[133px] right-4 z-50 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
        />
      )}
    </>
  );
}
