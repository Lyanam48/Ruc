// Sample data
const citasData = [
  {
    cedula: '8-123-456',
    nombre: 'Jorge Perez',
    fechaCita: '22 de Julio, 2026',
    horaCita: '10:00 AM',
    telefono: 'Fijo: 223-4567  |  Celular: 6950-1090',
    lugar: 'Centro de Convenciones Atlapa',
    estado: 'Confirmada'
  },
  {
    cedula: '4-789-012',
    nombre: 'María González',
    fechaCita: '25 de Julio, 2026',
    horaCita: '2:30 PM',
    telefono: 'Celular: 6123-4567',
    lugar: 'Ministerio de Economía y Finanzas - Sede Central',
    estado: 'Pendiente'
  }
];

let currentIndex = -1;
let results = [];

document.getElementById('btnConsultar').addEventListener('click', consultarCita);
document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') consultarCita();
});

function consultarCita() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!query) {
    showToast('Ingrese una cédula o número de seguro social.', 'warn');
    return;
  }
  results = citasData.filter(c => c.cedula.toLowerCase().includes(query) || c.nombre.toLowerCase().includes(query));
  if (results.length === 0) {
    showToast('No se encontraron citas para ese documento.', 'error');
    document.getElementById('infoPanel').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    return;
  }
  currentIndex = 0;
  renderCita();
}

function renderCita() {
  const c = results[currentIndex];
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('infoPanel').style.display = 'block';

  document.getElementById('valCedula').textContent = c.cedula;
  document.getElementById('valNombre').textContent = c.nombre;
  document.getElementById('valFecha').textContent = c.fechaCita;
  document.getElementById('valHora').textContent = c.horaCita;
  document.getElementById('valTelefono').textContent = c.telefono;
  document.getElementById('valLugar').textContent = c.lugar;

  const estadoEl = document.getElementById('valEstado');
  estadoEl.textContent = c.estado;
  estadoEl.className = 'estado-badge estado-' + c.estado.toLowerCase();

  document.getElementById('btnAnterior').disabled = currentIndex === 0;
  document.getElementById('btnSiguiente').disabled = currentIndex === results.length - 1;
  document.getElementById('pageInfo').textContent = `${currentIndex + 1} / ${results.length}`;
}

document.getElementById('btnAnterior').addEventListener('click', () => {
  if (currentIndex > 0) { currentIndex--; renderCita(); }
});

document.getElementById('btnSiguiente').addEventListener('click', () => {
  if (currentIndex < results.length - 1) { currentIndex++; renderCita(); }
});

document.getElementById('btnReprogramar').addEventListener('click', () => {
  showToast('Función de reprogramación en desarrollo.', 'info');
});

document.getElementById('btnCancelar').addEventListener('click', () => {
  if (currentIndex < 0) return;
  if (confirm('¿Desea cancelar esta cita?')) {
    results[currentIndex].estado = 'Cancelada';
    renderCita();
    showToast('Cita cancelada.', 'warn');
  }
});

document.getElementById('btnNueva').addEventListener('click', () => {
  window.location.href = 'registro.html';
});

document.getElementById('btnConfirmar').addEventListener('click', () => {
  if (currentIndex < 0) return;
  results[currentIndex].estado = 'Confirmada';
  renderCita();
  showToast('Cita confirmada exitosamente.', 'success');
});

document.getElementById('btnBack').addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Toast notification
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast toast-' + type + ' show';
  setTimeout(() => toast.classList.remove('show'), 3000);
}
