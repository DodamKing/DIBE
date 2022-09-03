top_btn.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
});

const allch = document.getElementById('allch')
// 전체선택
allch.addEventListener("click", () => {
    if (allch.checked) {
        $("input:checkbox[name='tch']:not(:disabled)").prop("checked", true);
    }
    else {
        $("input:checkbox[name='tch']").prop("checked", false);
    }
    cnt_box.innerHTML = $("input:checkbox[name='tch']:checked").length + " 곡 선택 됨"
});

//전체선택 해제
$("input:checkbox[name='tch']").click(() => {
    cnt_box.innerHTML = $("input:checkbox[name='tch']:checked").length + " 곡 선택 됨"
    for (let i=0; i<100; i++) {
        if (!$("input:checkbox[name='tch']")[i].checked) {
            $("#allch").prop("checked", false);
            return;
        }
    }
});