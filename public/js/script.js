let alert = document.getElementsByClassName("alert");
let alert_1 = alert[0]
let alert_2 = alert[1]
let active = false;


window.addEventListener("load", () => {
    if (active === false) {

        setInterval(() => {
            alert_1.style.backgroundColor = "red"
            alert_2.style.backgroundColor = "red"
        }, 1000)
        setInterval(() => {
            alert_1.style.backgroundColor = "#212529"
            alert_1.style.color = "white"
            alert_2.style.backgroundColor = "#212529"
            alert_2.style.color = "white"
        }, 2000)
    }
})

// alert.style.backgroundColor = "red"