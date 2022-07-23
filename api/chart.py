from flask import jsonify, Blueprint

import requests
from bs4 import BeautifulSoup as bs
from collections import OrderedDict

chart = Blueprint('chart', __name__)

@chart.route('/')
def get_chart():
    # url = 'https://music.bugs.co.kr/chart' # 실시간
    url = 'https://music.bugs.co.kr/chart/track/day/total' # 일간
    data = requests.get(url)
    soup = bs(data.text, 'html.parser')

    titles = soup.select('p.title')
    artists = soup.select('p.artist')
    imgs = soup.select('.list>tbody>tr')
    album = soup.select('a.album')

    title_list = []
    artist_list = []
    img_list = []
    album_list = []

    for i in range(100):
        title_list.append(titles[i].text.strip())
        artist_list.append(artists[i].select('a')[0].text)
        img_list.append(imgs[i].select('a>img')[0].get('src'))
        album_list.append(album[i+1].text)

    data = OrderedDict()
    data["title"] = title_list
    data["artist"] = artist_list
    data["img"] = img_list
    data['album'] = album_list

    return jsonify(data)