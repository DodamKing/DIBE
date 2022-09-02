$().ready(() => {
    mainVideoPlay();
    $("video").on("ended", mainVideoPlay);
});

let myPlayer = ''

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
    let mainVideoUrl = "video/sample.mp4#t=0" + mainVideoH + ":" + mainVideoM.substr(-2) + ":" + mainVideoS.substr(-2);
    $("video").prop("src", mainVideoUrl);
}

// 검색버튼 클릭 이벤트
$("#main_srch").click(() => {
    $("header > div:first-child").toggle();
});

// 검색 내용 없을 때 엔터 막기
$("#srchKwd").keydown((e) => {
    if (e.keyCode == 13) {
        if ($("#srchKwd").val().trim() == "") {
            e.preventDefault();
        }
    }
});

// 검색 내용 없을 때 버튼 클릭 비활성
$("#srch_btn").click(() => {
    if ($("#srchKwd").val().trim() == "") {
        return;
    }
    myform.submit();
});

// 네비 드롭 다운
$("#dropMenu").click((e) => {
    e.stopPropagation();
    $(".my-group").toggle();
});

// 땅찍어서 닫기
$(document).click((e) => {
    $(".my-group").hide();
});

// 필요 정보 임시 저장
function setdata(songId, ytURL) {
    idx_box.innerHTML = songId
    ytURL_box.innerHTML = ytURL
}

// 플레이어에 세팅
// async function senddata() {
//     const songId = idx_box.innerHTML
//     const ytURL = ytURL_box.innerHTML
//     if (!songId || !ytURL) return alert('준비중 입니다')

//     if (!myPlayer) {
//         const title = 'playerPop'
//         const url = `/songs/open_player?songId=${songId}`
//         const status = 'resizable=no, width=1100px, heght=800px'
//         myPlayer = await window.open(url, title, status)
//         return
//     }

//     const res = await fetch('/songs/addsong?songId=' + songId)
//     console.log(res);
//     const json = await res.json()
//     const song = json.song
//     myPlayer.setList(song)
// }