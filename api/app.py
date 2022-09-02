from flask import Flask
from chart import chart

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.register_blueprint(chart, url_prefix='/chart')

@app.route('/')
def hello_world():
    return 'hello world'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=9001)