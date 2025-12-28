from flask import render_template_string, request
from jinja2 import Environment, Template

# Vulnerable: render_template_string with variable
@app.route('/render')
def vulnerable_render():
    template = request.args.get('template')
    # <expect-error>
    return render_template_string(template)

# Vulnerable: render_template_string with request data
@app.route('/render2')
def vulnerable_render2():
    # <expect-error>
    return render_template_string(request.form.get('tpl'))

# Vulnerable: Environment.from_string
def vulnerable_jinja(user_template):
    env = Environment()
    # <expect-error>
    return env.from_string(user_template).render()

# Vulnerable: jinja_env.from_string
def vulnerable_jinja_env(template_str):
    # <expect-error>
    return jinja_env.from_string(template_str).render()

# Vulnerable: Template() constructor with variable
def vulnerable_template(user_input):
    # <expect-error>
    t = Template(user_input)
    return t.render()

# Vulnerable: Template with request data
def vulnerable_template_request():
    # <expect-error>
    return Template(request.data.decode()).render()

# <no-error> - render_template with predefined file
@app.route('/safe')
def safe_render():
    name = request.args.get('name')
    return render_template('welcome.html', name=name)

# <no-error> - Static template string
def safe_static():
    return render_template_string("Hello, {{ name }}", name=safe_name)

# <no-error> - Template from file
def safe_template_file():
    with open('template.html') as f:
        return Template(f.read()).render()

# <no-error> - Environment loading from files
def safe_env_file():
    env = Environment(loader=FileSystemLoader('templates'))
    return env.get_template('page.html').render()
