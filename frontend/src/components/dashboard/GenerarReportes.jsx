import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Module.css';

const tipos = [
  { id: 'eventos', label: 'Reporte de Eventos', desc: 'Resumen de eventos realizados con ofrendas e incidentes' },
  { id: 'voluntarios', label: 'Reporte de Voluntarios', desc: 'Actividad y calificaciones de todos los voluntarios' },
  { id: 'asistencia', label: 'Reporte de Asistencia', desc: 'Estadísticas de asistencia de voluntarios por evento' },
  { id: 'ofrendas', label: 'Reporte de Ofrendas', desc: 'Resumen financiero de ofrendas y diezmos recibidos' },
];

export default function GenerarReportes() {
  const [tipo, setTipo] = useState('eventos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(false);
  const [recientes, setRecientes] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bsp_reportes') || '[]');
    setRecientes(saved.slice(0, 3));
  }, []);

  const generarPDF = async () => {
    setLoading(true);
    let datos = [];
    try {
      const params = desde && hasta ? `?desde=${desde}&hasta=${hasta}` : '';
      datos = await get(`/reportes/${tipo}${params}`);
      if (!Array.isArray(datos)) datos = [];
    } catch { datos = []; }

    const doc = new jsPDF();
    const tipoLabel = tipos.find(t => t.id === tipo)?.label || tipo;

    // Header dorado
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Iglesia Bajo Su Presencia', 105, 14, { align: 'center' });
    doc.setFontSize(12);
    doc.text(tipoLabel, 105, 24, { align: 'center' });

    // Info
    doc.setTextColor(93, 64, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${desde || 'Inicio'} — ${hasta || 'Hoy'}`, 14, 45);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 52);

    // Tabla
    if (datos.length > 0) {
      const cols = Object.keys(datos[0]);
      const rows = datos.map(d => cols.map(c => d[c] ?? ''));
      autoTable(doc, {
        startY: 60,
        head: [cols],
        body: rows,
        headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [255, 248, 220] },
        styles: { font: 'helvetica', fontSize: 9 },
      });
    } else {
      doc.text('No hay datos para el período seleccionado.', 14, 65);
    }

    // Footer
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Iglesia Bajo Su Presencia — Bogotá, Colombia', 14, 290);
      doc.text(`Página ${i} de ${pages}`, 196, 290, { align: 'right' });
    }

    const nombre = `${tipoLabel}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombre);

    // Guardar en recientes
    const nuevo = { nombre, fecha: new Date().toLocaleDateString('es-CO'), tipo };
    const saved = JSON.parse(localStorage.getItem('bsp_reportes') || '[]');
    const updated = [nuevo, ...saved].slice(0, 10);
    localStorage.setItem('bsp_reportes', JSON.stringify(updated));
    setRecientes(updated.slice(0, 3));
    setLoading(false);
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>📊 Generar Reportes</h2>
        <p>Genera y descarga reportes en formato PDF</p>
      </div>

      <div className="reportes-tipos">
        {tipos.map(t => (
          <div key={t.id} className={`tipo-card ${tipo === t.id ? 'active' : ''}`} onClick={() => setTipo(t.id)}>
            <strong>{t.label}</strong>
            <p>{t.desc}</p>
          </div>
        ))}
      </div>

      <div className="module-form">
        <div className="form-grid-2">
          <div className="form-group">
            <label>Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
        </div>
        <button className="btn-gold" onClick={generarPDF} disabled={loading}>
          {loading ? 'Generando...' : '📥 Generar y Descargar PDF'}
        </button>
      </div>

      {recientes.length > 0 && (
        <div className="recientes-section">
          <h3>📁 Reportes Recientes</h3>
          {recientes.map((r, i) => (
            <div key={i} className="reciente-row">
              <span>📄 {r.nombre}</span>
              <span className="fecha-muted">{r.fecha}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
