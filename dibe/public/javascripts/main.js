const sUserId = $('#sUserId').html()
const userNickNm = $('#dropMenu').text()

$().ready(async () => {
    mediaCheck()
    mainVideoPlay();
    $("video").on("ended", mainVideoPlay);
    
    await setPlayList_()

    if ($('.get-songId').length > 0) {
        $('#list_up_btn1').hide()
        $('#list_up_btn2').show()
    }
});

function mainVideoPlay() {
    let mainVideoH;
    let mainVideoM;
    let mainVideoS;

    mainVideoH = parseInt(Math.random() * 3);
    if (mainVideoH == 2) {
        mainVideoM = "0" + parseInt(Math.random() * 28);
    }
    else {
        mainVideoM = "0" +  parseInt(Math.random() * 60);
    }
    mainVideoS = "0" +  parseInt(Math.random() * 60);

	// contextPath 구하기
	let hostIndex = location.href.indexOf(location.host) + location.host.length;
	let contextPath = location.href.substring(hostIndex, location.href.indexOf("/", hostIndex + 1));

    // let mainVideoUrl = contextPath + "/public/video/sample.mp4#t=0" + mainVideoH + ":" + mainVideoM.substr(-2) + ":" + mainVideoS.substr(-2);
    let mainVideoUrl = "video/sample.mp4#t=0" + mainVideoH + ":" + mainVideoM.slice(-2) + ":" + mainVideoS.slice(-2);
    $("video").prop("src", mainVideoUrl);
}

async function setPlayList_() {
    const songsList_ = localStorage.getItem(`dibe_${sUserId}_songsList`)
    if (!songsList_) return
    const songsList = JSON.parse(songsList_)
    if (songsList.length === 0) return

    for await (const songId of songsList) {
        const res = await fetch('/songs/addsong?songId=' + songId)
        const json = await res.json()
        const song = json.song
        await setList(song)
    }
    
    const idx = localStorage.getItem(`dibe_${sUserId}_playerIndex`)
    if (idx) playerIndex = idx
    await load()
    sw = 1

    const currentTime = localStorage.getItem(`dibe_${sUserId}_current`)
    if (currentTime) {
        player.currentTime = currentTime
        $("#controls_time").html(localStorage.getItem(`dibe_${sUserId}_saveTime`))
    }

    const repeat = localStorage.getItem(`dibe_${sUserId}_repeat`) || 0
    if (repeat == 1) {
        repeat_btn.style.opacity = "1";
    }
    else if (repeat == 2) {
        repeat_btn.style.opacity = "1";
        $("#one_repeat_mark").show();
    }
}

// 검색버튼 클릭 이벤트
$("#main_srch").click(() => {
    $("header > div:first-child").toggle();
    $('#srchKwd').focus()
});

// 검색 내용 없을 때 엔터 막기
$("#srchKwd").keydown((e) => {
    if (e.keyCode == 13) {
        e.preventDefault()
        if ($("#srchKwd").val().trim() !== "") {
            search($("#srchKwd").val())
        }
    }
});

// 검색 내용 없을 때 버튼 클릭 비활성
$("#srch_btn").click(() => {
    if ($("#srchKwd").val().trim() == "") {
        return;
    }
    search($("#srchKwd").val())
});

// 네비 드롭 다운
$("#dropMenu").click((e) => {
    e.stopPropagation()
    $(".my-group").toggle()
});

// 땅찍어서 닫기
$(document).click((e) => {
    $(".my-group").hide();
    const target = e.target.closest('body')
    if (!target) return
    if (e.target.parentElement.id !== 'main_srch' && e.target.id !== 'srchKwd') $('#srch_bar').hide()
});

// 필요 정보 임시 저장
function setdata(songId, ytURL) {
    idx_box.innerHTML = songId
    ytURL_box.innerHTML = ytURL
}

$('#list_up_btn2').on('click', async () => {
    $('#list_up_btn2').hide()
    $('#list_down_btn').show()
    setTimeout(() => {
        $('.get-songId.active')[0].scrollIntoView({block : 'center'})
    }, 100)
})

