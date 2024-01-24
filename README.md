# DIBE (https://dibe.dimad.site)
음원사이트

## 스택
Node.js, ExpressJS, EJS, MongoDB, Ubuntu, Python, Flask, BeautifulSoup, Selenium

## 기능
- 실시간 음원 스트리밍 서비스
- node.js, express, mongoDB, ejs 기반
- Python, Flask, Beautiful Soup를 이용한 음원 차트 top100 크롤링
- Selenium을 이용한 음원 정보(발매일, 장르, 작곡, 작사, 편곡, 가사)  추가 크롤링
- node-cron으로 크롤링 데이터 주기적으로 적재
- SPA 적용
- 웹 플레이어 제작
    - 재생, 일시정지, 다음곡 부터 재생목록, 반복재생, 셔플 등 웹 플레이어가 동작하는데 필요한 모든 기능들을 직접 구현 하였습니다.
    - 재생중인 리스트, 재생중인 곡의 볼륨, 재생시간 등을 Local Storage 에 저장하여 다음 로그인시 기억하도록 하였습니다.
- 로그인 기능 구현
    - 아이디, 비밀번호 찾기 기능을 구현하였으며, 비밀번호는 메일로 임시 비밀번호를 생성하여 보내주었습니다.
    - 카카오 아이디 로그인 구현
- 관리자 페이지 구현
    - 회원 정보를 확인하고, 탈퇴 시킬 수 있도록 하였습니다.
    - 음원 정보를 조회하고 추가, 수정이 가능하며 DB로 관리할 수 있도록 하였습니다.
- 개인 플레이 리스트 구현
