exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) next()
    else res.redirect('/users/login')
}

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) next()
    else {
        const message = encodeURIComponent('로그인한 상태입니다.')
        res.redirect(`/?error=${message}`)
    }
}

exports.getCurrentDate = () => {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var today = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
    return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));
}