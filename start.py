from flask import Flask, render_template, request

app = Flask(__name__, static_url_path='')

@app.route('/')
def index():
    return render_template('index.jinja')

app.run(host='0.0.0.0', port=1234, debug=True)
