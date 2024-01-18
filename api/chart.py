from flask import jsonify, Blueprint, request

import requests
from bs4 import BeautifulSoup as bs
from collections import OrderedDict
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from pytube import YouTube
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import platform


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
    param = request.get_json()
    songs = param['songs']
    url_list = []
    
    options = webdriver.ChromeOptions()
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_argument('headless')
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    for song in songs:
        title = song['title']
        artist = song['artist']
        keyword = '{} {} official audio'.format(title, artist)
        url = 'https://www.youtube.com/results?search_query=' + keyword
        video_url = ''

        driver.get(url)
        try:
            elements = WebDriverWait(driver, 12).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a#video-title")))
            lengths = WebDriverWait(driver, 12).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "#overlays #text")))
        except:
            print(title, artist, '시간 초과로 넘어감')
            url_list.append('')
            continue

        idx = 0
        while idx < len(elements):
            video_url = elements[idx].get_attribute('href')
            try:
                times = lengths[idx].get_attribute('innerText').strip().split(':')
                idx += 1
                if len(times) < 2: continue
                l = int(times[-2]) * 60 + int(times[-1])
                if 120 < l < 60 * 6:
                    video_url = video_url[:video_url.find('&')]
                    break 
            except: 
                video_url = ''
                break

        url_list.append(video_url)

    driver.quit()

    print(url_list)
    return jsonify(url_list)

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