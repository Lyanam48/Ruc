import os
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'cepanim-dev-secret')

DB = os.path.join(os.path.dirname(__file__), 'cepanim.db')


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS empresas (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            ruc           TEXT UNIQUE NOT NULL,
            nombre        TEXT NOT NULL,
            razon_social  TEXT,
            direccion     TEXT,
            telefono      TEXT,
            email         TEXT,
            fecha_const   TEXT,
            rep_legal     TEXT,
            num_resolucion TEXT,
            tipo_servicio TEXT,
            desc_servicio TEXT
        );

        CREATE TABLE IF NOT EXISTS citas (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            cedula    TEXT NOT NULL,
            nombre    TEXT NOT NULL,
            fecha_cita TEXT,
            hora_cita  TEXT,
            telefono   TEXT,
            lugar      TEXT,
            estado     TEXT DEFAULT "Pendiente"
        );
    ''')

    if conn.execute('SELECT COUNT(*) FROM citas').fetchone()[0] == 0:
        conn.executemany(
            'INSERT INTO citas (cedula, nombre, fecha_cita, hora_cita, telefono, lugar, estado) VALUES (?,?,?,?,?,?,?)',
            [
                ('8-123-456', 'Jorge Perez',
                 '22 de Julio, 2026', '10:00 AM',
                 'Fijo: 223-4567  |  Celular: 6950-1090',
                 'Centro de Convenciones Atlapa', 'Confirmada'),
                ('4-789-012', 'María González',
                 '25 de Julio, 2026', '2:30 PM',
                 'Celular: 6123-4567',
                 'Ministerio de Economía y Finanzas - Sede Central', 'Pendiente'),
            ]
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Page routes
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        ruc = request.form.get('ruc', '').strip()
        action = request.form.get('action', '')
        if not ruc:
            error = 'Por favor ingrese su RUC o NIT.'
        else:
            session['ruc'] = ruc
            if action == 'registrar':
                return redirect(url_for('registro'))
            return redirect(url_for('citas'))
    return render_template('login.html', error=error)


@app.route('/registro', methods=['GET', 'POST'])
def registro():
    error = None
    if request.method == 'POST':
        fields = ['empresa', 'ruc', 'razonSocial', 'direccion', 'telefono',
                  'email', 'fechaConst', 'repLegal', 'numResolucion', 'tipoServicio']
        data = {f: request.form.get(f, '').strip() for f in fields + ['descServicio']}

        if any(not data[f] for f in fields):
            error = 'Por favor complete todos los campos obligatorios.'
        else:
            try:
                conn = get_db()
                conn.execute(
                    '''INSERT INTO empresas
                       (ruc, nombre, razon_social, direccion, telefono, email,
                        fecha_const, rep_legal, num_resolucion, tipo_servicio, desc_servicio)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
                    (data['ruc'], data['empresa'], data['razonSocial'],
                     data['direccion'], data['telefono'], data['email'],
                     data['fechaConst'], data['repLegal'], data['numResolucion'],
                     data['tipoServicio'], data['descServicio'])
                )
                conn.commit()
                conn.close()
                flash('Empresa registrada exitosamente.', 'success')
                return redirect(url_for('citas'))
            except sqlite3.IntegrityError:
                error = f"El RUC '{data['ruc']}' ya está registrado."

    return render_template('registro.html', error=error)


@app.route('/citas')
def citas():
    return render_template('citas.html')


# ---------------------------------------------------------------------------
# API routes (used by citas.js via fetch)
# ---------------------------------------------------------------------------

@app.route('/api/citas/buscar')
def api_buscar():
    q = request.args.get('q', '').strip().lower()
    if not q:
        return jsonify({'error': 'Ingrese una cédula o número de seguro social.'}), 400

    conn = get_db()
    rows = conn.execute(
        'SELECT * FROM citas WHERE lower(cedula) LIKE ? OR lower(nombre) LIKE ?',
        (f'%{q}%', f'%{q}%')
    ).fetchall()
    conn.close()

    if not rows:
        return jsonify({'error': 'No se encontraron citas para ese documento.'}), 404

    return jsonify([dict(r) for r in rows])


@app.route('/api/citas/<int:cita_id>/estado', methods=['POST'])
def api_estado(cita_id):
    data = request.get_json(silent=True) or {}
    estado = data.get('estado')
    if estado not in ('Confirmada', 'Cancelada', 'Pendiente'):
        return jsonify({'error': 'Estado inválido.'}), 400

    conn = get_db()
    conn.execute('UPDATE citas SET estado=? WHERE id=?', (estado, cita_id))
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'estado': estado})


# ---------------------------------------------------------------------------

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=8000, debug=False)
