from flask import Flask
from chart import chart
from songs import songs

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.register_blueprint(chart, url_prefix='/chart')
app.register_blueprint(songs, url_prefix='/songs')

@app.route('/')
def hello_world():
    return 'hello world'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=9001)