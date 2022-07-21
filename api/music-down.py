from selenium import webdriver
from bs4 import BeautifulSoup as bs
from pytube import YouTube
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import re, time, os

options = webdriver.ChromeOptions()
options.add_experimental_option('excludeSwitches', ['enable-logging'])

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)


# 한곡 다운
# title = '보고싶었어'
# artist = 'WSG워너비 (4FIRE)'
# keyword = '{} {} official audio, short'.format(title, artist)
# url = 'https://www.youtube.com/results?search_query=' + keyword

# driver.get(url)
# soup = bs(driver.page_source, 'html.parser')
# html = soup.select('a#video-title')[0]
# video_url = 'https://www.youtube.com' + html.get('href')
# video_url = 'https://www.youtube.com/watch?v=CKa1NTHktbg'

# f_name = '{} - {}'.format(title, artist)
# f_name = re.sub('[\\\/:*?\"<>|]', '', f_name)

# yt = YouTube(video_url)
# audio = yt.streams.get_by_itag(140)
# audio.download('.\music_db', f_name + '.mp3')
# print(keyword + ' is downloaded')


# 여러곡 다운
yt_url_list = []
title_list = ['그때 그 순간 그대로', '보고싶었어']
artist_list = ['WSG워너비 (가야G)', 'WSG워너비 (4FIRE)']

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

for i in range(len(title_list)):
    keyword = '{} - {}'.format(title_list[i], artist_list[i])
    keyword = re.sub('[\\\/:*?\"<>|]', '', keyword)

    # if os.path.exists('..\\music_db\\' + keyword + '.mp3'):
    if os.path.exists('e:/music_db/' + keyword + '.mp3'):
        print(keyword + ' is already exist')
        pass
    else:
        yt = YouTube(yt_url_list[i])
        audio = yt.streams.get_by_itag(140)
        # audio.download('..\\music_db', keyword + '.mp3')
        audio.download('e:/music_db', keyword + '.mp3')
        print(keyword + ' is downloaded')
        time.sleep(2)
print('done')

