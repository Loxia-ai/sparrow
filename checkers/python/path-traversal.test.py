from flask import Flask, request, send_file, abort
from pathlib import Path
import os

app = Flask(__name__)

# Vulnerable: Direct path concatenation
@app.route('/download/<filename>')
def download_file(filename):
    # <expect-error>
    return send_file('/uploads/' + filename)

# Vulnerable: open() with user input
@app.route('/read')
def read_file():
    filename = request.args.get('file')
    # <expect-error>
    with open('/data/' + filename, 'r') as f:
        return f.read()

# Vulnerable: os.path.join with request data
@app.route('/view/<path:filepath>')
def view_file(filepath):
    # <expect-error>
    full_path = os.path.join('/documents', request.args['name'])
    return open(full_path).read()

# Vulnerable: send_file with request attribute
@app.route('/get')
def get_file():
    # <expect-error>
    return send_file(request.args.get('path'))

# <no-error> - Static file path
@app.route('/static-file')
def static_file():
    return send_file('/static/readme.txt')

# <no-error> - Validated path
@app.route('/safe/<filename>')
def safe_download(filename):
    UPLOAD_DIR = Path('/uploads').resolve()
    safe_name = Path(filename).name
    file_path = (UPLOAD_DIR / safe_name).resolve()

    if not str(file_path).startswith(str(UPLOAD_DIR)):
        abort(403)

    return send_file(file_path)

# <no-error> - Allowlist
ALLOWED_FILES = ['report.pdf', 'summary.txt']

@app.route('/allowed/<filename>')
def allowed_file(filename):
    if filename not in ALLOWED_FILES:
        abort(404)
    return send_file(f'/uploads/{filename}')
