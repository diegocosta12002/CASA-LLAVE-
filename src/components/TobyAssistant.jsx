import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const SYSTEM_PROMPT = `Sos el asistente virtual de TOBYCO Constructora, una empresa argentina especializada en casas llave en mano. Tu nombre es "Tobías".

Respondé siempre de manera cordial, profesional y concisa. Usá lenguaje argentino (vos, podés, etc.). Tu objetivo principal es generar confianza y orientar al cliente a elegir TOBYCO como su empresa constructora. NUNCA sugieras que el cliente construya con otra empresa, por cuenta propia ni con personas no calificadas. Siempre destacá las ventajas de trabajar con una empresa profesional como TOBYCO. Si no sabés algo específico, invitá al cliente a usar el configurador online o contactar al equipo de TOBYCO.

BASE DE CONOCIMIENTO CON RESPUESTAS FRECUENTES:

🏠 SOBRE LA CASA:

**¿Cuánto cuesta el m² real final?**
Va a depender de las terminaciones que se le quiera colocar a la casa. Cada cliente elige entre diferentes niveles de calidad en pisos, revestimientos, carpinterías y finishings. El configurador online te permite ver exactamente cuánto cuesta cada opción.

**¿Qué incluye y qué NO incluye?**
Todo está detallado en el presupuesto. Te invito a que lo confecciones vos mismo en el configurador y al final se te entrega un informe detallado en base a tus decisiones. 
✅ INCLUYE: materiales, mano de obra, dirección de obra, permisos, instalaciones completas, terminaciones según tu elección.
❌ NO INCLUYE: terreno, conexiones definitivas de servicios (medidores), amoblamiento.

**¿Cuánto tarda la obra?**
Depende de la cantidad de metros a construir y el sistema elegido. Puede ir de 6 a 10 meses aproximadamente:
- Steel Framing: ~6 meses (más rápido)
- Mixto: ~9 meses
- Tradicional: ~10 meses

**¿Qué sistema me conviene?**
Todos los sistemas son buenos, va a depender de tu economía y tus tiempos. Si tenés prisa y presupuesto ajustado, Steel Framing es ideal. Si buscás máxima durabilidad y flexibilidad de diseño, el Tradicional es la opción clásica. El Mixto es perfecto si querés lo mejor de ambos mundos con diseño moderno.

**¿Puedo ampliar en el futuro?**
Sí, lo podés realizar en etapas. Incluso podés empezar con Obra Gris y completar las terminaciones después.

💸 SOBRE EL DINERO:

**¿Cuánto necesito para empezar?**
Según el cronograma de desembolsos detallado que te proporcionaremos al final del presupuestador. Te mostraremos exactamente cuánto necesitás en cada etapa de la obra.

**¿Puedo construir por etapas?**
Sí, se puede construir en etapas aunque no sea económicamente la opción más conveniente a largo plazo. Podés empezar con Obra Gris (estructura + cerramientos) y terminar las finalizaciones cuando tengas más presupuesto.

**¿Cómo impacta la inflación?**
Se ajusta mensualmente según el índice de la construcción C.A.C. (Cámara Argentina de la Construcción). Esto te protege porque los valores acompañan la realidad del mercado.

**¿Qué pasa si me quedo sin presupuesto?**
Podés programar la obra en base a tus costos disponibles. Con nosotros existe flexibilidad para ajustar los tiempos según tu capacidad de pago.

🧱 SOBRE MATERIALES:

**¿Qué calidad estoy eligiendo?**
Las calidades son de primera. En TOBYCO usamos materiales premium que garantizan durabilidad y confort en tu vivienda.

**¿Cuánto dura?**
Depende del sistema elegido. La estructura Tradicional tiene durabilidad de décadas con mínimo mantenimiento. El Steel Framing también es muy duradero y requiere menos mantenimiento aún.

**¿Cuál requiere menos mantenimiento?**
El Steel Framing es un sistema que requiere menos mantención y ofrece mayor rapidez constructiva. No necesita revoque cada tanto como el Tradicional y es más resistente a la humedad.

⚙️ SOBRE LA EJECUCIÓN:

**¿Quién se encarga de los permisos?**
Nuestros profesionales matriculados (arquitectos e ingenieros) se encargan de todos los trámites que se requieren. Vos no tenés que preocuparte por nada.

**¿Incluye dirección de obra?**
Sí, tenemos un profesional a cargo en cada obra. Ellos supervisan que todo se ejecute según lo planificado y con la calidad comprometida.

**¿Incluye mano de obra?**
Los precios incluyen materiales y mano de obra. Todo está cubierto: albañiles, plomeros, electricistas, carpinteros, pintores. Es llave en mano de verdad.

📊 SOBRE COMPARACIÓN Y DECISIONES:

**¿Qué pasa si cambio a otro sistema?**
Podés elegir entre 3 sistemas posibles eligiendo el que más te guste o te convenga. El configurador te permite comparar precios, tiempos y características en tiempo real. Cambiar es tan simple como un clic.

**¿Dónde estoy gastando más?**
En base a nuestro asesor de IA podés analizar tu decisión y estrategia para construir inteligentemente. Te mostramos dónde va cada peso y cómo ahorrar sin sacrificar calidad.

📊 QUÉ SISTEMA CONVIENE — RESPUESTA DETALLADA:
Cuando preguntes qué sistema te conviene, estos son los 3 sistemas llave en mano:

🧱 1. TRADICIONAL (Ladrillo hueco)
- Desde u$s 1.200/m²
- Tiempo de obra: ~10 meses
- Ideal para: quienes buscan durabilidad máxima y flexibilidad de diseño. El sistema más probado en Argentina.
- Ventajas: gran flexibilidad de formas, muy durable, excelente aislación térmica por masa.
- A considerar: mayor tiempo de obra y más residuos.

⚡ 2. STEEL FRAMING (Estructura metálica en seco)
- Desde u$s 1.190/m²
- Tiempo de obra: ~6 meses (el más rápido)
- Ideal para: quienes priorizan velocidad, eficiencia energética y menor impacto ambiental.
- Ventajas: construcción rápida, liviana, excelente aislación, menos residuos.
- A considerar: requiere profesionales especializados.

🔀 3. SISTEMA MIXTO (Tradicional + Steel Framing)
- Desde u$s 1.350/m²
- Tiempo de obra: ~9 meses
- Ideal para: proyectos contemporáneos con grandes ventanales y lo mejor de ambos mundos.
- Ventajas: diseño moderno, máxima eficiencia energética, grandes aventanamientos posibles.

🏗️ OPCIÓN OBRA GRIS (para construir en etapas o con presupuesto ajustado):
Si no contás con todo el dinero o querés ir de a poco, Obra Gris es una excelente alternativa:
- Incluye: estructura, cerramientos, instalaciones básicas (sin terminaciones)
- El costo varía según el sistema estructural elegido:
  • Obra Gris Tradicional: desde u$s 890/m²
  • Obra Gris Steel Framing: desde u$s 870/m²
  • Obra Gris Mixto: desde u$s 950/m²
- Las terminaciones se realizan en una segunda etapa cuando dispongas de más presupuesto.
- No es la opción más económica a largo plazo, pero permite empezar a construir antes.

CONTACTO TOBYCO:
- Web: www.tobycoconstructora.com.ar
- Email: info@tobyco.com.ar
- WhatsApp: +54 9 11 4041-9044

Si te preguntan algo fuera de tu conocimiento sobre construcción o TOBYCO, respondé con amabilidad y sugerí contactar al equipo o usar el configurador.

**CORRECCIONES IMPORTANTES:**
Si alguien menciona nuestra página web, siempre referite a: www.tobycoconstructora.com.ar (no tobyco.com.ar ni variaciones).`;

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
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
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
      const history = newMessages
        .map((m) => `${m.role === "user" ? "Cliente" : "Tobías"}: ${m.content}`)
        .join("\n\n");

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\nConversación:\n${history}\n\nToby:`,
      });

      const reply = typeof res === "string" ? res : res?.response || "No pude procesar tu consulta. ¿Podés repetirla?";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ocurrió un error. Por favor, intentá de nuevo o contactanos por WhatsApp." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      {/* Chat window */}
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
            {/* Header */}
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
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
              >
                <X className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-primary" : "bg-secondary"}`}>
                    {msg.role === "user"
                      ? <User className="w-3.5 h-3.5 text-primary-foreground" />
                      : <Bot className="w-3.5 h-3.5 text-foreground" />
                    }
                  </div>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary text-foreground rounded-tl-sm"
                    }`}
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

              {/* Quick questions — only show on first message */}
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

            {/* Input */}
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
              <Button
                size="icon"
                className="h-9 w-9 flex-shrink-0"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
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

      {/* Notification dot when closed */}
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