$('#list_down_btn').on('click', () => {
    $('#list_up_btn2').show()
    $('#list_down_btn').hide()
    $('#play_list_modal').modal('hide')
})

$('#play_list_modal').on('hidden.bs.modal', () => {
    $('#list_up_btn2').show()
    $('#list_down_btn').hide()
})

// 웹 종료될 때 저장
window.addEventListener('beforeunload', async () => {
    if (!sUserId) return

    let min_dur = 0
    let sec_dur = 0
    let min_cur = 0
    let sec_cur = 0

    if (!isNaN(player.duration)) {
        min_dur = parseInt(player.duration / 60)
        sec_dur = parseInt(player.duration % 60)
        min_cur = parseInt(player.currentTime / 60)
        sec_cur = parseInt(player.currentTime % 60)
    }
    
    if (min_dur < 10) {
        min_dur = "0" + min_dur
    }
    if (sec_dur < 10) {
        sec_dur = "0" + sec_dur
    }
    if (min_cur < 10) {
        min_cur = "0" + min_cur
    }
    if (sec_cur < 10) {
        sec_cur = "0" + sec_cur
    }

    let res = min_cur + ":" + sec_cur + " / " + min_dur + ":" + sec_dur

    localStorage.setItem(`dibe_${sUserId}_saveTime`, res)
    localStorage.setItem(`dibe_${sUserId}_current`, player.currentTime)

    const songsList = []
    const songs = $('.get-songId')
    for (const song of songs) {
        songsList.push(song.id.split('_')[1])
    }
    localStorage.setItem(`dibe_${sUserId}_songsList`, JSON.stringify(songsList))
    localStorage.setItem(`dibe_${sUserId}_playerIndex`, playerIndex)
})

async function search(srchKwd) {
    history.pushState(null, '', location.origin + '/search?srchKwd=' + srchKwd)
    document.title = '검색 DIBE(다이브)'
    const response = await fetch('/songs/search?srchKwd=' + srchKwd)
    const songs = await response.json()
    let list = `
        <div class="container">
            <div class="card-body" style="padding-bottom: 300px;">
                <h2 class="mt-5 mb-5">DIBE '${srchKwd}' 검색결과</h2>
    `
    if (songs.length < 1) {
        list += `
            <br><br>
            <p class="text-center">'${srchKwd}'에 대한 검색 결과가 없습니다. </p>
            `
    }
    list += `<table class="table" style="width: 80%; margin: auto;">`
    for (song of songs) {
        list += `
            <tr>
                <td><div class="imgBox" onclick="oneplay('${song._id}', '${song.ytURL}')"><img name="top100Img" src="${song.img}" alt=""></div></td>
                <td>
                    <div name="top100Title" class="ho" onclick="songInfo('${song._id}')">${song.title}</div>
                    <div name="top100Artist">${song.artist}</div>
                </td> 
                <td class="align-middle"><button name="add_btn" type="button" class="btn" data-toggle="modal" data-target="#addOne" onclick="setdata('${song._id}', '${song.ytURL}')"><i title="곡 추가" class="fas fa-plus"></i></button></td>
            </tr>
        `
    }
    list += `
                </table>
            </div>
        </div>
    
    `
    main.innerHTML = list
}

