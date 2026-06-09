document.getElementById('formRegistro').addEventListener('submit', (e) => {
  e.preventDefault();
  const required = ['empresa', 'ruc', 'razonSocial', 'direccion', 'telefono', 'email', 'fechaConst', 'repLegal', 'numResolucion', 'tipoServicio'];
  let valid = true;

  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.style.borderColor = '#d52b1e';
      valid = false;
    } else {
      el.style.borderColor = '';
    }
  });

  if (!valid) {
    showMsg('Por favor complete todos los campos obligatorios.', 'error');
    return;
  }

  showMsg('Empresa registrada exitosamente. Será redirigido...', 'success');
  setTimeout(() => { window.location.href = 'citas.html'; }, 2000);
});

document.getElementById('btnBack').addEventListener('click', () => {
  window.location.href = 'login.html';
});

function showMsg(msg, type) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg;
  el.className = 'status-msg ' + type;
  el.style.display = 'block';
  if (type !== 'success') {
    setTimeout(() => { el.style.display = 'none'; }, 3500);
  }
}
