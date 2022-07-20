from typing import OrderedDict
import requests
from bs4 import BeautifulSoup as bs

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

chart = OrderedDict()
chart["title"] = title_list
chart["artist"] = artist_list
chart["img"] = img_list

print(chart)
