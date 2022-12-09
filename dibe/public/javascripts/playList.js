function addPlayListModalReset() {
    $('#listNm').val('')
    $('#comment').val('')
    $('#srchResult').html('')
    $('#addPlayListModal_playlist').html('')
    $('#content').val('')
    $('#keyword').val('')
    $('#addPlayListModal').modal('hide')
}

function addSongModalClose() {
    bootbox.confirm({
        message : '<p class="mb-0 text-dark">변경사항을 저장하지 않고 편집을 종료합니다. 정말 나가시겠어요?</p>',
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            if (result) {
                addPlayListModalReset()
            }
        }
    })
}

function showsrch() {
    $("div[name='srchform']").toggle()
}

function aplm_isEnter(e) {
    if (e.key === 'Enter') getres()
}

async function getres() {
    if ($("#keyword").val().trim() == "") return
    const response = await fetch('/songs/search?srchKwd=' + $("#keyword").val())
    const songs = await response.json()

    let res = ''
    for (const song of songs) {
        res += "<div id='p_" + song._id +"' class='d-flex p-3'>";
        res += "<div class='imgBox mr-3'>";
        res += "<img src='" + song.img + "'>";
        res += "</div>";
        res += "<div>";
        res += "<div class='playlist_t' title='" + song.title + "'>";
        res += song.title;
        res += "</div>";
        res += "<div class='playlist_a' title='" + song.artist + "'>";
        res += song.artist;
        res += "</div>";
        res += "</div>";
        res += "<div class='ml-auto'>";
        res += `<button name='add_btn' type='button' class='btn' onclick='setpl("${song._id}")'><i title='곡 추가' class='fas fa-plus'></i></button>`
        res += "</div>";
        res += "</div>";
    }

    $('#srchResult').html(res)
}

async function setpl(songId) {
    if ($('#content').val().includes(songId)) {
        $('#addPlayListModal_message_box').html('이미 추가 된 곡입니다.')
        setTimeout(() => $('#addPlayListModal_message_box').html(''), 1000)
        return
    }

    const response = await fetch('/songs/addsong?songId=' + songId)
    const json = await response.json()
    const song = json.song

    const element = `
        <div class ='d-flex p-3'>
            <div class='imgBox mr-3'>
                <img src='${song.img}'>
            </div>
            <div>
                <div class='playlist_t' title='${song.title}'>${song.title}</div>
                <div class='playlist_a' title='${song.artist}'>${song.artist}</div>
            </div>
        </div>
    `

    $('#addPlayListModal_playlist').append(element)
    $('#content').val($('#content').val() + songId + '/')

    $('#addPlayListModal_message_box').html('플레이리스트에 추가되었습니다.')
    setTimeout(() => $('#addPlayListModal_message_box').html(''), 1000)
}

async function savePlayList() {
    if ($('#listNm').val() === '') {
        $('#addPlayListModal_message_box').html('플레이리스트 제목을 입력하세요.')
        setTimeout(() => $('#addPlayListModal_message_box').html(''), 1000)
        $('#listNm').focus()
        return
    }

    const listNm = $('#listNm').val()
    const comment = $('#comment').val()
    const content = $('#content').val()

    const options = {
        method : 'POST',
        body : JSON.stringify({listNm, comment, content}),
        headers : {'Content-Type' : 'application/json'}
    }

    await fetch('/users/savelist', options)

    $('#addPlayListModal_message_box').html('저장되었습니다.')
        setTimeout(() => { 
            $('#addPlayListModal_message_box').html('')
            $('#addPlayListModal').modal('hide')
            addPlayListModalReset()
            $('a.nav')[6].click()
        }, 1000)

}