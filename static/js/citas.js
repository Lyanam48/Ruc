let results = [];
let currentIndex = -1;

document.getElementById('btnConsultar').addEventListener('click', consultarCita);
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') consultarCita();
});

async function consultarCita() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) { showToast('Ingrese una cédula o número de seguro social.', 'warn'); return; }

  try {
    const res = await fetch(`${API.buscar}?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Error al buscar.', 'error');
      document.getElementById('infoPanel').style.display = 'none';
      document.getElementById('emptyState').style.display = 'block';
      return;
    }

    results = data;
    currentIndex = 0;
    renderCita();
  } catch {
    showToast('Error de conexión con el servidor.', 'error');
  }
}

function renderCita() {
  const c = results[currentIndex];
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('infoPanel').style.display = 'block';

  document.getElementById('valCedula').textContent  = c.cedula;
  document.getElementById('valNombre').textContent  = c.nombre;
  document.getElementById('valFecha').textContent   = c.fecha_cita;
  document.getElementById('valHora').textContent    = c.hora_cita;
  document.getElementById('valTelefono').textContent = c.telefono;
  document.getElementById('valLugar').textContent   = c.lugar;

  const estadoEl = document.getElementById('valEstado');
  estadoEl.textContent = c.estado;
  estadoEl.className   = 'estado-badge estado-' + c.estado.toLowerCase();

  document.getElementById('btnAnterior').disabled  = currentIndex === 0;
  document.getElementById('btnSiguiente').disabled = currentIndex === results.length - 1;
  document.getElementById('pageInfo').textContent  = `${currentIndex + 1} / ${results.length}`;
}

document.getElementById('btnAnterior').addEventListener('click', () => {
  if (currentIndex > 0) { currentIndex--; renderCita(); }
});
document.getElementById('btnSiguiente').addEventListener('click', () => {
  if (currentIndex < results.length - 1) { currentIndex++; renderCita(); }
});

document.getElementById('btnReprogramar').addEventListener('click', () =>
  showToast('Función de reprogramación en desarrollo.', 'info'));

document.getElementById('btnCancelar').addEventListener('click', async () => {
  if (currentIndex < 0) return;
  if (!confirm('¿Desea cancelar esta cita?')) return;
  await cambiarEstado('Cancelada');
});

document.getElementById('btnNueva').addEventListener('click', () => {
  window.location.href = API.registro;
});

document.getElementById('btnConfirmar').addEventListener('click', async () => {
  if (currentIndex < 0) return;
  await cambiarEstado('Confirmada');
});

async function cambiarEstado(estado) {
  const id = results[currentIndex].id;
  try {
    const res = await fetch(`${API.estado}${id}/estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    const data = await res.json();
    if (res.ok) {
      results[currentIndex].estado = estado;
      renderCita();
      showToast(estado === 'Confirmada' ? 'Cita confirmada.' : 'Cita cancelada.', estado === 'Confirmada' ? 'success' : 'warn');
    } else {
      showToast(data.error, 'error');
    }
  } catch {
    showToast('Error de conexión.', 'error');
  }
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}
