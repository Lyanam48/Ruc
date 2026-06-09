document.getElementById('btnRegistrar').addEventListener('click', () => {
  const ruc = document.getElementById('inputRuc').value.trim();
  if (!ruc) {
    showError('Por favor ingrese su RUC o NIT.');
    return;
  }
  window.location.href = 'registro.html';
});

document.getElementById('btnIniciar').addEventListener('click', () => {
  const ruc = document.getElementById('inputRuc').value.trim();
  if (!ruc) {
    showError('Por favor ingrese su RUC o NIT para iniciar sesión.');
    return;
  }
  window.location.href = 'citas.html';
});

document.getElementById('btnBack').addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.getElementById('inputRuc').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btnIniciar').click();
});

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}
