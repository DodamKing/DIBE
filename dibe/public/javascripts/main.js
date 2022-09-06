$().ready(() => {
    mainVideoPlay();
    $("video").on("ended", mainVideoPlay);
    
    if ($('.get-songId').length > 0) {
        $('#list_up_btn1').hide()
        $('#list_up_btn2').show()
    }
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

$('.nav').on('click', async (e) => {
    $('.loader').fadeIn()
    const url = e.target.dataset.url
    
    if (url === '/today') {
        history.pushState(null, 'DIBE', location.origin + url)
        main.innerHTML = `<video style="width: 100%;" src="" autoplay muted></video>`
        mainVideoPlay();
    }
    
    else if (url === '/chart') {
        history.pushState(null, 'DIBE 차트', location.origin + url)
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
                            <td style="border-top: none;"><input id="allch" type="checkbox" ></td>
                            <td id="cnt_box" colspan="2" style="vertical-align: middle; border-top: none;">0 곡 선택 됨</td>
                            <td colspan="2" class="text-right" style="border-top: none;"><div id="add_btn" class="btn btn-dark btn-sm" style="position: sticky; position: -webkit-sticky; right: 30px; top: 50px;" data-toggle="modal" data-target="#addMany">선택추가</div></td>
                        </tr>
        `
        for (let i=0; i<data.title.length; i++) {
            let disabled = ''
            if (!data.ytURL[i]) disabled = 'disabled'
            chart += `
                <tr>
                    <td style="vertical-align: middle;"><input name="tch" type="checkbox" value="${data._id[i]}" ${disabled}></td>
                    <td style="text-align: center; vertical-align: middle;">${i+1}</td>
                    <td><div class="imgBox ho" onclick="oneplay(` + `${data._id[i]}` + `,` + `${data.ytURL[i]}` + `)"><img name="top100Img" src="${data.img[i]}"></div></td>
                    <td class="align-middle">
                        <div name="top100Title"><a href="">${data.title[i]}</a></div>
                        <div name="top100Artist">${data.artist[i]}</div>
                    </td>
                    <td class="align-middle"><button name="add_btn" type="button" class="btn" data-toggle="modal" data-target="#addOne" onclick="setdata('${data._id[i]}', '${data.ytURL[i]}')"><i title="곡 추가" class="fas fa-plus"></i></button></td>
                </tr>
            `
        }
        chart += `
                    </table>
                </div>
            </div>
        `

        main.innerHTML = chart
        $('#script_sec').append(`<script src="javascripts/chart.js"></script>`)
    }
    $('.loader').fadeOut()
})