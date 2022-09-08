let songUrl;
let playerIndex = 0;
let playerIndex_ = 0;
let sw = 0;
let repeat = 0;
let shuffle = 0;
let exSongs

// 한 곡 재생
async function oneplay(songId, ytURL) {
    if (!ytURL) return alert('준비중 입니다')

    if ($('.get-songId').length !== 0) {
        for (let song of $('.get-songId')) {
            if (song.id === `p_${songId}`) return alert('이미 추가된 곡입니다.')
        }
    }

    const res = await fetch(`/songs/direct?songId=${songId}&autoPlay=1`)
    const json = await res.json()
    const song = json.songs[0]
    const autoPlay = json.autoPlay
    await setList(song)
    $('#list_up_btn1').hide()
    $('#list_up_btn2').show()

    if (autoPlay === '1') {
        playerIndex = $('.get-songId').length - 1
        await load()
        $(play_btn).hide();
        $(pause_btn).show();
        player.play();
    }
}

// 한 곡 선택 추가
async function senddata() {
    const songId = idx_box.innerHTML
    const ytURL = ytURL_box.innerHTML
    if (!songId || !ytURL) return alert('준비중 입니다')

    const res = await fetch('/songs/addsong?songId=' + songId)
    const json = await res.json()
    const song = json.song
    await setList(song)
    $('#list_up_btn1').hide()
    $('#list_up_btn2').show()
}

// 여러곡 선택 추가
async function godata_many() {
    const songIds = []
    let strSongIds = ''
    const items = $("input:checkbox[name='tch']")
    for (item of items) {
        if (item.checked) {
            songIds.push(item.value)
            strSongIds += item.value + '/'
        }
    }
    
    const res = await fetch('/songs/addsongs', {
        method : 'POST',
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({songIds})
    })
    const json = await res.json()
    const songs = json.songs
    for (song of songs) {
        await setList(song)
    }
    $('#list_up_btn1').hide()
    $('#list_up_btn2').show()
}

// 플레이 리스트 음원 삭제
async function delList(songId) {
    const currentId = $('.get-songId')[playerIndex].id
    if (currentId === `p_${songId}`) {
        if ($('.get-songId').length - 1 === playerIndex) {
            $(`#p_${songId}`).remove()
            $('#listCnt').html(`${$('.get-songId').length} 곡`)
            player.currentTime = player.duration
            playerIndex_ = 0
            return 
        }
        next_btn.click()
        playerIndex--
    }

    let currnetIndex
    let delIndex
    const l = $('.get-songId').length
    for (let i=0; i<l; i++) {
        if (currentId === $('.get-songId')[i].id) currnetIndex = i
        if (`p_${songId}` === $('.get-songId')[i].id) delIndex = i
    }

    if (currnetIndex > delIndex) {
        playerIndex--
        playerIndex_--
    }

    $(`#p_${songId}`).remove()
    $('#listCnt').html(`${$('.get-songId').length} 곡`)
}

// document.addEventListener('click', () => {
//     $('button[name=delete_btn]').on('click', (e) => {
//         const index = $(e.target).closest('.get-songId').index()
//         if (playerIndex >= index) playerIndex--
        
//         $(e.target).closest('.get-songId').remove()
//         const cnt = $('.get-songId').length
//         $('#listCnt').html(`${cnt} 곡`)
//     })
// })

// 원하는 곡 재생
async function startThis(songId) {
    const rows = $('.get-songId')
    for (let i=0; i<rows.length; i++) {
        if (rows[i].id.split('_')[1] === songId) {
            playerIndex = i;
            await load();
            $(play_btn).hide();
            $(pause_btn).show();
            player.play();
            sw = 1;
            return
        }
    }
}

// 플레이 리스트에 데이터 뿌리기
async function setList(song) {
    const rows = $('.get-songId')
    for (row of rows) {
        if (row.id.split('_')[1] === song._id) return
    }

    let res = `
        <div id="p_${song._id}" class='d-flex p-3 get-songId' draggable='true'>
            <div style='display: none;' class='playlist_url'>${song.ytURL}</div>
            <div class='imgBox mr-3'>
                <img class="playlist_i" src='${song.img}' title="재생" onclick="startThis('${song._id}')" draggable='false'>
            </div>
            <div>
                <div class='playlist_t' title="${song.title}">`
    if (song.title.length > 25) res += `${song.title.substring(0, 25)}...`
    else res += `${song.title}`
    res += `    </div>
                <div class='playlist_a' title="${song.artist}">`
    if (song.artist.length > 25) res += `${song.artist.substring(0, 25)}...`
    else res+= `${song.artist}`
    res += `    </div>
            </div>
            <div class='ml-auto'>
                <button name='delete_btn' type='button' class='btn' onclick="delList('${song._id}')"><i title="플레이리스트에서 제거" class='fa-regular fa-trash-can'></i></button>
            </div>
        </div>`
    
    $('#play_list').append(res)
    const cnt = $('.get-songId').length
    $('#listCnt').html(`${cnt} 곡`)
    songOfPlayListLength = cnt
}