async function getPlayList(listId) {
    history.pushState(null, '', location.origin + '/playlist/' + listId)
    const response = await fetch('/users/playlist/' + listId)
    document.title = `플레이 리스트 DIBE(다이브)`
    const json = await response.json()
    const list = json.playList
    const thums =  json.thums
    const songs = json.songs

    let html = `
        <div class="container">
            <div class="card-body" style="padding-bottom: 300px;">
                <h2 class="mt-5 mb-5"><font color="yellow">${userNickNm}</font>님 플레이리스트</h2>
                <div class="row">
                    <button type="button" class="btn btn-dark ml-3" onclick="$('a.nav')[6].click()">목록</button>
                    <div class="col"></div>
                    <button type="button" class="btn btn-dark mr-3" title="수정" onclick="updatePlayList('${listId}')"><i class="fas fa-pen-square"></i></button>
                    <button type="button" class="btn btn-dark mr-3" onclick="delPalyList('${listId}')">삭제</button>
                </div>
                <div class="p-3 row">
                    <div style="width: 200px; height: 200px;">
    `

    if (Object.keys(thums).length === 0) html += `<div><img src="https://i1.sndcdn.com/avatars-000606604806-j6ghpm-t500x500.jpg" style="width: 100%;"></div>`
    else if (Object.keys(thums).length === 1) html += `<div><img src="${thums.thum1 }"></div>`
    else {
        html += `
            <div class="row" style="margin-left: 0px;">
                <div><img src="${thums.thum1 }"></div>
                <div><img src="${thums.thum2 }"></div>
            </div>
            <div class="row" style="margin-left: 0px;">
                <div><img src="${thums.thum3 }"></div>
                <div><img src="${thums.thum4 }"></div>
            </div>
        `
    }

    html += `
            </div>
            <div class="ml-5">
                <h4 id="listNm_box">${list.listNm }</h4>
                <div id="comment_box">${list.comment.replaceAll('\n', '<br>')}</div>
            </div>
        </div>
        <div class="d-flex justify-content-around p-3 mt-5">
            <button type="button" class="btn btn-dark col" onclick="mylistplay()"><i class="fas fa-play fa-2x"></i><span class="ml-5" style="font-size: 28px;">play</span></button>
            <div class="col"></div>
            <button type="button" class="btn btn-dark col" onclick="mylistplay(true)"><i class="fas fa-random fa-2x"></i><span class="ml-5" style="font-size: 28px;">shuffle</span></button>
        </div>
    `

    html += `
        <table class="table">
            <tr>
                <th class="text-center align-middle"><input id="playlist_allch" type="checkbox" checked onclick="playlist_isAll(this)"></th>
                <th id="cnt_box">${songs.length} 곡 선택됨</th>
                <th></th>
                <th></th>
                <th class="text-center align-middle ho"><div class="btn btn-outline-warning" onclick="playlist_delete_song('${listId}')">선택삭제</div></th>
            </tr>
    `

    for (const song of songs) {
        html += `
            <tr>
                <td class="text-center align-middle"><input name="tch" type="checkbox" value="${song._id}" checked onclick="playlist_isChecked()"></td>
                <td class="align-middle"><img src="${song.img }"></td>
                <td class="align-middle" title="${song.title }">
        `

        if (song.title.length < 20) html += `${song.title}`
        else if (song.title.length >= 20) html += `${song.title.substring(0, 20)}...`

        html += `
            </td>
            <td class="align-middle" title="${song.artist }">
        `

        if (song.artist.length < 20) html += `${song.artist}`
        else if (song.artist.length >= 20) html += `${song.artist.substring(0, 20)}...`

        html += `
            </td>
            <td class="text-center"><button type="button" class="btn" title="플레이리스트에서 제거" onclick="playlist_delete_song('${listId}', '${song._id}')"><i class='fa-regular fa-trash-can'></i></button></td>
        </tr>
        `
    }

    html += `
        </table>
        </div>
    </div>
    `

    $('#main').html(html)
}

