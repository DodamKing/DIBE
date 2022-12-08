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
                $('#listNm').val('')
                $('#comment').val('')
                $('#addPlayListModal').modal('hide')
            }
        }
    })
}

function showsrch() {
    $("div[name='srchform']").toggle()
}