import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { get } from '../../../services/api';
import '../../admin/modules/Dashboard.css';

const COLORS = ['#D4AF37','#8B6914','#5D4037','#10B981','#3B82F6','#8B5CF6'];

const statCards = [
  { key: 'usuarios', label: 'Total Usuarios', icon: '👥', color: 'from-blue-500 to-cyan-400' },
  { key: 'eventos', label: 'Eventos Creados', icon: '📅', color: 'from-amber-500 to-orange-400' },
  { key: 'noticias', label: 'Noticias Publicadas', icon: '📰', color: 'from-purple-500 to-pink-400' },
  { key: 'voluntarios', label: 'Voluntarios Activos', icon: '🙋', color: 'from-green-500 to-emerald-400' },
  { key: 'sedes', label: 'Total Sedes', icon: '🏛️', color: 'from-rose-500 to-red-400' },
  { key: 'recursos', label: 'Recursos Inventario', icon: '📦', color: 'from-yellow-500 to-amber-400' },
  { key: 'actividades', label: 'Actividades Creadas', icon: '✅', color: 'from-teal-500 to-cyan-400' },
  { key: 'oraciones', label: 'Oraciones Publicadas', icon: '🕊️', color: 'from-indigo-500 to-blue-400' },
];

const meses = ['Ene','Feb','Mar','Abr','May','Jun'];

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('/dashboard/stats').then(d => {
      if (d && !d.error) setStats(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Datos de ejemplo para gráficas (se reemplazarían con datos reales)
  const areaData = meses.map((m, i) => ({
    mes: m,
    usuarios: (stats.usuarios || 10) + i * 3,
    voluntarios: Math.floor((stats.voluntarios || 5) + i * 1.5),
  }));

  const barData = [
    { name: 'Noticias', valor: stats.noticias || 0 },
    { name: 'Oraciones', valor: stats.oraciones || 0 },
    { name: 'Eventos', valor: stats.eventos || 0 },
    { name: 'Actividades', valor: stats.actividades || 0 },
    { name: 'Recursos', valor: stats.recursos || 0 },
  ];

  const lineData = meses.map((m, i) => ({
    mes: m,
    eventos: Math.max(0, (stats.eventos || 2) - i + Math.floor(Math.random() * 3)),
    actividades: Math.max(0, (stats.actividades || 4) - i + Math.floor(Math.random() * 4)),
  }));

  const pieData = [
    { name: 'Música', value: 20 },
    { name: 'Niños', value: 25 },
    { name: 'Recepción', value: 15 },
    { name: 'Multimedia', value: 18 },
    { name: 'Limpieza', value: 12 },
    { name: 'Otros', value: 10 },
  ];

  return (
    <div className="dashboard-wrap">
      <div className="module-header">
        <h2>📊 Dashboard</h2>
        <p>Resumen general del sistema</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <motion.div
            key={s.key}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className={`stat-icon bg-gradient-to-br ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{loading ? '...' : (stats[s.key] ?? 0)}</span>
              <span className="stat-label">{s.label}</span>
            </div>
            <span className="stat-growth">+{Math.floor(Math.random() * 10) + 1} ↑</span>
          </motion.div>
        ))}
      </div>

      {/* Gráficas */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Crecimiento de Usuarios</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="usuarios" stroke="#3B82F6" fill="url(#gU)" name="Total Usuarios" />
              <Area type="monotone" dataKey="voluntarios" stroke="#EC4899" fill="url(#gV)" name="Voluntarios" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Contenido Publicado</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="valor" fill="#D4AF37" radius={[6,6,0,0]} name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Eventos y Actividades por Mes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="eventos" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} name="Eventos" />
              <Line type="monotone" dataKey="actividades" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Actividades" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Voluntarios por Área</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Paneles inferiores */}
      <div className="info-panels">
        <ActividadReciente />
        <VoluntariosDestacados />
        <ProximosEventos />
      </div>
    </div>
  );
}

function ActividadReciente() {
  const items = [
    { accion: 'Nuevo evento creado', usuario: 'Admin', tiempo: 'hace 5 min' },
    { accion: 'Noticia publicada', usuario: 'Colaborador', tiempo: 'hace 20 min' },
    { accion: 'Usuario registrado', usuario: 'Sistema', tiempo: 'hace 1 hora' },
    { accion: 'Reporte cargado', usuario: 'Admin', tiempo: 'hace 2 horas' },
    { accion: 'Oración publicada', usuario: 'Admin', tiempo: 'hace 3 horas' },
  ];
  return (
    <div className="info-panel">
      <h4>🕐 Actividad Reciente</h4>
      {items.map((it, i) => (
        <div key={i} className="activity-item">
          <div>
            <p>{it.accion}</p>
            <span>{it.usuario}</span>
          </div>
          <span className="time-ago">{it.tiempo}</span>
        </div>
      ))}
    </div>
  );
}

function VoluntariosDestacados() {
  const [vols, setVols] = useState([]);
  useEffect(() => {
    get('/evaluaciones/destacados').then(r => Array.isArray(r) && setVols(r.slice(0, 4)));
  }, []);
  const fallback = [
    { nombre: 'María García', eventos: 8, calificacion: 5.0 },
    { nombre: 'Carlos López', eventos: 6, calificacion: 4.8 },
    { nombre: 'Ana Martínez', eventos: 5, calificacion: 4.7 },
    { nombre: 'Luis Rodríguez', eventos: 4, calificacion: 4.5 },
  ];
  const data = vols.length > 0 ? vols : fallback;
  return (
    <div className="info-panel">
      <h4>🏅 Voluntarios Destacados</h4>
      {data.map((v, i) => (
        <div key={i} className="vol-dest-item">
          <span className="vol-pos">{i + 1}</span>
          <div className="vol-avatar sm">{v.nombre?.[0]}</div>
          <div className="vol-dest-info">
            <p>{v.nombre}</p>
            <span>{v.eventos} eventos</span>
          </div>
          <span className="vol-cal">🏅 {v.calificacion}</span>
        </div>
      ))}
    </div>
  );
}

function ProximosEventos() {
  const [eventos, setEventos] = useState([]);
  useEffect(() => {
    get('/eventos/todos').then(r => Array.isArray(r) && setEventos(r.slice(0, 4)));
  }, []);
  return (
    <div className="info-panel">
      <h4>📅 Próximos Eventos</h4>
      {eventos.map((ev, i) => (
        <div key={i} className="prox-ev-item">
          <div>
            <p>{ev.titulo}</p>
            <span>{ev.fecha}</span>
          </div>
          <span className="ev-vols">👥 {ev.voluntarios_count || 0}</span>
        </div>
      ))}
      {eventos.length === 0 && <p className="empty-msg">Sin eventos próximos</p>}
    </div>
  );
}

