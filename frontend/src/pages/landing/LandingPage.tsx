import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Check,
  Cpu,
  CreditCard,
  Database,
  Eye,
  HeartPulse,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import './landing.css';

/* Silueta de la columna vertebral del héroe (una "vértebra" por rectángulo) */
const vertebrasColumna = [
  { y: 470, ancho: 78, dx: 0 },
  { y: 434, ancho: 76, dx: 2 },
  { y: 398, ancho: 74, dx: 4 },
  { y: 362, ancho: 72, dx: 7 },
  { y: 326, ancho: 70, dx: 10 },
  { y: 290, ancho: 66, dx: 13 },
  { y: 254, ancho: 60, dx: 16 },
  { y: 222, ancho: 46, dx: 20 },
];

/* Ritmo de foco a lo largo de la jornada */
const ritmoJornada = [
  { hora: '08:00', valor: 30, detalle: 'Calentamiento' },
  { hora: '08:45', valor: 44, detalle: 'Revisión de agenda' },
  { hora: '09:30', valor: 62, detalle: 'Inmersión' },
  { hora: '10:15', valor: 80, detalle: 'Flujo alto' },
  { hora: '10:40', valor: 100, detalle: 'Pico máximo de foco' },
  { hora: '11:20', valor: 88, detalle: 'Resolución de problemas' },
  { hora: '12:00', valor: 56, detalle: 'Desaceleración' },
  { hora: '13:30', valor: 34, detalle: 'Retorno gradual' },
  { hora: '14:15', valor: 48, detalle: 'Coordinación SST' },
  { hora: '15:00', valor: 70, detalle: 'Foco vespertino' },
  { hora: '15:45', valor: 84, detalle: 'Alto rendimiento' },
  { hora: '16:30', valor: 66, detalle: 'Cierre de jornada' },
];

const pasos = [
  {
    numero: '1',
    titulo: 'Consentimiento informado',
    texto:
      'La persona autoriza el análisis y sabe con exactitud qué se mide. El consentimiento queda registrado y es revocable en cualquier momento.',
  },
  {
    numero: '2',
    titulo: 'Análisis local en RAM',
    texto:
      'MediaPipe Pose estima la postura dentro del navegador, a 30 FPS. El fotograma se procesa y se descarta: nunca se almacena ni se transmite.',
  },
  {
    numero: '3',
    titulo: 'Reporte SST y pausas',
    texto:
      'Recibes evaluaciones RULA, tendencias de fatiga e informes exportables para auditorías conforme a la norma ISO 11226.',
  },
];

const modulos = [
  {
    titulo: 'Monitoreo ergonómico',
    texto: 'Ángulos de cuello, tronco y hombros evaluados en vivo con el método RULA.',
    dato: 'RULA',
  },
  {
    titulo: 'Ritmo de enfoque',
    texto: 'La curva de atención de la jornada, para ver los picos y anticipar el desgaste.',
    dato: 'Foco',
  },
  {
    titulo: 'Supervisión de exámenes',
    texto:
      'Integridad en evaluaciones: desvíos de foco, mirada baja y bloqueo del portapapeles.',
    dato: 'Proctoring',
  },
  {
    titulo: 'Reportes SST',
    texto: 'Auditorías ergonómicas e informes exportables para certificar ISO 11226.',
    dato: 'ISO 11226',
  },
  {
    titulo: 'Roles y organizaciones',
    texto:
      'Multiempresa con permisos por rol: superadmin, supervisor, evaluador o empleado.',
    dato: 'RBAC',
  },
];

const resultados = [
  { etiqueta: 'Índice de bienestar SST', valor: '88.4 / 100', pct: 0.884 },
  { etiqueta: 'Reducción de riesgo postural', valor: '34.8 %', pct: 0.348 },
  { etiqueta: 'Integridad en evaluaciones', valor: '94.1 %', pct: 0.941 },
  { etiqueta: 'Adherencia a pausas activas', valor: '79.2 %', pct: 0.792 },
];

const fichas = [
  'Método RULA',
  'ISO 11226',
  'MediaPipe Pose · 30 FPS',
  'Buffer RAM · 0 KB',
];

/* Stack biomecánico y tecnológico estilo skill-box de Angelo */
const stackTecnologico = [
  {
    Icono: Activity,
    titulo: 'MediaPipe Pose AI',
    subtitulo: '30 FPS · Inferencia local en navegador',
    badge: 'Computer Vision',
  },
  {
    Icono: ShieldCheck,
    titulo: 'Protocolo RULA & ISO',
    subtitulo: 'ISO 11226 · Auditoría SST exportable',
    badge: 'Normativa Oficial',
  },
  {
    Icono: Cpu,
    titulo: 'WebAssembly Engine',
    subtitulo: '0 ms Latencia de procesamiento',
    badge: 'WASM High-Speed',
  },
  {
    Icono: Zap,
    titulo: 'Buffer RAM Efímero',
    subtitulo: '0 KB Video almacenado en disco',
    badge: 'Privacidad Total',
  },
  {
    Icono: Database,
    titulo: 'PostgreSQL & Prisma',
    subtitulo: 'Cifrado de grado empresarial SST',
    badge: 'Persistencia Segura',
  },
  {
    Icono: Eye,
    titulo: 'Telemetría Biométrica',
    subtitulo: 'Monitoreo postural continuo y alertas',
    badge: 'Monitoreo SST',
  },
];

/* Perfil público al que apunta la experiencia */
const publico = [
  'Equipos de oficina',
  'Trabajo remoto',
  'Universidades y admisiones',
  'Prevencionistas SST',
];

