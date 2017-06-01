from flask import Flask, render_template, request
import pywebpush

app = Flask(__name__, static_url_path='')

push_private_key = 'UYShv8XsulV849jsi3HxZjHY_C6oTKWIkkVLT3BD3gc'

subscriptions = []

@app.route('/')
def index():
    return render_template('index.jinja')

@app.route('/push')
def push():
    for subscription in subscriptions:
        print(subscription)
        pywebpush.webpush(
            subscription,
            "This is a test",
            vapid_private_key=push_private_key,
            vapid_claims={
                'sub': 'mailto:kyle@periks.net',
                'aud': 'https://pwa.kyleperik.com'
            }
        )
    return 'okay!'

@app.route('/subscription', methods=['POST'])
def subscription():
    subscriptions.append(request.get_json())
    return 'okay!'

app.run(host='0.0.0.0', port=1234)