async function streaming() {
    const url = $('.playlist_url')[playerIndex].innerHTML
    const res = await fetch('/songs/streaming', {
        method : 'POST',
        headers : {"Content-Type": "application/json"},
        body : JSON.stringify({url}) 
    })
    
    const blob = await res.blob()
    if (blob.size < 10 && playerIndex === $('.get-songId')) return next_btn.click()
    const src = await URL.createObjectURL(blob)
    return src
}

// 로드
async function load() {
    $('.loader').fadeIn()
    const getId = $('.get-songId')[playerIndex].id
    const songId = getId.split('_')[1]
    const title = $('.playlist_t')[playerIndex].title
    const artist = $('.playlist_a')[playerIndex].title
    const img = $('.playlist_i')[playerIndex].src
    // songUrl = `/track/${songId}.mp4`
    // player.src = songUrl
    const src = await streaming()
    player.src = src

    // $.get(songUrl).done(() => {
    //     player.src = songUrl
    // }).fail(() => {
    //     streaming().then((result) => {
    //         player.src = result
    //     })
    // })

    player.load()
    controls_img.src = img
    controls_title.innerHTML = title
    if (title.length > 15) controls_title.innerHTML = `<marquee scrollamount=3>${title}</marquee>`
    controls_artist.innerHTML = artist
    controls_title.title = title
    controls_artist.title = artist
    play_listImg_img.src = img.replace("50", "400");
    play_listbg.src = img.replace("50", "2000");
    
    
    //타이틀 변경
    document.title = " DIBE(다이브) " + title + " - " + artist
    
    // 현재 재생 음악 포커스
    focus_cur()
    $('.loader').fadeOut()
}


// 플레이버튼 클릭
play_btn.addEventListener("click", async () => {
    if (sw == 0) {
        await load();
        sw = 1;
    }
    
    $(play_btn).hide();
    $(pause_btn).show();
    player.play();	
});

// 일시정지
pause_btn.addEventListener("click", () => {
    $(play_btn).show();
    $(pause_btn).hide();
    player.pause();
});

//볼륨
$("#volume_bar").on("input", async () => {
    const vol = $("#volume_bar").val()
    player.volume = vol / 100;
    $("#vol_no").html(vol);
    
    // $.ajax({
    //     type : "post",
    //     url : "${ctp}/song/myvol",
    //     data : {vol : player.volume}
    // });
    await fetch(`/songs/myvol/${vol}`)
});

// 음소거
let temp_vol;
$("#mute_btn1").click(() => {
    $("#player").prop("muted", true);
    $("#mute_btn1").hide();
    $("#mute_btn2").show();
});

$("#mute_btn2").click(() => {
    $("#player").prop("muted", false);
    $("#mute_btn2").hide();
    $("#mute_btn1").show();
});

// 재생바 이동
$("#play_bar").on("input", (e) => {
    const point = $("#play_bar").val();
    const current = point * player.duration / 100
    play_bar = point;
    player.currentTime = current
});

//재생바
$("#player").on("timeupdate", () => {
    let per = (player.currentTime / player.duration) * 100;
    $("#play_bar").val(per);
    
    let min_dur = 00;
    let sec_dur = 00;
    let min_cur = 00;
    let sec_cur = 00;

    if (!isNaN(player.duration)) {
        min_dur = parseInt(player.duration / 60);
        sec_dur = parseInt(player.duration % 60);
        min_cur = parseInt(player.currentTime / 60);
        sec_cur = parseInt(player.currentTime % 60);
    }

    
    if (min_dur < 10) {
        min_dur = "0" + min_dur;
    }
    if (sec_dur < 10) {
        sec_dur = "0" + sec_dur;
    }
    if (min_cur < 10) {
        min_cur = "0" + min_cur;
    }
    if (sec_cur < 10) {
        sec_cur = "0" + sec_cur;
    }

    let res = min_cur + ":" + sec_cur + " / " + min_dur + ":" + sec_dur;
    $("#controls_time").html(res);

    if ('<%- isAuthenticated %>' === 'false') {
        if (player.currentTime > 60 && player.currentTime < player.duration) {
            player.currentTime = player.duration
        }
    }
});

// next button
$("#next_btn").click(async () => {
    $(play_btn).hide();
    $(pause_btn).show();
    
    playerIndex++;
    if (playerIndex >= $('.get-songId').length) {
        playerIndex = 0;
    };
    await load();
    player.play();
    $("#controls_time").html("00:00 / 00:00");
});