/* Beneficios contados sin tecnicismos: la razón para querer usarlo */
const beneficios = [
  {
    Icono: HeartPulse,
    titulo: 'Cuidas la espalda antes de que duela',
    texto:
      'Avisos posturales a tiempo evitan molestias que se vuelven crónicas. Tu equipo trabaja cómodo, sin pensar en la postura.',
  },
  {
    Icono: Sparkles,
    titulo: 'Más foco en las horas que importan',
    texto:
      'Descubres cuándo el equipo rinde mejor y proteges las pausas que sostienen la concentración durante toda la jornada.',
  },
  {
    Icono: ShieldCheck,
    titulo: 'Evidencia lista para cualquier auditoría',
    texto:
      'Cuando llega una inspección de SST, tú ya tienes los informes. Nada de planillas sueltas ni datos recogidos a mano.',
  },
  {
    Icono: Users,
    titulo: 'Funciona en oficina y en remoto',
    texto:
      'Solo hace falta un navegador y una cámara. Sin instalar nada y sin cambiar la forma en que tu equipo ya trabaja.',
  },
];

const testimonios = [
  {
    cita: 'Desde que lo usamos, las pausas activas dejaron de sentirse impuestas. El propio equipo las pide.',
    autor: 'Camila Ortega',
    cargo: 'Jefa de SST · Manufactura',
    iniciales: 'CO',
  },
  {
    cita: 'Pasamos de la intuición a la evidencia. Cuando llegó la auditoría, los informes ya estaban listos.',
    autor: 'Diego Ramírez',
    cargo: 'Gerente de Personas · Servicios',
    iniciales: 'DR',
    destacado: true,
  },
  {
    cita: 'Pensábamos que costaría implementarlo y en una tarde teníamos a todo el equipo dentro.',
    autor: 'Valentina Rojas',
    cargo: 'Coordinadora de TI · Educación',
    iniciales: 'VR',
  },
];

/* Planes reales del servicio de suscripciones (precios en USD) */
const planes = [
  {
    nombre: 'SaaS por Puesto Activo',
    tagline: 'Para empresas con puestos y estaciones ergonómicas continuas.',
    precio: '$15',
    unidad: 'USD / puesto·mes',
    minimo: 'Desde 5 puestos',
    pruebaGratis: '14 días de prueba · Requiere tarjeta de crédito',
    textoBoton: 'Comenzar prueba con tarjeta',
    caracteristicas: [
      '14 días de prueba completa incluidos',
      'Requiere registrar tarjeta de crédito ($0 hoy)',
      'Telemetría ErgoCheck en tiempo real (RULA / REBA)',
      'Análisis en RAM y alertas de pausas activas',
      'Reportes mensuales de salud ocupacional NTS-009',
      'Panel de supervisión para Prevencionistas SST',
      'Soporte técnico por correo y chat',
    ],
    recomendado: true,
  },
  {
    nombre: 'Paquete Pay-Per-Exam',
    tagline: 'Para evaluaciones académicas o admisiones laborales.',
    precio: '$3',
    unidad: 'USD / examen',
    minimo: 'Desde 50 exámenes',
    textoBoton: 'Ver este plan',
    caracteristicas: [
      'Proctoring AI: foco, mirada y segundo rostro',
      'Actas automáticas con hash criptográfico inmutable',
      'Sin cuota fija mensual: pagas solo por uso',
      'Consentimiento biométrico previo a cada examen',
      'Informes exportables por evaluación',
    ],
    recomendado: false,
  },
  {
    nombre: 'Enterprise Custom Total',
    tagline: 'Para corporaciones y universidades con varias sedes.',
    precio: '$590',
    unidad: 'USD / mes',
    minimo: 'Puestos y exámenes ilimitados',
    textoBoton: 'Ver este plan',
    caracteristicas: [
      'Puestos de trabajo ilimitados',
      'Exámenes supervisados ilimitados',
      'Gestión multiempresa y multisede',
      'Auditoría para ISO 45001 y protección de datos',
      'SLA 99.9 % y gestor de cuenta dedicado',
    ],
    recomendado: false,
  },
];

const preguntas = [
  {
    pregunta: '¿Necesito instalar algún programa?',
    respuesta:
      'No. visitask funciona directamente en el navegador. Solo se pide autorizar la cámara cuando cada persona decide participar.',
  },
  {
    pregunta: '¿Se guarda el video de mi equipo?',
    respuesta:
      'Nunca. El análisis ocurre dentro del propio equipo y el fotograma se descarta al instante. Lo único que viaja son métricas de postura y atención, jamás imágenes.',
  },
  {
    pregunta: '¿Sirve si parte del equipo trabaja desde casa?',
    respuesta:
      'Sí. Funciona en cualquier computadora con cámara y conexión a internet, esté la persona en la oficina o en su casa.',
  },
  {
    pregunta: '¿Es difícil empezar?',
    respuesta:
      'No. Creas la cuenta, invitas a tu equipo y en minutos ves la primera evaluación postural. Si necesitas ayuda, te acompañamos en la puesta en marcha.',
  },
  {
    pregunta: '¿Puedo cambiar de plan o cancelar cuando quiera?',
    respuesta:
      'Sí. Los planes se ajustan al tamaño de tu equipo y no tienen ataduras. Puedes subir, bajar o cancelar cuando lo necesites.',
  },
  {
    pregunta: '¿Me sirve para cumplir con SST?',
    respuesta:
      'Sí. Los informes siguen la referencia RULA e ISO 11226 y se descargan listos para tus auditorías y trámites de seguridad y salud en el trabajo.',
  },
];

