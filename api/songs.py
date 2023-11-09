from flask import jsonify, Blueprint, request

from collections import OrderedDict
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup as bs

songs = Blueprint('songs', __name__)

@songs.route('/')
def songs_index():
    return 'hi dibe songs'

@songs.route('/getlyrics', methods=['POST'])
def get_lyrics():
    param = request.get_json()
    results = param['songs']
    songs = []

    options = webdriver.ChromeOptions()
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_argument('headless')
    try: driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    except: driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)

    for result in results:
        query = '{} {}'.format(result['title'], result['artist'])
        driver.get('https://vibe.naver.com/search?query=' + query)
        print(query)
        # track = driver.find_element(By.CSS_SELECTOR, '.recommend_result .btn_play_now').get_attribute('data-track-id')
        try: track = driver.find_element(By.CSS_SELECTOR, '.result_section .icon_play').get_attribute('data-track-id')
        except:
            print(query, '없음')
            continue

        if track is None:
            print(query, '없음')
            continue

        url = 'https://vibe.naver.com/track/' + track
        driver.get(url)
        song_info = driver.find_element(By.CSS_SELECTOR, 'div.song_info.pc')
        element = song_info.find_elements(By.CSS_SELECTOR, '.item')

        html = song_info.get_attribute('innerHTML')
        soup = bs(html, 'html.parser')
        element = soup.select('.item')

        작사 = ''
        작곡 = ''
        편곡 = ''

        if len(element) >= 1: 작사 = element[0].text[3:]
        if len(element) >= 2: 작곡 = element[1].text[3:]
        if len(element) >= 3: 편곡 = element[2].text[3:]
            
        try: 가사 = driver.find_element(By.CSS_SELECTOR, '.lyrics p').text 
        except: 가사 = ''
        if 가사 is None: 가사 = ''

        song = OrderedDict()
        song['_id'] = result['_id']
        song['작사'] = 작사
        song['작곡'] = 작곡
        song['편곡'] = 편곡
        song['가사'] = 가사

        songs.append(song)

    driver.quit()

    return jsonify(songs)

@songs.route('/get-songInfo', methods=['POST'])
def get_songInfo():
    param = request.get_json()
    results = param['songs']
    songs = []

    options = webdriver.ChromeOptions()
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_argument('headless')
    try: driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    except: driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)

    for result in results:
        query = '{} {}'.format(result['title'], result['artist'])
        driver.get('https://search.naver.com/search.naver?where=nexearch&sm=tab_etc&mra=bkhH&x_csa=%7B%22theme%22%3A%22music_top%22%2C%20%22pkid%22%3A%22632%22%7D&query=' + query)
        soup = bs(driver.page_source, 'html.parser')

        song = OrderedDict()
        song['_id'] = result['_id']

        try:
            query = soup.select('.middle_title a.more_link')[0].get('href')
            url = 'https://search.naver.com/search.naver' + query
            driver.get(url)
            soup = bs(driver.page_source, 'html.parser')
            info = soup.select('dl.info .info_group')

            if info[2].select('dt')[0].text == '발매': song['발매'] = info[2].select('dd')[0].text
            if info[3].select('dt')[0].text == '장르': song['장르'] = info[3].select('dd')[0].text
            if info[4].select('dt')[0].text == '작곡': song['작곡'] = info[4].select('dd')[0].text.strip()
            if len(info) > 5 and info[5].select('dt')[0].text == '작사': song['작사'] = info[5].select('dd')[0].text.strip()
            if len(info) > 6 and info[6].select('dt')[0].text == '편곡': song['편곡'] = info[6].select('dd')[0].text.strip()

        except Exception as err:
            song['장르'] = ' '
            song['발매'] = ' '
            print(query, err)

        finally: songs.append(song)

    driver.quit()
    return jsonify(songs)