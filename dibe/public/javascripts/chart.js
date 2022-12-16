$('#top_btn').on('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
});

// 전체선택
$('#allch').on('click', () => {
    if ($('#allch').is(':checked')) {
        $("input:checkbox[name='tch']:not(:disabled)").prop("checked", true);
    }
    else {
        $("input:checkbox[name='tch']").prop("checked", false);
    }
    cnt_box.innerHTML = $("input:checkbox[name='tch']:checked").length + " 곡 선택 됨"
});

//전체선택 해제
$("input:checkbox[name='tch']").click(() => {
    const list = $("input:checkbox[name='tch']:not(:disabled)")
    cnt_box.innerHTML = $("input:checkbox[name='tch']:checked").length + " 곡 선택 됨"
    for (const el of list) {
        if (!el.checked) return $("#allch").prop("checked", false)
    }
    $("#allch").prop("checked", true);
});