const longitudArco = 170;

const mensajesTelemetria = [
  'Buffer en RAM: Fotograma analizado y descartado (0 KB guardados)',
  'MediaPipe Pose: Ángulo cervical RULA 26° calibrado a 30 FPS',
  'Privacidad ISO 11226: Cero almacenamiento o transmisión de video',
];

export function LandingPage() {
  const raizRef = useRef<HTMLDivElement>(null);
  const [indiceRitmo, setIndiceRitmo] = useState<number | null>(null);
  const [moduloActivo, setModuloActivo] = useState(0);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);
  const [progresoScroll, setProgresoScroll] = useState(0);
  const [zonaEspina, setZonaEspina] = useState('C1-C7 · Cervical');
  const [mostrarHud, setMostrarHud] = useState(false);
  const [indiceTelemetria, setIndiceTelemetria] = useState(0);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [hojaActiva, setHojaActiva] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndiceTelemetria((prev) => (prev + 1) % mensajesTelemetria.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const { body, documentElement } = document;
    body.classList.add('pagina-desplazable');
    documentElement.classList.add('desplazamiento-suave');
    return () => {
      body.classList.remove('pagina-desplazable');
      documentElement.classList.remove('desplazamiento-suave');
    };
  }, []);

  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;
    let pendiente = 0;
    const actualizar = () => {
      pendiente = 0;
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
      const total = scrollHeight - clientHeight;
      const progreso = total > 0 ? Math.min(1, Math.max(0, scrollTop / total)) : 0;
      raiz.style.setProperty('--progreso', progreso.toFixed(4));
      setProgresoScroll(progreso);
      setMostrarHud(scrollTop > 90);

      // Clasificación de la zona vertebral según el recorrido vertical
      if (progreso < 0.22) {
        setZonaEspina('C1-C7 · Cervical');
      } else if (progreso < 0.55) {
        setZonaEspina('T1-T12 · Tronco');
      } else if (progreso < 0.82) {
        setZonaEspina('L1-L5 · Lumbar');
      } else {
        setZonaEspina('S1 · Sacro');
      }

      // Cálculo del apilamiento de tarjetas (Sticky Card Stacking estilo Skiper16)
      const tarjetas = raiz.querySelectorAll<HTMLElement>('.tarjeta-stack');
      const alturaVentana = window.innerHeight;
      const offsetTopBase = 72; // Altura de la barra de navegación fija
      let indiceActivo = 1;

      tarjetas.forEach((tarjeta, i) => {
        const rect = tarjeta.getBoundingClientRect();
        const siguiente = tarjetas[i + 1];

        // Detección de tarjeta actualmente en foco principal
        if (rect.top <= alturaVentana * 0.45 && rect.bottom >= alturaVentana * 0.25) {
          indiceActivo = i + 1;
        }

        // Offset mínimo para mantener el contenido centrado y sin consumir espacio vertical
        const offsetPila = Math.min(8, i * 2);
        tarjeta.style.setProperty('--stack-offset', `${offsetPila}px`);
        tarjeta.style.setProperty('z-index', `${10 + i}`);

        if (siguiente) {
          const rectSiguiente = siguiente.getBoundingClientRect();
          // Cuándo la siguiente tarjeta empieza a cubrir a la actual
          const puntoFinal = offsetTopBase + Math.min(8, (i + 1) * 2);
          const recorridoTotal = Math.max(1, alturaVentana - puntoFinal);
          const distanciaRecorrida = alturaVentana - rectSiguiente.top;
          const progresoCubrimiento = Math.min(1, Math.max(0, distanciaRecorrida / recorridoTotal));

          // Desvanecido mayor y progresivo: la tarjeta que queda abajo se desvanece
          // suavemente hacia transparencia conforme la siguiente avanza sobre ella
          const opacidad = Math.max(0, 1 - (progresoCubrimiento * 1.25));

          // Desplazamiento sutil hacia arriba (fade up natural)
          const desplazamientoY = progresoCubrimiento * -28;

          // Escala muy suave para dar profundidad sin distorsionar
          const targetScale = 0.98;
          const escala = 1 - (progresoCubrimiento * (1 - targetScale));

          // Desenfoque óptico gradual para que el contenido inferior se disuelva con elegancia
          const desenfoque = progresoCubrimiento * 8; // 0px a 8px

          // Atenuación de brillo sutil
          const brillo = Math.max(0.92, 1 - (progresoCubrimiento * 0.05));

          tarjeta.style.setProperty('--opacidad-tarjeta', opacidad.toFixed(3));
          tarjeta.style.setProperty('--escala-tarjeta', escala.toFixed(3));
          tarjeta.style.setProperty('--brillo-tarjeta', brillo.toFixed(3));
          tarjeta.style.setProperty('--desenfoque-tarjeta', `${desenfoque.toFixed(1)}px`);
          tarjeta.style.setProperty('--desplazamiento-y', `${desplazamientoY.toFixed(1)}px`);
        } else {
          // Última tarjeta (Cierre)
          tarjeta.style.setProperty('--opacidad-tarjeta', '1');
          tarjeta.style.setProperty('--escala-tarjeta', '1');
          tarjeta.style.setProperty('--brillo-tarjeta', '1');
          tarjeta.style.setProperty('--desenfoque-tarjeta', '0px');
          tarjeta.style.setProperty('--desplazamiento-y', '0px');
        }
      });

      setHojaActiva(indiceActivo);
    };
    const alDesplazar = () => {
      pendiente ||= requestAnimationFrame(actualizar);
    };
    actualizar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    window.addEventListener('resize', alDesplazar);
    return () => {
      if (pendiente) cancelAnimationFrame(pendiente);
      window.removeEventListener('scroll', alDesplazar);
      window.removeEventListener('resize', alDesplazar);
    };
  }, []);

  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;
    const objetivos = raiz.querySelectorAll('.revelar, .observar');
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('esta-visible');
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
    );
    objetivos.forEach((objetivo) => observador.observe(objetivo));
    return () => observador.disconnect();
  }, []);

  const lectura = indiceRitmo === null ? ritmoJornada[4] : ritmoJornada[indiceRitmo];

  return (
    <div className="landing" ref={raizRef}>
      {/* Barra superior de telemetría de scroll que acompaña todo el recorrido */}
      <div
        className="barra-scroll-top"
        style={{ transform: `scaleX(${progresoScroll})` }}
        aria-hidden="true"
      />

      <header className="cabecera">
        <Link to="/" className="marca" aria-label="visitask, inicio">
          <svg width="30" height="30" viewBox="0 0 30 30" role="img" aria-hidden="true">
            <circle cx="15" cy="15" r="15" fill="#0B1020" />
            <circle cx="15" cy="15" r="6" fill="none" stroke="#C6F432" strokeWidth="2.4" />
            <circle className="marca__punto" cx="15" cy="15" r="1.8" fill="#C6F432" />
          </svg>
          <span className="marca__nombre">visitask</span>
        </Link>

        <nav className="navegacion" aria-label="Secciones">
          <a href="#jornada">La jornada</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#proceso">Cómo funciona</a>
          <a href="#modulos">Módulos</a>
          <a href="#planes">Planes</a>
        </nav>

        <div className="cabecera__acciones">
          <Link to="/login" className="enlace-sesion">
            Iniciar sesión
          </Link>
          <Link to="/registro" className="boton boton--tinta boton--sm">
            Crear cuenta
          </Link>
        </div>

        {/* Botón hamburguesa móvil estilo Portfolio */}
        <button
          type="button"
          className="boton-hamburguesa"
          onClick={() => setMenuMovilAbierto(true)}
          aria-label="Abrir menú de navegación"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Menú móvil desplegable a pantalla completa (Portfolio de Angelo) */}
      <div
        className={`menu-movil ${menuMovilAbierto ? 'menu-movil--abierto' : ''}`}
        aria-hidden={!menuMovilAbierto}
      >
        <div className="menu-movil__cerrar">
          <button
            type="button"
            className="menu-movil__boton-cerrar"
            onClick={() => setMenuMovilAbierto(false)}
            aria-label="Cerrar menú"
          >
            <X size={30} />
          </button>
        </div>
        <ul className="menu-movil__lista">
          <li>
            <a href="#jornada" onClick={() => setMenuMovilAbierto(false)}>
              La jornada
            </a>
          </li>
          <li>
            <a href="#beneficios" onClick={() => setMenuMovilAbierto(false)}>
              Beneficios
            </a>
          </li>
          <li>
            <a href="#proceso" onClick={() => setMenuMovilAbierto(false)}>
              Cómo funciona
            </a>
          </li>
          <li>
            <a href="#modulos" onClick={() => setMenuMovilAbierto(false)}>
              Módulos
            </a>
          </li>
          <li>
            <a href="#planes" onClick={() => setMenuMovilAbierto(false)}>
              Planes
            </a>
          </li>
          <li>
            <a href="#preguntas" onClick={() => setMenuMovilAbierto(false)}>
              Preguntas
            </a>
          </li>
        </ul>
        <div className="menu-movil__acciones">
          <Link
            to="/login"
            className="boton boton--borde boton--ancho"
            onClick={() => setMenuMovilAbierto(false)}
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="boton boton--lima boton--ancho"
            onClick={() => setMenuMovilAbierto(false)}
          >
            Crear cuenta gratis
          </Link>
        </div>
      </div>

      <main className="contenedor-stack-tarjetas">
        <section className="heroe" id="heroe">
          <div
            className="heroe__texto"
            style={{
              transform: `translateX(-${Math.min(32, progresoScroll * 240)}px)`,
              opacity: Math.max(0.1, 1 - progresoScroll * 3.5),
              transition: 'transform 0.06s linear, opacity 0.06s linear',
            }}
          >
            <span className="chip-vivo">
              <span className="chip-vivo__latido" />
              Telemetría en el puesto de trabajo
            </span>
            <h1 className="heroe__titulo">
              Cómo se sienta tu equipo determina cómo{' '}
              <span className="marca-lima">trabaja</span>.
            </h1>
            <p className="heroe__entrada">
              visitask mide en vivo la postura y la atención de cada puesto —directo en el
              navegador y sin sacar el video del equipo— para que cuidar la salud deje de ser una
              corazonada.
            </p>
            <div className="heroe__acciones">
              <Link to="/registro" className="boton boton--lima">
                Crear cuenta gratis
                <ArrowRight className="boton__flecha" size={18} aria-hidden="true" />
              </Link>
              <a href="#proceso" className="boton boton--borde">
                Ver cómo funciona
              </a>
            </div>
            <p className="heroe__nota">
              <CreditCard size={16} aria-hidden="true" />
              Requiere tarjeta de crédito · 14 días de prueba ($0 hoy). Procesamiento local: <b>0 KB</b> de video almacenado.
            </p>
          </div>

          <div
            className="heroe__panel"
            style={{
              transform: `translateY(${Math.min(50, progresoScroll * 320)}px) rotate(${Math.min(2.5, progresoScroll * 18)}deg)`,
              transition: 'transform 0.06s linear',
            }}
          >
            {/* Haz de luz de calibración óptica (inspirado en Light Effect de Angelo) */}
            <div className="haz-luz-calibracion" aria-hidden="true" />

            <div className="panel-cromo">
              <span className="panel-cromo__sesion">
                <span className="panel-cromo__punto" />
                Telemetría en vivo
              </span>
              <span className="panel-cromo__rula">RULA · 26°</span>
            </div>

            <svg
              className="columna-svg"
              viewBox="0 0 380 560"
              role="img"
              aria-label="Columna vertebral con una desviación cervical señalada y su eje ideal"
              style={{
                transform: `translateY(${Math.min(32, progresoScroll * 140)}px)`,
                transition: 'transform 0.08s linear',
              }}
            >
              <g className="radios">
                <circle cx="190" cy="300" r="220" fill="none" stroke="#8FA0C4" strokeWidth="0.8" />
                <circle cx="190" cy="300" r="266" fill="none" stroke="#8FA0C4" strokeWidth="0.8" />
              </g>
              <line
                className="eje-ideal"
                x1="190"
                y1="40"
                x2="190"
                y2="544"
                stroke="#C6F432"
                strokeWidth="1.5"
                strokeDasharray="5 6"
              />
              <g fill="#E8ECEF">
                {vertebrasColumna.map((v, i) => (
                  <rect
                    key={i}
                    className="vertebra-svg"
                    style={{ '--vi': `${i * 70}ms` } as CSSProperties}
                    x={190 - v.ancho / 2 + v.dx}
                    y={v.y}
                    width={v.ancho}
                    height={28}
                    rx="7"
                  />
                ))}
                <rect
                  className="vertebra-svg vertebra-svg--caliente"
                  style={{ '--vi': '600ms' } as CSSProperties}
                  x={192}
                  y={184}
                  width="40"
                  height="24"
                  rx="7"
                />
              </g>
              <g className="cabeza-svg">
                <rect
                  x="222"
                  y="150"
                  width="26"
                  height="44"
                  rx="11"
                  fill="#E8ECEF"
                  opacity="0.85"
                />
                <circle cx="240" cy="120" r="30" fill="none" stroke="#E8ECEF" strokeWidth="2.6" />
                <circle cx="230" cy="116" r="3.2" fill="#C6F432" />
              </g>
              <line
                className="linea-guia"
                x1="214"
                y1="196"
                x2="300"
                y2="150"
                stroke="#C6F432"
                strokeWidth="1"
              />
              <text className="etiqueta-anatomica" x="306" y="146">
                Desviación cervical
              </text>
            </svg>

            <div className="panel-angulos">
              <span className="angulo angulo--riesgo">
                Cuello <b>26°</b>
              </span>
              <span className="angulo angulo--aviso">
                Tronco <b>19°</b>
              </span>
              <span className="angulo angulo--ok">
                Hombros <b>14°</b>
              </span>
            </div>

            {/* Píldora de telemetría volátil que asciende y se desvanece */}
            <div className="telemetria-volatil" aria-hidden="true" key={indiceTelemetria}>
              <div className="telemetria-volatil__item">
                <span className="telemetria-volatil__punto" />
                <span>{mensajesTelemetria[indiceTelemetria]}</span>
              </div>
            </div>
          </div>

          {/* Indicador de desplazamiento que sube hacia arriba y se desvanece al hacer scroll */}
          <div
            className="heroe__scroll-hint"
            style={{
              transform: `translateY(-${Math.min(48, progresoScroll * 260)}px)`,
              opacity: Math.max(0, 1 - progresoScroll * 6.5),
              pointerEvents: progresoScroll > 0.08 ? 'none' : 'auto',
            }}
          >
            <span className="heroe__scroll-linea" />
            <span className="heroe__scroll-texto">Desliza para explorar telemetría</span>
            <span className="heroe__scroll-flecha">↓</span>
          </div>
        </section>

        {/* Sección La Jornada - Scroll continuo normal */}
        <section id="jornada" className="seccion seccion--jornada">
          <div className="seccion__encabezado revelar">
            <h2 className="titulo-seccion">La fatiga no avisa: se acumula.</h2>
            <p className="entrada-seccion">
              A lo largo de una jornada el cuerpo pasa por picos de foco y horas de desgaste.
              visitask lo convierte en una lectura clara: cuándo rinde tu equipo y cuándo la espalda
              pide una pausa.
            </p>
          </div>
          <div className="jornada observar">
            <div className="jornada__lector revelar">
              <span className="lector__hora">{lectura.hora}</span>
              <span className="lector__separador" />
              <span className="lectura__detalle">{lectura.detalle}</span>
              <span className="lectura__valor">{lectura.valor}% foco</span>
            </div>
            <div
              className="grafico-ritmo"
              role="group"
              aria-label="Ritmo de foco a lo largo de la jornada"
            >
              {ritmoJornada.map((punto, i) => (
                <button
                  key={punto.hora}
                  type="button"
                  className={`barra-ritmo ${i === 4 ? 'barra-ritmo--pico' : ''} ${
                    indiceRitmo === i ? 'barra-ritmo--activa' : ''
                  }`}
                  style={{ '--altura': `${punto.valor}%`, '--bi': `${i * 55}ms` } as CSSProperties}
                  onMouseEnter={() => setIndiceRitmo(i)}
                  onFocus={() => setIndiceRitmo(i)}
                  onMouseLeave={() => setIndiceRitmo(null)}
                  onBlur={() => setIndiceRitmo(null)}
                  aria-label={`${punto.hora}: ${punto.detalle}, ${punto.valor}% de foco`}
                >
                  <span className="barra-ritmo__relleno" />
                </button>
              ))}
            </div>
            <div className="grafico-eje">
              {['08:00', '10:15', '12:00', '14:15', '16:30'].map((hora) => (
                <span key={hora}>{hora}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── BLOQUE STACK CLAVE: 3 Secciones Apilables con Transición Suave ── */}
        <div className="bloque-stack-tres">
          {/* Tarjeta 1 / 3: Beneficios */}
          <section id="beneficios" className="seccion seccion--beneficios seccion-stack tarjeta-stack" data-tarjeta="1">
            <div className="seccion__encabezado revelar">
              <h2 className="titulo-seccion">Lo que cambia desde el primer día.</h2>
              <p className="entrada-seccion">
                No es solo un panel con gráficos. Es la tranquilidad de saber que tu equipo trabaja
                cómodo, enfocado y respaldado.
              </p>
            </div>
            <ul className="publico revelar" aria-label="Para quién está pensado">
              {publico.map((etiqueta) => (
                <li key={etiqueta}>{etiqueta}</li>
              ))}
            </ul>
            <div className="beneficios observar">
              {beneficios.map(({ Icono, titulo, texto }, i) => (
                <article
                  key={titulo}
                  className="beneficio revelar"
                  style={{ '--d': `${i * 80}ms` } as CSSProperties}
                >
                  <span className="beneficio__icono">
                    <Icono size={22} aria-hidden="true" />
                  </span>
                  <h3 className="beneficio__titulo">{titulo}</h3>
                  <p className="beneficio__texto">{texto}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Tarjeta 2 / 3: Proceso */}
          <section id="proceso" className="seccion seccion--proceso seccion-stack tarjeta-stack" data-tarjeta="2">
            <div className="seccion__encabezado revelar">
              <h2 className="titulo-seccion">Tres pasos, cero fricción.</h2>
              <p className="entrada-seccion">
                Desde el primer minuto: la persona da su consentimiento, el análisis ocurre en su
                equipo y tu área de SST recibe evidencia lista para usar.
              </p>
            </div>
            <ol className="pasos observar">
              {pasos.map((paso, i) => (
                <li
                  key={paso.numero}
                  className="paso revelar"
                  style={{ '--d': `${i * 90}ms` } as CSSProperties}
                >
                  <span className="paso__numero">{paso.numero}</span>
                  <h3 className="paso__titulo">{paso.titulo}</h3>
                  <p className="paso__texto">{paso.texto}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Tarjeta 3 / 3: Módulos */}
          <section id="modulos" className="seccion seccion--modulos seccion-stack tarjeta-stack" data-tarjeta="3">
          <div className="placa observar">
            <div className="placa__diagrama" aria-hidden="true">
              <svg viewBox="0 0 200 560" className="placa__svg">
                <line
                  x1="100"
                  y1="40"
                  x2="100"
                  y2="520"
                  stroke="#0B1020"
                  strokeOpacity="0.14"
                  strokeWidth="1.5"
                />
                {modulos.map((modulo, i) => {
                  const n = 70 + i * 100;
                  const activo = moduloActivo === i;
                  return (
                    <g
                      key={modulo.titulo}
                      className={`placa__nodo ${activo ? 'placa__nodo--activo' : ''}`}
                      onMouseEnter={() => setModuloActivo(i)}
                    >
                      <rect
                        x={100 - (activo ? 40 : 32)}
                        y={n - 20}
                        width={activo ? 80 : 64}
                        height="26"
                        rx="8"
                      />
                      <circle cx={100 + (activo ? 74 : 60)} cy={n - 7} r={activo ? 6 : 4} />
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="placa__lista">
              <h2 className="titulo-seccion revelar">Todo lo que ocurre en un puesto de trabajo.</h2>
              <p className="entrada-seccion revelar" style={{ '--d': '80ms' } as CSSProperties}>
                Cinco módulos que comparten los mismos datos: la postura, la atención y la
                integridad, medidos donde suceden.
              </p>
              <ul className="lista-modulos">
                {modulos.map((modulo, i) => (
                  <li
                    key={modulo.titulo}
                    className={`modulo revelar ${moduloActivo === i ? 'modulo--activo' : ''}`}
                    style={{ '--d': `${120 + i * 70}ms` } as CSSProperties}
                    onMouseEnter={() => setModuloActivo(i)}
                    tabIndex={0}
                    onFocus={() => setModuloActivo(i)}
                  >
                    <span className="modulo__dato">{modulo.dato}</span>
                    <div>
                      <h3 className="modulo__titulo">{modulo.titulo}</h3>
                      <p className="modulo__texto">{modulo.texto}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        </div>

        <section id="testimonios" className="seccion seccion--testimonios">
          <div className="seccion__encabezado revelar">
            <h2 className="titulo-seccion">Equipos que ya se sientan mejor.</h2>
            <p className="entrada-seccion">
              Áreas de SST, personas y tecnología cuentan lo mismo: cuidar la postura también se
              nota en los resultados.
            </p>
          </div>
          <div className="testimonios observar">
            {testimonios.map((t, i) => (
              <figure
                key={t.autor}
                className={`testimonio revelar ${t.destacado ? 'testimonio--destacado' : ''}`}
                style={{ '--d': `${i * 90}ms` } as CSSProperties}
              >
                <blockquote className="testimonio__cita">{t.cita}</blockquote>
                <figcaption className="testimonio__autor">
                  <span className="testimonio__avatar" aria-hidden="true">
                    {t.iniciales}
                  </span>
                  <span>
                    <b>{t.autor}</b>
                    <small>{t.cargo}</small>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="privacidad" className="seccion seccion--privacidad">
          <div className="privacidad observar">
            <div className="privacidad__texto">
              <span className="chip-vivo chip-vivo--tenue">
                <span className="chip-vivo__latido" />
                Privacidad desde el diseño
              </span>
              <h2 className="titulo-seccion titulo-seccion--claro">
                El video nunca sale de tu computadora.
              </h2>
              <p className="entrada-seccion entrada-seccion--claro">
                El análisis ocurre dentro del navegador y el fotograma se descarta al instante. Lo
                único que viaja son métricas anónimas de postura y atención: nunca imágenes.
              </p>
              <ul className="lista-verificacion">
                {['Sin grabación de video', 'Buffer RAM: 0 KB', 'Consentimiento revocable en un clic'].map(
                  (item) => (
                    <li key={item}>
                      <Check size={16} aria-hidden="true" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="privacidad__panel" aria-hidden="true">
              <div className="escaneo">
                <span className="escaneo__linea" />
                <svg viewBox="0 0 220 220" className="escaneo__figura">
                  <circle cx="110" cy="66" r="30" fill="none" stroke="#C6F432" strokeWidth="2" opacity="0.85" />
                  <line x1="110" y1="96" x2="110" y2="150" stroke="#C6F432" strokeWidth="2" opacity="0.85" />
                  <line x1="110" y1="120" x2="70" y2="120" stroke="#C6F432" strokeWidth="2" opacity="0.85" />
                  <line x1="110" y1="120" x2="150" y2="120" stroke="#C6F432" strokeWidth="2" opacity="0.85" />
                  <line x1="110" y1="150" x2="86" y2="196" stroke="#C6F432" strokeWidth="2" opacity="0.85" />
                  <line x1="110" y1="150" x2="134" y2="196" stroke="#C6F432" strokeWidth="2" opacity="0.85" />
                </svg>
                <span className="escaneo__pie">Análisis local · el video nunca sale del equipo</span>
              </div>
            </div>
          </div>
        </section>

        <section id="resultados" className="seccion seccion--resultados">
          <div className="seccion__encabezado revelar">
            <h2 className="titulo-seccion">Resultados que una auditoría acepta.</h2>
            <p className="entrada-seccion">
              Indicadores de bienestar e integridad medidos en el mismo lugar donde ocurre el
              trabajo.
            </p>
          </div>
          <div className="instrumentos observar">
            {resultados.map((resultado, i) => (
              <article
                key={resultado.etiqueta}
                className="instrumento revelar"
                style={{ '--d': `${i * 90}ms` } as CSSProperties}
              >
                <svg viewBox="0 0 128 74" className="instrumento__arco" aria-hidden="true">
                  <path
                    className="instrumento__riel"
                    d="M10 64 A54 54 0 0 1 118 64"
                    fill="none"
                    stroke="#0B1020"
                    strokeOpacity="0.12"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <path
                    className="instrumento__aguja"
                    d="M10 64 A54 54 0 0 1 118 64"
                    fill="none"
                    stroke="#C6F432"
                    strokeWidth="9"
                    strokeLinecap="round"
                    style={
                      {
                        '--desplazamiento-final': `${(longitudArco * (1 - resultado.pct)).toFixed(1)}`,
                      } as CSSProperties
                    }
                  />
                </svg>
                <span className="instrumento__valor">{resultado.valor}</span>
                <span className="instrumento__etiqueta">{resultado.etiqueta}</span>
              </article>
            ))}
          </div>
          <div className="fichas revelar" style={{ '--d': '120ms' } as CSSProperties}>
            {fichas.map((ficha) => (
              <span key={ficha} className="ficha">
                {ficha}
              </span>
            ))}
          </div>

          {/* Grilla tecnológica interactiva estilo Skill-Box (Portfolio de Angelo) */}
          <div className="tecnologias-grid revelar" style={{ '--d': '160ms' } as CSSProperties}>
            {stackTecnologico.map(({ Icono, titulo, subtitulo, badge }) => (
              <div key={titulo} className="caja-habilidad" tabIndex={0}>
                <div className="caja-habilidad__icono">
                  <Icono size={26} aria-hidden="true" />
                </div>
                <div className="caja-habilidad__cuerpo">
                  <span className="caja-habilidad__badge">{badge}</span>
                  <h4 className="caja-habilidad__titulo">{titulo}</h4>
                  <p className="caja-habilidad__subtitulo">{subtitulo}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="planes" className="seccion seccion--planes">
          <div className="seccion__encabezado revelar">
            <h2 className="titulo-seccion">Planes para cada equipo.</h2>
            <p className="entrada-seccion">
              Empieza pequeño y crece cuando quieras. Sin ataduras y sin sorpresas: pagas por lo que
              realmente usas.
            </p>
          </div>
          <div className="planes observar">
            {planes.map((plan, i) => (
              <article
                key={plan.nombre}
                className={`plan revelar ${plan.recomendado ? 'plan--destacado' : ''}`}
                style={{ '--d': `${i * 90}ms` } as CSSProperties}
              >
                {plan.recomendado && <span className="plan__cinta">Más elegido</span>}
                <h3 className="plan__nombre">{plan.nombre}</h3>
                <p className="plan__tagline">{plan.tagline}</p>
                <div className="plan__precio">
                  <span className="plan__monto">{plan.precio}</span>
                  <span className="plan__unidad">{plan.unidad}</span>
                </div>
                <p className="plan__minimo">{plan.minimo}</p>
                {plan.pruebaGratis && (
                  <div className="plan__prueba">
                    <Sparkles size={13} aria-hidden="true" />
                    <span>{plan.pruebaGratis}</span>
                  </div>
                )}
                <ul className="plan__lista">
                  {plan.caracteristicas.map((caracteristica) => (
                    <li key={caracteristica}>
                      <Check size={16} aria-hidden="true" />
                      {caracteristica}
                    </li>
                  ))}
                </ul>
                <div className="plan__accion">
                  <Link
                    to={`/registro?plan=${encodeURIComponent(plan.nombre)}`}
                    className={`boton boton--ancho ${
                      plan.recomendado ? 'boton--lima' : 'boton--borde'
                    }`}
                  >
                    {plan.textoBoton}
                    <ArrowRight className="boton__flecha" size={18} aria-hidden="true" />
                  </Link>
                  {plan.pruebaGratis && (
                    <span className="plan__subnota">
                      Requiere tarjeta · $0 hoy, primer cobro tras 14 días · Cancela cuando quieras
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="planes__nota revelar">
            Facturación anual con <b>15 % de descuento</b>. Precios en USD; el IVA se aplica según la
            normativa vigente.
          </p>
        </section>

        <section id="preguntas" className="seccion seccion--faq">
          <div className="seccion__encabezado revelar">
            <h2 className="titulo-seccion">Las dudas de siempre, respondidas.</h2>
            <p className="entrada-seccion">
              Lo que suele preguntar un equipo antes de dar el paso. Si tu duda no aparece aquí,
              escríbenos: respondemos sin rodeos.
            </p>
          </div>
          <div className="faq revelar">
            {preguntas.map((item, i) => (
              <div
                key={item.pregunta}
                className={`faq__item ${faqAbierta === i ? 'faq__item--abierto' : ''}`}
              >
                <button
                  type="button"
                  className="faq__pregunta"
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  aria-expanded={faqAbierta === i}
                >
                  <span>{item.pregunta}</span>
                  <span className="faq__signo" aria-hidden="true" />
                </button>
                <div className="faq__contenido">
                  <div>
                    <p>{item.respuesta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="seccion seccion--cierre" id="cierre">
          <div className="cierre revelar">
            {/* SVG stroke typography de cierre estilo Portfolio */}
            <div className="cierre__stroke" aria-hidden="true">
              <svg viewBox="0 0 1200 200" className="banner-stroke__svg banner-stroke__svg--cierre">
                <text x="50%" y="65%" textAnchor="middle">
                  ERGOCHECK AI
                </text>
              </svg>
            </div>
            <h2 className="cierre__titulo">Empieza a medir lo que hoy solo intuyes.</h2>
            <p className="cierre__texto">
              Crea tu cuenta, invita a tu equipo y mira la primera evaluación postural en minutos.
            </p>
            <div className="cierre__acciones">
              <Link to="/registro" className="boton boton--lima boton--grande">
                Crear cuenta gratis
                <ArrowRight className="boton__flecha" size={20} aria-hidden="true" />
              </Link>
              <Link to="/login" className="boton boton--borde boton--grande">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="pie">
        <div className="pie__marca">
          <Link to="/" className="marca marca--claro" aria-label="visitask, inicio">
            <svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true">
              <circle cx="15" cy="15" r="15" fill="#0B1020" />
              <circle cx="15" cy="15" r="6" fill="none" stroke="#C6F432" strokeWidth="2.4" />
              <circle cx="15" cy="15" r="1.8" fill="#C6F432" />
            </svg>
            <span className="marca__nombre">visitask</span>
          </Link>
          <p>
            Inteligencia ergonómica en el puesto de trabajo. Procesamiento local en RAM. Hecho para
            que cuidar a tu equipo sea simple.
          </p>
        </div>

        <nav className="pie__columnas" aria-label="Enlaces del pie">
          <div>
            <h4>Producto</h4>
            <a href="#jornada">La jornada</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#modulos">Módulos</a>
          </div>
          <div>
            <h4>Recursos</h4>
            <a href="#proceso">Cómo funciona</a>
            <a href="#planes">Planes</a>
            <a href="#preguntas">Preguntas frecuentes</a>
          </div>
          <div>
            <h4>Acceso</h4>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro">Crear cuenta</Link>
            <a href="#privacidad">Privacidad</a>
          </div>
        </nav>

        <p className="pie__legal">© 2026 visitask — ErgoCheck AI. Todos los derechos reservados.</p>
      </footer>

      {/* HUD interactivo de scroll ergonómico y retorno al inicio */}
      <button
        type="button"
        className={`hud-scroll ${mostrarHud ? 'hud-scroll--visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Volver arriba, telemetría ergonómica"
        title="Volver al inicio"
      >
        <div className="hud-scroll__icono">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="4" r="2" fill="#C6F432" stroke="none" />
            <line x1="12" y1="8" x2="12" y2="10" stroke="#C6F432" />
            <line x1="12" y1="13" x2="12" y2="15" stroke="#C6F432" />
            <line x1="12" y1="18" x2="12" y2="20" stroke="#C6F432" />
          </svg>
        </div>
        <div className="hud-scroll__datos">
          <span className="hud-scroll__zona">{zonaEspina}</span>
          <span className="hud-scroll__porcentaje font-mono">
            {hojaActiva <= 3 ? `Sección ${hojaActiva}/3` : 'visitask'} · {Math.round(progresoScroll * 100)}%
          </span>
        </div>
        <div className="hud-scroll__flecha">
          <ArrowRight className="-rotate-90" size={13} />
        </div>
      </button>
    </div>
  );
}

export default LandingPage;