async function songInfo(songId) {
    history.pushState(null, '', location.origin + '/track/' + songId)
    const response = await fetch('/songs/track/' + songId)
    const json = await response.json()
    const songInfo = json.songInfo
    const thumb = json.thumb
    document.title = `${songInfo.title} DIBE(다이브)`
    let html = `
        <div class="container mt-5 mb-5 pb-3 bg-dark" style="width: 70%; border-radius: 5px;">
            <div>
                <h3 class="text-white pl-3 pt-4">${songInfo.title }<span style="float: right;" class="text-rigth btn btn-secondary"><a href="javascript:history.back()">돌아가기</a></span></h3>
                <p class="text-white pl-3">
                    노래 | ${songInfo.artist } ${songInfo.release && songInfo.release.trim() ? '| ' + songInfo.release : '' }
                    <button id="songlike_btn1" class="btn" type="button" title="좋아요" onclick="songlike()"><i class="fa-regular fa-heart"></i></button>
                    <button id="songlike_btn2" style="display: none;" class="btn" type="button" onclick="songunlike()"><i class="fa-solid fa-heart text-danger"></i></button>
                    <span id="songLikeCnt">${songInfo.likes }</span>
                </p>
                <div class="p-3 mb-3" style="border-radius: 15px; background-color: rgb(35, 35, 35);">
                    <h5><b>곡정보</b></h5>
                    <table class="table table-borderless text-mute">
                        <tr>
                            <th width="100px">아티스트</th>
                            <td>${songInfo.artist }</td>
                            <td rowspan="7"><div style="float: right;"><img style="border-radius: 100%" src="${thumb }"></div></td>
                        </tr>
                        <tr>
                            <th>앨범</th>
                            <td>${songInfo.album }</td>
                        </tr>
                        <tr>
                            <th>발매</th>
                            <td>${songInfo.release ? songInfo.release : '' }</td>
                        </tr>
                        <tr>
                            <th>장르</th>
                            <td>${songInfo.genre ? songInfo.genre : '' }</td>
                        </tr>
                        <tr>
                            <th>작곡</th>
                            <td>${songInfo.write ? songInfo.write : '' }</td>
                        </tr>
                        <tr>
                            <th>작사</th>
                            <td>${songInfo.words ? songInfo.words : '' }</td>
                        </tr>
                        <tr>
                            <th>편곡</th>
                            <td>${songInfo.arrange ? songInfo.arrange : '' }</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="p-3" style="border-radius: 15px; background-color: rgb(35, 35, 35);">
                <h5><b>가사정보</b></h5>
                <div class="text-light text-center">
                    <div id="lyrics_div">${songInfo.lyrics ? songInfo.lyrics.replaceAll('\n', '<br>') : '' }</div>
                    <button id="lyrics_more_btn" type="button" class="btn btn-dark form-control mt-5" onclick="moerLyrics()">더보기</button>
                </div>
            </div>
        </div>
    `
    $('#main').html(html)
}

let lyricssw = 0
function moerLyrics() {
    if (lyricssw == 0) {
        lyrics_div.style.height = "auto";
        lyrics_div.style.overflow = "auto";
        lyricssw = 1;
        lyrics_more_btn.innerHTML = "접기";
    }
    
    else {
        lyrics_div.style.height = "200px";
        lyrics_div.style.overflow = "hidden";
        lyricssw = 0;    			
        lyrics_more_btn.innerHTML = "더보기";
    }
}
function songlike() {
    $("#songlike_btn1").hide();
    $("#songlike_btn2").show();
}

function songunlike() {
    $("#songlike_btn2").hide();
    $("#songlike_btn1").show();
}


async function delPalyList(listId) {
    if (!confirm('정말 삭제 하시겠습니까?')) return
    await fetch('/users/dellist/' + listId)
    $('a.nav')[6].click()
}

async function updatePlayList(listId) {
    
}

function playlist_isAll(target) {
    const isChecked = target.checked
    if (isChecked) $("input:checkbox[name='tch']:not(:disabled)").prop("checked", true)
    else  $("input:checkbox[name='tch']").prop("checked", false)
    $('#cnt_box').html(`${$("input:checkbox[name='tch']:checked").length} 곡 선택됨`)
}

function playlist_isChecked() {
    const ckboxs = $("input:checkbox[name='tch']")
    
    $('#cnt_box').html(`${$("input:checkbox[name='tch']:checked").length} 곡 선택됨`)
    for (const box of ckboxs) {
        if (!box.checked) return $("#playlist_allch").prop("checked", false)
    }
    $("#playlist_allch").prop("checked", true)
}

async function playlist_delete_song(listId, songId) {
    if (!confirm('해당 곡을 플레이리스트에서 제거 하시겠습니까?')) return
    
    const songIds = []
    if (!songId) {
        for await (const el of $("input:checkbox[name='tch']:checked")) {
            songIds.push(el.value)
        }
        await fetch('/users/dellistsong/' + listId + '?songIds=' + songIds)
    }

    else await fetch('/users/dellistsong/' + listId + '?songId=' + songId)
    getPlayList(listId)
}

