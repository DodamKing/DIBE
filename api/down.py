from base64 import decode
from flask import Blueprint, jsonify

from selenium import webdriver
from bs4 import BeautifulSoup as bs
from pytube import YouTube
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from collections import OrderedDict
import json
import re, time, os

down = Blueprint('down', __name__)

@down.route('/', methods = ('GET', 'POST'))
def file_down():
    options = webdriver.ChromeOptions()
    options.add_experimental_option('excludeSwitches', ['enable-logging'])

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    yt_url_list = []
    title_list = []
    artist_list = []

    for i in range(len(title_list)):
        keyword = '{} {} official audio, short'.format(title_list[i], artist_list[i])
        url = 'https://www.youtube.com/results?search_query=' + keyword

        driver.get(url)
        soup = bs(driver.page_source, 'html.parser')
        html = soup.select('a#video-title')[0]
        video_url = 'https://www.youtube.com' + html.get('href')
        yt_url_list.append(video_url)

    driver.close()
    driver.quit()

    # for i in range(len(title_list)):
    #     keyword = '{} - {}'.format(title_list[i], artist_list[i])
    #     keyword = re.sub('[\\\/:*?\"<>|]', '', keyword)

    #     if os.path.exists('d:/music_db/' + keyword + '.mp3'):
    #         print(keyword + ' is already exist')
    #         pass
    #     else:
    #         yt = YouTube(yt_url_list[i])
    #         audio = yt.streams.get_by_itag(140)
    #         audio.download('d:/music_db', keyword + '.mp3')
    #         print(keyword + ' is downloaded')
    #         time.sleep(2)
    
    data = OrderedDict()
    streams = []
    yt_url_list = ['https://www.youtube.com/watch?v=vN0AuAS25aQ', 'https://www.youtube.com/watch?v=o2qoo7I6k5U']
    for i in range(2):
        yt = YouTube(yt_url_list[i])
        audio = yt.streams.get_by_itag(251)
        streams.append(audio.stream_to_buffer)
    
    data['streams'] = streams
    # return jsonify(streams[0])
    return streams[0]