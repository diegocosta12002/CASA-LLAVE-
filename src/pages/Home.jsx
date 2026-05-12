import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SystemComparator from "@/components/SystemComparator";
import {
  ArrowRight, Home as HomeIcon, Shield, Clock, Calculator,
  Star, ChevronRight, CheckCircle2, Mail, Globe,
  Hammer, Layers, Building2, Zap, LogIn, UserPlus, LogOut, User,
  Sparkles, TrendingUp
} from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";
import TobyAssistant from "@/components/TobyAssistant";
import { useAuth } from "@/lib/AuthContext";

const features = [
  { icon: Calculator, title: "Presupuesto instantáneo", desc: "Configura y obtén el costo de tu casa en segundos con nuestra herramienta online." },
  { icon: Shield, title: "Materiales certificados", desc: "Todos nuestros sistemas cumplen normativas de construcción vigentes en Argentina." },
  { icon: Clock, title: "Plazos garantizados", desc: "Desde 6 hasta 10 meses según el sistema elegido, con cronograma de obra detallado." },
  { icon: Star, title: "Llave en mano", desc: "Te entregamos tu casa lista para habitar, sin sorpresas ni costos ocultos." },
];

const systems = [
  { icon: Hammer, label: "Tradicional", subtitle: "Ladrillo hueco", desc: "El sistema más probado, ideal para quienes buscan durabilidad y flexibilidad de diseño.", desde: "u$s 1.200/m²", ejemplo: "120m² = u$s 144.000" },
  { icon: Layers, label: "Steel Framing", subtitle: "Estructura metálica en seco", desc: "Construcción rápida, liviana y eficiente energéticamente. Menos residuos en obra.", desde: "u$s 1.190/m²", ejemplo: "120m² = u$s 142.800" },
  { icon: Zap, label: "Sistema Mixto", subtitle: "Tradicional + Steel Framing", desc: "Lo mejor de ambos mundos: grandes aventanamientos y excelente aislación.", desde: "u$s 1.350/m²", ejemplo: "120m² = u$s 162.000" },
];

const steps = [
  { num: "01", title: "Elegí tu modelo", desc: "Seleccioná el tamaño y sistema constructivo que se adapta a tu presupuesto." },
  { num: "02", title: "Personalizá los detalles", desc: "Fundaciones, sanitarios, terminaciones y extras según tus gustos." },
  { num: "03", title: "Recibí tu presupuesto", desc: "Descargá un PDF profesional con el desglose completo y cronograma de obra." },
  { num: "04", title: "¡Construimos juntos!", desc: "Nuestro equipo te acompaña desde el proyecto hasta la entrega de llaves." },
];

const testimonials = [
  { name: "Marcelo G.", city: "Luján — Zona Oeste GBA", text: "En 8 meses teníamos la casa lista. El configurador nos ayudó a entender los costos antes de comprometernos.", rating: 5 },
  { name: "Valentina P.", city: "Canning — Zona Sur GBA", text: "Elegimos Obra Gris y pudimos terminar nosotros los detalles. Excelente atención y cumplieron los plazos.", rating: 5 },
  { name: "Roberto & Ana", city: "Escobar — Zona Norte GBA", text: "El sistema Steel Framing nos sorprendió. Calidad increíble y tiempo de obra muy corto.", rating: 5 },
];

