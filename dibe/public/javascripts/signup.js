"use strict"

var idPattern = /[a-zA-Z0-9]{4,}$/;
// var pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/;
var pwdPattern = /^[]{4, 8}$/;
var emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]+$/;
var phonePattern = /01[016789][1-9][0-9]{3}\d{4}$/;
var namePattern = /[^가-힣]/;
var nickPattern = /[^가-힣a-zA-Z1-9]/;

let overlapCheck = 0;

userId.addEventListener("keyup", () => {
    if (!idPattern.test(userId.value)) {
        demo1.innerHTML = "아이디는 최소 4자, 영문 대소문자와 숫자만 가능합니다.";
    } else {
        demo1.innerHTML = "";
    }
    overlapCheck = 0;
	demo99.value = 0;
});

// pwd.addEventListener("keyup", () => {
//     if (!pwdPattern.test(pwd.value)) {
//         demo2.innerHTML = "비밀번호는 최소 8자, 대문자 하나, 소문자 하나, 숫자 하나 및 특수 문자 하나 이상을 포함해야 합니다.";
//     } else {
//         demo2.innerHTML = "";
//     }
// });

pwd.addEventListener("keyup", () => {
    if (pwd.value.length < 4 || pwd.value.length > 16) {
        demo2.innerHTML = "비밀번호는 최소 4자 최대 16자 입니다.";
    } else {
        demo2.innerHTML = "";
    }
});

userNm.addEventListener("keyup", () => {
    if (namePattern.test(userNm.value)) {
        demo5.innerHTML = "이름은 한글만 가능합니다.";
    } else {
        demo5.innerHTML = "";
    }
});

email.addEventListener("keyup", () => {
    if (emailPattern.test(email.value)) {
        demo3.innerHTML = "";
    } else {
        demo3.innerHTML = "이메일 형식을 지켜 주세요.";
    }
});

phoneNb.addEventListener("keyup", () => {
    if (phonePattern.test(phoneNb.value)) {
        demo4.innerHTML = "";
    } else {
        demo4.innerHTML = "휴대폰 형식을 지켜 주세요.";
    }
});

nickNm.addEventListener("keyup", () => {
    if (nickPattern.test(nickNm.value)) {
        demo6.innerHTML = "사용할 수 없는 이름 입니다.";
    } else {
        demo6.innerHTML = "";
    }
});

typeChange.addEventListener("click", () => {
    if (typeChange.checked == true) {
        pwd.type = "text";
    } else {
        pwd.type = "password";
    }
});

overlapCheck_btn.addEventListener("click", () => {
	if (userId.value == "") {
		alert("아이디를 입력해 주세요.");
		return;
	}
    let url = "/users/overlapcheck?userId=" + userId.value;
    window.open(url, "nWin", "width=500px, height=300px, left=250px, top=150px");
})

signup_btn.addEventListener("click", () => {
	overlapCheck = demo99.value;
	
	if (userId.value == "") {
		alert("아이디를 입력해 주세요.");
		userId.focus();
	}
	else if (pwd.value == "") {
		alert("비밀번호를 입력해 주세요.");
		pwd.focus();
	}
	else if (email.value == "") {
		alert("이메일 주소를 입력해 주세요.");
		email.focus();
	}
	else if (phoneNb.value == "") {
		alert("핸드폰 번호를 입력해 주세요.");
		phoneNb.focus();
	}
	else if (!$("input:radio[name=telecom]").is(":checked")) {
		alert("통신사를 선택해 주세요.")
	}
	else if (userNm.value == "") {
		alert("이름을 입력해 주세요.");
		userNm.focus();
	}
	else if (nickNm.value == "") {
		alert("닉네임을 입력해 주세요.");
		nickNm.focus();
	}
	else {
		if (demo1.innerHTML + demo2.innerHTML + demo3.innerHTML + demo4.innerHTML + demo5.innerHTML + demo6.innerHTML != "") {
			alert("입력란의 형식을 지켜 주세요");
		}
		else if (overlapCheck !=1 ) {
				alert("아이디 중복 체크를 해주세요.");
		}
		else {
			if (confirm("이대로 회원 가입을  진행 하시겠습니까?")) {
				signupForm.submit();
			}
		}
	}
});