// back button
$("#back_btn").click(async () => {
    $(play_btn).hide();
    $(pause_btn).show();
    
    playerIndex--;
    if (playerIndex <= 0) {
        playerIndex = 0;
    };
    await load();
    player.play();
    $("#controls_time").html("00:00 / 00:00");
});

// 연속 재생
$("#player").on("ended", async () => {
    playerIndex++;
    if (repeat == 2) playerIndex--;
    if (playerIndex >= $('.get-songId').length) {
        $(play_btn).show();
        $(pause_btn).hide();
        playerIndex = 0;
        sw = 0;
        player.currentTime = 0;
        
        if (repeat == 1) {
            await load();
            player.play();
            $(play_btn).hide();
            $(pause_btn).show();
        }
        
        return;
    }
    
    await load();
    player.play();
});

//가사 모달
$("#lyrics_btn").click(() => {
    modal_i.src = thum_list[playerIndex].replace("50","200");
    $("#modal_t").html($("#controls_title").html());
    $("#modal_a").html($("#controls_artist").html());
    
    // $.ajax({
    //     type : "post",
    //     url : "${ctp}/song/lyrics",
    //     data : {idx : idx_list[playerIndex]},
    //     success : (data) => {
    //         data = data.replace(/\n/g, "<br>");
    //         $("#modal_c").html(data);
    //     }
    // });
    
});

// 좋아요 버튼 이벤트
$("#like_btn1").click(() => {
    $("#like_btn1").hide();
    $("#like_btn2").show();
    
    // if (${empty sMid}) return;
    // $.ajax({
    //     type : "post",
    //     url : "${ctp}/song/like",
    //     data : {idx : idx_list[playerIndex]},
    // });
}); 
$("#like_btn2").click(() => {
    $("#like_btn2").hide();
    $("#like_btn1").show();
    
    // if (${empty sMid}) return;
    // $.ajax({
    //     type : "post",
    //     url : "${ctp}/song/unlike",
    //     data : {idx : idx_list[playerIndex]},
    // });
});

//반복 재생 버튼
$("#repeat_btn").click(() => {
    if (repeat == 0) {
        repeat = 1;
        repeat_btn.style.opacity = "1";
        $("#repeat_btn").prop("title", "반복재생");
    }
    
    else if (repeat == 1) {
        repeat = 2;
        $("#repeat_btn").prop("title", "한곡반복");
        $("#one_repeat_mark").show();
    }
    
    else if (repeat == 2) {
        repeat = 0;
        repeat_btn.style.opacity = "0.5";
        $("#repeat_btn").prop("title", "반복해제");
        $("#one_repeat_mark").hide();
    }
});

//셔플
$("#shuffle_btn").click(async () => {
    if ($('.get-songId').length <= 1) return;
    
    $('.loader').show()
    
    if (shuffle === 0)  {
        playerIndex_ = playerIndex
        const songs = exSongs = $('.get-songId')
        const currentId = songs[playerIndex].id

        new Promise((resolve, reject) => {
            for (let i=0; i<songs.length; i++) {
                const idx = Math.floor(Math.random() * songs.length-1) + 1
                const idx2 = Math.floor(Math.random() * songs.length-1) + 1
                songs.eq(idx).before(songs.eq(idx2))
            }
            resolve( $('.get-songId')) 
        })
        .then((songs) => {
            let i = 0
            for (song of songs) {
                if (song.id === currentId) return playerIndex = i
                i++
            }
        })
        .then(() => focus_cur())
        
        shuffle_btn.style.opacity = "1";
        shuffle = 1;
    }
        
    else if (shuffle === 1)  {
        const songs = $('.get-songId')
        const currentId = songs[playerIndex].id

        play_list.innerHTML = ''

        new Promise((resolve, reject) => {
            for (song of exSongs) {
                play_list.append(song)
            }
            resolve(exSongs)
        })
        .then((exSongs) => {
            let i = 0
            for (song of exSongs) {
                if (song.id === currentId) return playerIndex = i
                i++
            }
        })
        .then(() => focus_cur())
        shuffle_btn.style.opacity = "0.5";
        shuffle = 0;
    }
    $('.loader').fadeOut()
});

// 현재 음악 포커스
function focus_cur() {
    if ($('.get-songId').length == 0) return;
    
    let focu = $('.get-songId')[playerIndex]
    
    focu.scrollIntoView();
    focu.style.backgroundColor = "#bbccdd";
    focu.style.opacity = "0.7";
    focu.style.borderRadius = "5px";
    
    if (playerIndex != playerIndex_) {
        let focu_ = $('.get-songId')[playerIndex_]
        focu_.style.backgroundColor = "";
        focu_.style.opacity = "1";
        focu_.style.borderRadius = "0";
        playerIndex_ = playerIndex;
    }
}

// 더보기 버튼 클릭
addmore_btn.addEventListener("click", () => {
    
});

//크기 고정
window.addEventListener("resize", () => {
    window.resizeTo(1100, 800);
});