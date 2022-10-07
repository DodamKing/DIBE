$().ready(async () => {
    mainVideoPlay();
    $("video").on("ended", mainVideoPlay);
    
    if ($('.get-songId').length > 0) {
        $('#list_up_btn1').hide()
        $('#list_up_btn2').show()
    }

    const songsList_ = JSON.parse(localStorage.songsList_)
    if (songsList_.length !== 0) {
        $('.loader').fadeIn()
        for (const songId of songsList_) {
            const res = await fetch('/songs/addsong?songId=' + songId)
            const json = await res.json()
            const song = json.song
            await setList(song)
        }
        $('#list_up_btn1').hide()
        $('#list_up_btn2').show()
        $('.loader').fadeOut()

        const idx = localStorage.dibe_playerIndex
        if (idx) playerIndex = idx
        await load()
        sw = 1
        await player.play()
        player.pause()

        const savePoint = localStorage.dibe_savePoint
        if (savePoint) {
            player.currentTime = parseInt(savePoint) * player.duration / 1000
            $("#play_bar").val(savePoint)
            $("#controls_time").html(localStorage.dibe_saveStrTime)
        }
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
    if (e.target.parentElement.id !== 'main_srch' && e.target.id !== 'srchKwd') $('#srch_bar').hide()
});

// 필요 정보 임시 저장
function setdata(songId, ytURL) {
    idx_box.innerHTML = songId
    ytURL_box.innerHTML = ytURL
}

$('#list_up_btn2').on('click', () => {
    $('#list_up_btn2').hide()
    $('#list_down_btn').show()
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
window.addEventListener('beforeunload', () => {
    let min_dur = 00
    let sec_dur = 00
    let min_cur = 00
    let sec_cur = 00

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

    localStorage.dibe_savePoint = (player.currentTime / player.duration) * 1000
    localStorage.dibe_saveStrTime = res
})

async function search(srchKwd) {
    history.pushState(null, 'DIBE', location.origin + '/search?srchKwd=' + srchKwd)
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
                    <div name="top100Title">
                        <a href="">${song.title}</a>
                    </div>
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

// 페이지 이동
$('.nav').on('click', async (e) => {
    e.preventDefault()
    const url = e.target.dataset.url
    
    if (url === '/today') {
        history.pushState(null, 'DIBE', location.origin + url)
        main.innerHTML = `<video style="width: 100%;" src="" autoplay muted></video>`
        mainVideoPlay();
    }
    
    else if (url === '/chart') {
        history.pushState(null, 'DIBE', location.origin + url)
        const response = await fetch('/songs/chart')
        const result = await response.json()
        const data = result.data
        const today = result.today

        let chart = `
            <div class="container">
                <div class="card-body">
                    <h2 class="mt-5 mb-5">DIBE Top 100</h2>
                    <div>
                        <input type="date" id="calendar" min="" max="">
                        <div id="go_btn" class="btn btn-dark btn-sm">go</div>
                    </div>
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
                        <div name="top100Title"><a href="">${song.title}</a></div>
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
})

window.onpopstate = (e) => {
    location.reload()
}