from flask import jsonify, Blueprint, request

from collections import OrderedDict
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

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
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.implicitly_wait(10)

    for result in results:
        query = '{} {}'.format(result['title'], result['artist'])
    # for i in range(5):
    #     query = '{} {}'.format(results[i]['title'], results[i]['artist'])
        driver.get('https://vibe.naver.com/search?query=' + query)
        track = driver.find_element(By.CSS_SELECTOR, '.popular_item .btn_play_now').get_attribute('data-track-id')

        url = 'https://vibe.naver.com/track/' + track
        driver.get(url)
        song_info = driver.find_element(By.CSS_SELECTOR, '.song_info')
        element = song_info.find_elements(By.CSS_SELECTOR, '.item')
        작사 = ''
        작곡 = ''
        편곡 = ''
        가사 = ''

        if len(element) >= 1: 작사 = element[0].text[3:]
        if len(element) >= 2: 작곡 = element[1].text[3:]
        if len(element) == 3: 편곡 = element[2].text[3:]
            
        가사 = driver.find_element(By.CSS_SELECTOR, '.lyrics p').text

        song = OrderedDict()
        song['_id'] = result['_id']
        song['작사'] = 작사
        song['작곡'] = 작곡
        song['편곡'] = 편곡
        song['가사'] = 가사

        songs.append(song)

    driver.quit()

    return jsonify(songs)