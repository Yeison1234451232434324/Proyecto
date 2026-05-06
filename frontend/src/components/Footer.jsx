import { motion } from 'framer-motion';
import './Footer.css';

const logoUrl = 'https://ring-jolly-65702283.figma.site/_components/v2/e0408a7a35d33af08a7755bdceb796e3d4222435/WhatsApp_Image_2026-02-22_at_6.32.28_PM.749377f2.png';

const horarios = [
  { dia: 'Domingo - Culto Principal', hora: '10:00 AM' },
  { dia: 'Miércoles - Estudio Bíblico', hora: '7:00 PM' },
  { dia: 'Viernes - Reunión Jóvenes', hora: '6:00 PM' },
  { dia: 'Sábado - Oración Matutina', hora: '8:00 AM' },
];

export default function Footer() {
  return (
    <footer className="footer" id="contacto">
      {/* Línea dorada animada */}
      <motion.div
        className="footer-topline"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="footer-grid">
        {/* Col 1 - Brand */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="footer-brand">
            <motion.img
              src={logoUrl}
              alt="Logo"
              className="footer-logo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <h4>Bajo Su Presencia</h4>
          </div>
          <p className="footer-about">
            Somos una comunidad de fe fundada en 1995, dedicada a llevar el mensaje
            de amor y esperanza de Cristo a todas las personas. Nuestra misión es
            crear un espacio donde cada alma encuentre refugio, sanación y propósito
            bajo la presencia divina.
          </p>
          <div className="footer-social">
            <motion.a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              f
            </motion.a>
          </div>
        </motion.div>

        {/* Col 2 - Contacto */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h4 className="footer-col-title">Contacto</h4>
          <div className="footer-contact-list">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <p>Calle 45 #12-34<br />Localidad de Chapinero<br />Bogotá, Colombia</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <a href="tel:+5716012345">+57 (601) 234-5678</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <a href="mailto:contacto@bajosupresencia.org">contacto@bajosupresencia.org</a>
            </div>
          </div>
        </motion.div>

        {/* Col 3 - Horarios */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h4 className="footer-col-title">Horarios de Servicio</h4>
          <ul className="horarios-list">
            {horarios.map((h, i) => (
              <li key={i}>
                <span>{h.dia}</span>
                <span className="hora">{h.hora}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Iglesia Bajo Su Presencia. Todos los derechos reservados.</p>
        <p className="footer-verse">"En su presencia hay plenitud de gozo" — Salmos 16:11</p>
      </div>
    </footer>
  );
}
