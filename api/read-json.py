import json
from selenium import webdriver
from bs4 import BeautifulSoup as bs
from pytube import YouTube
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import re, time, os

with open('./chart.json', 'r', encoding='utf-8') as f:
    chart = json.load(f)

yt_url_list = []
title_list = chart['title']
artist_list = chart['artist']

options = webdriver.ChromeOptions()
options.add_experimental_option('excludeSwitches', ['enable-logging'])

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

for i in range(2):
    keyword = '{} {} official audio, short'.format(title_list[i], artist_list[i])
    url = 'https://www.youtube.com/results?search_query=' + keyword

    driver.get(url)
    soup = bs(driver.page_source, 'html.parser')
    html = soup.select('a#video-title')[0]
    video_url = 'https://www.youtube.com' + html.get('href')
    yt_url_list.append(video_url)

driver.close()
driver.quit()

for i in range(2):
    keyword = '{} - {}'.format(title_list[i], artist_list[i])
    keyword = re.sub('[\\\/:*?\"<>|]', '', keyword)

    if os.path.exists('e:/music_db/' + keyword + '.mp3'):
        print(keyword + ' is already exist')
        pass
    else:
        yt = YouTube(yt_url_list[i])
        audio = yt.streams.get_by_itag(140)
        audio.download('e:/music_db', keyword + '.mp3')
        print(keyword + ' is downloaded')
        time.sleep(2)
print('done')