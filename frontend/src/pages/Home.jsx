import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { get } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.css';

const eventGradients = [
  'from-purple-500 to-indigo-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
];

const noticiasFallback = [
  {
    titulo: 'Inauguración del Nuevo Salón de Oración',
    contenido: 'Con gran alegría anunciamos la apertura de nuestro nuevo espacio dedicado a la oración y meditación.',
    imagen_url: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&h=600&fit=crop',
    publicado_en: '2026-04-15T00:00:00',
  },
  {
    titulo: 'Retiro Espiritual de Jóvenes',
    contenido: 'Los días 25-27 de abril realizaremos nuestro retiro anual para jóvenes en la Casa de Retiros.',
    imagen_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
    publicado_en: '2026-04-10T00:00:00',
  },
];

const eventosFallback = [
  { titulo: 'Servicio Dominical', fecha: '2026-04-20', hora: '10:00 AM - 12:00 PM', ubicacion: 'Santuario Principal', voluntarios_necesarios: 10 },
  { titulo: 'Estudio Bíblico', fecha: '2026-04-23', hora: '7:00 PM - 9:00 PM', ubicacion: 'Salón de Conferencias', voluntarios_necesarios: 5 },
];

const oracionFallback = {
  contenido: 'Padre Celestial, en este día te pedimos tu guía y bendición. Que tu luz ilumine nuestro camino y tu amor llene nuestros corazones. Ayúdanos a ser instrumentos de tu paz y a llevar esperanza a quienes nos rodean.',
  versiculo: null,
};

function HeroParticle({ delay, x }) {
  return (
    <motion.div
      className="hero-particle"
      style={{ left: `${x}%` }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: -120, opacity: [0, 0.8, 0] }}
      transition={{ duration: 4 + Math.random() * 3, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [oracion, setOracion] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([get('/noticias'), get('/oracion'), get('/eventos')])
      .then(([n, o, e]) => {
        setNoticias(Array.isArray(n) ? n : []);
        setOracion(o && !o.error ? o : null);
        setEventos(Array.isArray(e) ? e : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const noticiasData = noticias.length > 0 ? noticias : noticiasFallback;
  const eventosData = eventos.length > 0 ? eventos : eventosFallback;
  const oracionData = oracion || oracionFallback;

  const formatFecha = (str) => {
    if (!str) return '';
    try {
      return new Date(str).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return str; }
  };

  const formatEventoFecha = (str) => {
    if (!str) return '';
    try {
      return new Date(str).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch { return str; }
  };

  return (
    <div className="home">
      <Navbar />

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-overlay" />
        {[...Array(12)].map((_, i) => (
          <HeroParticle key={i} delay={i * 0.4} x={Math.random() * 100} />
        ))}
        <motion.div className="hero-circle hero-circle-1" animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="hero-circle hero-circle-2" animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 8, repeat: Infinity }} />

        <div className="hero-content">
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }}>
            <motion.div className="hero-badge" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
              <span className="hero-badge-dot" />
              Bogotá, Colombia · Desde 1995
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9 }}>
              Bienvenidos a<br />
              <span className="hero-brand">Bajo Su Presencia</span>
            </motion.h1>

            <motion.p className="hero-verse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}>
              "Porque donde están dos o tres congregados en mi nombre,
              allí estoy yo en medio de ellos."
            </motion.p>

            <motion.p className="hero-ref" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}>
              Mateo 18:20
            </motion.p>

            <motion.div className="hero-scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.8 }}>
              <div className="scroll-line" />
              <span className="scroll-label">Descubre más</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ORACION */}
      <section className="oracion-section" id="oracion">
        <motion.div className="deco-ring deco-ring-tr" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="deco-ring deco-ring-bl" animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} />
        <div className="container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="section-eyebrow">Reflexión diaria</div>
            <h2>Oración del Día</h2>
            <p className="section-sub">Un momento de paz y conexión con lo divino</p>
          </motion.div>

          {loading ? (
            <div className="skeleton-card" />
          ) : (
            <motion.div className="oracion-card" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.8 }}>
              <div className="corner corner-tl" />
              <div className="corner corner-br" />
              {oracionData.imagen_url && (
                <div className="oracion-img-wrap">
                  <img src={oracionData.imagen_url} alt="Oración" onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <motion.p className="oracion-text" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.8 }}>
                {oracionData.contenido}
              </motion.p>
              {oracionData.versiculo && <p className="oracion-versiculo">— {oracionData.versiculo}</p>}
              <motion.span className="amen" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                Amén
              </motion.span>
            </motion.div>
          )}
        </div>
      </section>

      {/* NOTICIAS */}
      <section className="noticias-section" id="noticias">
        <div className="container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="section-eyebrow">Comunidad</div>
            <h2>Noticias y Anuncios</h2>
            <p className="section-sub">Mantente informado sobre lo que sucede en nuestra comunidad</p>
          </motion.div>

          {loading ? (
            <div className="noticias-grid">
              {[1, 2].map(i => <div key={i} className="skeleton-card tall" />)}
            </div>
          ) : (
            <div className="noticias-grid">
              {noticiasData.map((n, i) => (
                <motion.article key={i} className="noticia-card" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2, duration: 0.6 }}>
                  <div className="noticia-img-wrap">
                    <img src={n.imagen_url || n.imagen} alt={n.titulo} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&h=600&fit=crop'; }} />
                    <div className="noticia-img-overlay" />
                  </div>
                  <div className="noticia-body">
                    <h4>{n.titulo}</h4>
                    <p>{n.Descripcion || n.contenido}</p>
                    <div className="noticia-meta">
                      <span>{formatFecha(n.publicado_en || n.fecha)}</span>
                      {n.autor && <span>{n.autor}</span>}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* EVENTOS */}
      <section className="eventos-section" id="eventos">
        <div className="container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="section-eyebrow">Agenda</div>
            <h2>Próximos Eventos</h2>
            <p className="section-sub">Únete a nosotros en estas experiencias espirituales</p>
          </motion.div>

          {loading ? (
            <div className="eventos-grid">
              {[1, 2].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : (
            <div className="eventos-grid">
              {eventosData.map((e, i) => (
                <motion.div key={i} className="evento-card" initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }} whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}>
                  <div className={`evento-bar bg-gradient-to-r ${eventGradients[i % eventGradients.length]}`} />
                  <div className="evento-body">
                    <h4>{e.titulo || e.nombre}</h4>
                    <ul className="evento-info">
                      <li><span className="ei-icon">📅</span><span>{e.fecha ? formatEventoFecha(e.fecha) : e.fecha}</span></li>
                      {(e.hora || e.horario) && <li><span className="ei-icon">🕐</span><span>{e.hora || e.horario}</span></li>}
                      {e.ubicacion && <li><span className="ei-icon">📍</span><span>{e.ubicacion}</span></li>}
                      {e.voluntarios_necesarios && <li><span className="ei-icon">👥</span><span>{e.voluntarios_necesarios} voluntarios necesarios</span></li>}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