async function getMyPlayList(sw) {
    if ($('.isAuthenticated')[0].innerHTML === 'false') {
        if (sw === 1) {
            $("#addModal_message_box").html("로그인이 필요한 서비스 입니다.")
            $("#addModal_message_box").slideDown(300)
            setTimeout(() => $("#addModal_message_box").slideUp(), 1000)
        }
    
        else {
            $("#addModal_message_box_many").html("로그인이 필요한 서비스 입니다.")
            $("#addModal_message_box_many").slideDown(300)
            setTimeout(() => $("#addModal_message_box_many").slideUp(), 1000)
        }
        return
    }

    if (sw === 1) {
        const ytURL = $('#ytURL_box').html()
        if (!ytURL || ytURL === 'undefined') {
            $("#addModal_message_box").html("준비중 입니다.")
            $("#addModal_message_box").slideDown(300)
            setTimeout(() => $("#addModal_message_box").slideUp(), 1000)
            return
        }
    }

    const response = await fetch('/users/playlist')
    const json = await response.json()
    const playList = json.playList
    const thums = json.thums

    let res = ''
    for (const [i, list] of playList.entries()) {
        res += `
            <div class='d-flex justify-content-center ho mb-3' onclick='addMyList("${list._id}")'>
                <div style="width: 50px; height: 50px;" class="col-2">
                    <div class="row" style="margin-left: 0px;">
            `
    
        if (!thums[i].thum1) {
            res += `
                        <div><img width="50px" src="https://i1.sndcdn.com/avatars-000606604806-j6ghpm-t500x500.jpg"></div>
                    </div>
                </div>
                <div class="col">${list.listNm}</div>
            </div>
            `
        }
    
        else if (thums[i].thum3 === '') {
            res += `
                        <div><img width="50px" src="${thums[i].thum1}"></div>
                    </div>
                </div>
                <div class="col">${list.listNm}</div>
            </div>
            `
        }
    
        else {
            res += `
                        <div><img width="25px" src="${thums[i].thum1}"></div>
                        <div><img width="25px" src="${thums[i].thum2}"></div>
                    </div>
                    <div class="row" style="margin-left: 0px;">
                        <div><img width="25px" src="${thums[i].thum3}"></div>
                        <div><img width="25px" src="${thums[i].thum4}"></div>
                    </div>
                </div>
                <div class="col">${list.listNm}</div>
            </div>
            `
        }
    }

    if (sw === 1) $('#mylist_box').html(res)
    else $('#mylist_box_many').html(res)
}

$('#addOne').on('hide.bs.modal', () => {
    $('#mylist_box').html('')
    $('#idx_box').html('')
})

$('#addMany').on('hide.bs.modal', () => {
    $('#mylist_box_many').html('')
})

