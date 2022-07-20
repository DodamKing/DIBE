from flask import Flask, jsonify

import requests
from bs4 import BeautifulSoup as bs
# import json
from collections import OrderedDict

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

@app.route('/')
def hello_world():
    return 'hello world'

@app.route('/chart')
def get_chart():
    url = 'https://music.bugs.co.kr/chart'
    data = requests.get(url)
    soup = bs(data.text, 'html.parser')

    titles = soup.select('p.title')
    artists = soup.select('p.artist')
    imgs = soup.select('.list>tbody>tr')

    title_list = []
    artist_list = []
    img_list = []

    for i in range(100):
        title_list.append(titles[i].text.strip())
        artist_list.append(artists[i].select('a')[0].text)
        img_list.append(imgs[i].select('a>img')[0].get('src'))

    data = OrderedDict()
    data["title"] = title_list
    data["artist"] = artist_list
    data["img"] = img_list

    # chart = json.dumps(data, ensure_ascii=False, indent="\t")

    # with open('chart.json', 'w', encoding='utf-8') as make_file:
    #     json.dump(data, make_file, ensure_ascii=False, indent="\t")

    # with open('./chart.json', 'r', encoding='utf-8') as f:
    #     chart = json.load(f)

    return jsonify(data)
    # return chart


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)