export default function Home() {
  const { user, isAuthenticated, logout, navigateToLogin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/69c56c4515a812726693b5c3/cca51d797_LOGOTOBYCO.jpg"
              alt="TOBYCO"
              className="h-10 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div style={{ display: "none" }} className="items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">TOBYCO</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#sistemas" className="hover:text-foreground transition-colors">Sistemas</a>
            <a href="#proceso" className="hover:text-foreground transition-colors">Proceso</a>
            <a href="#comparar" className="hover:text-foreground transition-colors">Comparar</a>
            <a href="#testimonios" className="hover:text-foreground transition-colors">Testimonios</a>
            <Link to="/budget-advisor" className="hover:text-foreground transition-colors flex items-center gap-1 text-primary font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Asesor IA
            </Link>
            <a href="https://www.tobycoconstructora.com.ar" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Contacto</a>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user?.full_name || user?.email}</span>
                </div>
                <Button size="sm" variant="ghost" className="gap-2" onClick={() => logout()}>
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
                </Button>
                <Link to="/configurator">
                  <Button size="sm" className="gap-2">
                    Cotizar <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" className="gap-2" onClick={() => navigateToLogin()}>
                  <LogIn className="w-4 h-4" /> Iniciar sesión
                </Button>
                <Button size="sm" className="gap-2" onClick={() => navigateToLogin()}>
                  <UserPlus className="w-4 h-4" /> Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 sm:py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" /> Casas llave en mano · Argentina
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
              Tu casa, <br />
              <span className="text-primary">a tu medida</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Construimos tu hogar en 3 sistemas constructivos distintos. Configurá online,
              obtené un presupuesto detallado y dejá el resto en nuestras manos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/configurator">
                <Button size="lg" className="gap-2 text-base px-8">
                  Configurar mi casa <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button size="lg" variant="outline" className="gap-2 text-base" onClick={() => navigateToLogin()}>
                  <UserPlus className="w-5 h-5" /> Crear cuenta gratis
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-muted-foreground">
              {["+500 casas entregadas", "3 sistemas constructivos", "Todo el país"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                alt="Casa moderna TOBYCO"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card border rounded-xl p-4 shadow-lg">
              <div className="text-xs text-muted-foreground">Desde</div>
              <div className="text-2xl font-bold text-primary font-display">u$s 96.120</div>
              <div className="text-xs text-muted-foreground">Casa 80m² llave en mano</div>
            </div>
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground rounded-xl p-3 shadow-lg text-center">
              <div className="text-lg font-bold">+10 años</div>
              <div className="text-xs">de experiencia</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Budget Advisor Banner */}
      <section className="px-6 py-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary rounded-2xl p-8 sm:p-10 text-primary-foreground"
        >
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-primary-foreground/5" />
          <div className="absolute -right-4 -bottom-8 w-32 h-32 rounded-full bg-primary-foreground/5" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wider">Nuevo · Asesor IA</div>
                <h2 className="text-2xl font-display font-bold mb-1">¿Cuánto tenés para construir?</h2>
                <p className="text-primary-foreground/80 text-sm max-w-md">
                  Ingresá tu presupuesto y la IA te dice qué podés construir, qué sistema te conviene y cómo ahorrar. Modo "presupuesto inverso".
                </p>
              </div>
            </div>
            <Link to="/budget-advisor" className="flex-shrink-0">
              <Button size="lg" variant="secondary" className="gap-2 font-semibold px-6 whitespace-nowrap">
                <TrendingUp className="w-4 h-4" />
                Probar gratis
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold">¿Por qué elegir TOBYCO?</h2>
            <p className="text-muted-foreground mt-2">Todo lo que necesitás para tu nueva casa, en un solo lugar</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sistemas constructivos */}
      <section id="sistemas" className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold">Sistemas constructivos</h2>
          <p className="text-muted-foreground mt-2">Elegí el sistema que mejor se adapte a tu proyecto y presupuesto</p>
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          {systems.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/40 transition-all group w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] max-w-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <s.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div className="font-bold text-lg">{s.label}</div>
              <div className="text-xs text-muted-foreground mb-2">{s.subtitle}</div>
              <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
              <div className="text-primary font-bold text-sm">Desde {s.desde}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.ejemplo}</div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/configurator">
            <Button size="lg" className="gap-2">
              Comparar sistemas y cotizar <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Comparador */}
      <SystemComparator />

      {/* Proceso */}
      <section id="proceso" className="px-6 py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold">¿Cómo funciona?</h2>
            <p className="text-muted-foreground mt-2">De la idea a la entrega de llaves en 4 pasos simples</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="relative"
              >
                <div className="text-5xl font-display font-bold text-primary/15 mb-3">{step.num}</div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 text-muted-foreground/30">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold">Lo que dicen nuestros clientes</h2>
          <p className="text-muted-foreground mt-2">Más de 500 familias ya construyeron con TOBYCO</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="bg-card border rounded-xl p-6"
            >
              <div className="flex mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic mb-4">"{t.text}"</p>
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.city}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary rounded-2xl p-10 sm:p-16 text-primary-foreground text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            ¿Listo para construir tu casa?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Configurá tu hogar en pocos pasos y recibí un presupuesto detallado al instante. Gratis, sin compromiso.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/configurator">
              <Button size="lg" variant="secondary" className="gap-2 text-base px-10">
                Comenzar ahora <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" className="gap-2 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigateToLogin()}>
                <UserPlus className="w-5 h-5" /> Crear cuenta gratis
              </Button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <img
                src="https://media.base44.com/images/public/69c56c4515a812726693b5c3/cca51d797_LOGOTOBYCO.jpg"
                alt="TOBYCO"
                className="h-10 object-contain mb-1"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <p className="text-sm text-muted-foreground">Constructora especializada en viviendas llave en mano en todo el país.</p>
            </div>
            <div>
              <div className="font-semibold mb-3">Links</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><Link to="/configurator" className="hover:text-foreground transition-colors">Configurador online</Link></div>
                <div><a href="https://www.tobycoconstructora.com.ar" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Sitio web</a></div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-3">Contacto</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Globe className="w-4 h-4" /><a href="https://www.tobycoconstructora.com.ar" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">www.tobycoconstructora.com.ar</a></div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><a href="mailto:info@tobyco.com.ar" className="hover:text-foreground">info@tobyco.com.ar</a></div>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} TOBYCO Constructora. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      <WhatsAppButton />
      <TobyAssistant />
    </div>
  );
}