// 페이지 이동
$('.nav').on('click', async (e) => {
    e.preventDefault()
    const url = e.target.dataset.url
    
    if (url === '/today') {
        history.pushState(null, '', location.origin + url)
        document.title = '투데이 DIBE(다이브)'
        let html = `<video style="width: 100%;" src="" autoplay muted></video>`
        html += `
            <div id="disqus_thread" class="p-5"></div>
            <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
        `
        main.innerHTML = html
        mainVideoPlay();
        (function() {
        var d = document, s = d.createElement('script');
        s.src = 'https://dibe-1.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
        })();
    }
    
    else if (url === '/chart') {
        history.pushState(null, '', location.origin + url)
        document.title = '차트 DIBE(다이브)'
        const response = await fetch('/songs/chart')
        const result = await response.json()
        const data = result.data
        const today = result.today

        let chart = `
            <div id="main_content" class="container">
                <div class="card-body">
                    <h2 class="mt-5 mb-5">DIBE Top 100</h2>
                    <!--
                    <div>
                        <input type="date" id="calendar" min="" max="">
                        <div id="go_btn" class="btn btn-dark btn-sm">go</div>
                    </div>
                    -->
                    <div id="top_btn" class="btn btn-dark btn-sm" style="position: fixed; right: 30px; bottom: 100px;">top</div>
                    <div class="text-center h4">${today}</div>
                    <table class="table">
                        <tr>
                            <td style="border-top: none;"><input id="allch" type="checkbox" style="accent-color: red;"></td>
                            <td id="cnt_box" colspan="2" style="vertical-align: middle; border-top: none;">0 곡 선택 됨</td>
                            <td colspan="2" class="text-right" style="border-top: none;"><div id="add_btn" class="btn btn-dark btn-sm" style="position: sticky; position: -webkit-sticky; right: 30px; top: 50px;" data-toggle="modal" data-target="#addMany">선택추가</div></td>
                        </tr>
        `
        for (const [i, song] of data.entries()) {
            let disabled = ''
            if (!song.ytURL) disabled = 'disabled'
            chart += `
                <tr>
                    <td style="vertical-align: middle;"><input name="tch" type="checkbox" value="${song.songId}" style="accent-color: red;" ${disabled}></td>
                    <td style="text-align: center; vertical-align: middle;">${i+1}</td>
                    <td><div class="imgBox ho" onclick="oneplay('${song.songId}', '${song.ytURL}')"><img name="top100Img" src="${song.img}"></div></td>
                    <td class="align-middle">
                        <div name="top100Title" class="ho" onclick="songInfo('${song.songId}')">${song.title}</div>
                        <div name="top100Artist">${song.artist}</div>
                    </td>
                    <td class="align-middle"><button name="add_btn" type="button" class="btn" data-toggle="modal" data-target="#addOne" onclick="setdata('${song.songId}', '${song.ytURL}')"><i title="곡 추가" class="fas fa-plus"></i></button></td>
                </tr>
            `
        }
        chart += `
                    </table>
                </div>
            </div>
            <script src="javascripts/chart.js"></script>
        `

        $('#main').html(chart)
    }

    else if ('/playlist') {
        history.pushState(null, '', location.origin + url)
        document.title = '플레이 리스트 DIBE(다이브)'
        const response = await fetch('/users/playlist')
        const result = await response.json()
        const playList = result.playList
        const thums = result.thums

        let html = `
            <div id="main_content" class="container">
                <div class="card-body" style="padding-bottom: 300px;">
                    <h2 class="mt-5 mb-5"><font color="yellow">${userNickNm}</font>님 플레이리스트</h2>
                    <div class="row">
                        <div class="p-3 ho" onclick="" data-toggle="modal" data-target="#addPlayListModal">
                            <div style="width: 200px; height: 200px; border: 1px solid white; text-align: center; background: #111;"><i style="position: relative; top: 50px;" title="새 플레이리스트 추가" class="fas fa-plus fa-5x"></i></div>
                            <div style="width: 200px;" class="mt-3 text-center">새 플레이리스트 추가</div>
                        </div>
        `
        for (const [i, list] of playList.entries()) {
            html += `
                <div class="p-3 ho" title="${list.comment }" onclick="getPlayList('${list._id}')">
                <div style="width: 200px; height: 200px;">
            `
            if (!thums[i].thum1) html += `<div><img src="https://i1.sndcdn.com/avatars-000606604806-j6ghpm-t500x500.jpg" style="width: 100%;"></div>`
            else if (!thums[i].thum2) html += `<div><img src="${thums[i].thum1 }"></div>`
            else if (thums[i].thum2) html += `
                <div class="row" style="margin-left: 0px;">
                    <div><img src="${thums[i].thum1 }"></div>
                    <div><img src="${thums[i].thum2 }"></div>
                </div>
                <div class="row" style="margin-left: 0px;">
                    <div><img src="${thums[i].thum3 }"></div>
                    <div><img src="${thums[i].thum4 }"></div>
                </div>
            `
            html += `
                    </div>
                    <div style="width: 200px;" class="mt-3 text-center">${list.listNm }</div>
                </div>
            `
        }
        html += `
                    </div>
                </div>
            </div>
        `
        
        $('#main').html(html)
    }
})

window.onpopstate = (e) => {
    location.reload()
}

// 반응형
window.onresize = (e) => {
    mediaCheck()
}

function mediaCheck() {
    const innerWidth = window.innerWidth
    
    if (innerWidth <= 1200) {
        $('#controls_time').hide()
        $('.controls_more').hide()
    }
    
    else {
        $('#controls_time').show()
        $('.controls_more').show()
    }
}

$('#addMany').on('shown.bs.modal', () => {
    if ($("input:checkbox[name='tch']:checked").length === 0) $('#addMany').modal('hide')
})