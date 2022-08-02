from flask import jsonify, Blueprint, request

import requests
from bs4 import BeautifulSoup as bs
from collections import OrderedDict
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from pytube import YouTube

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

@chart.route('/get_yt_url', methods=['POST'])
def get_yt_url_one():
    # param = request.get_json()
    title = request.form['title']
    artist = request.form['artist']
    keyword = '{} {} official audio, short'.format(title, artist)
    url = 'https://www.youtube.com/results?search_query=' + keyword

    options = webdriver.ChromeOptions()
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get(url)
    soup = bs(driver.page_source, 'html.parser')

    idx = 0
    if len(soup.select('a#video-title')) > 0:
        html = soup.select('a#video-title')[idx]
        video_url = 'https://www.youtube.com' + html.get('href')
        l = YouTube(video_url).length 
        if l < 120 or l > 60 * 6:
            idx += 1
            html = soup.select('a#video-title')[idx]
            video_url = 'https://www.youtube.com' + html.get('href')

    return video_url

@chart.route('/down')
def get_chart_url():
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

    options = webdriver.ChromeOptions()
    options.add_experimental_option('excludeSwitches', ['enable-logging'])

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    yt_url_list = []

    tot = 1
    cnt = 0
    for i in range(len(data['title'])):
        print(tot)
        keyword = '{} {} official video, short'.format(data['title'][i], data['artist'][i])
        url = 'https://www.youtube.com/results?search_query=' + keyword

        idx = 0
        driver.get(url)
        soup = bs(driver.page_source, 'html.parser')
        if len(soup.select('a#video-title')) > 0:
            html = soup.select('a#video-title')[idx]
            print(data['title'][i], ':', idx)
            video_url = 'https://www.youtube.com' + html.get('href')
            l = YouTube(video_url).length 
            if l < 120 or l > 60 * 6:
                idx += 1
                html = soup.select('a#video-title')[idx]
                video_url = 'https://www.youtube.com' + html.get('href')
                print(data['title'][i], ':', idx)
            yt_url_list.append(video_url)
            cnt += 1
        else:
            yt_url_list.append('')

        tot += 1

    driver.close()
    driver.quit()

    data['yt_url'] = yt_url_list
    print(cnt, 'items append')

    return jsonify(data)