// clock script
const clock = document.getElementById("header_subtitle_2");
let lastRefresh = Date.now();
updateClock();
clockLoop();

// clock loop
function clockLoop() {
    if (Date.now() > lastRefresh + 500) {
        lastRefresh = Date.now();
        updateClock();
    }
    window.requestAnimationFrame(clockLoop);
}

// update display
function updateClock() {
    let date = new Date();
    let dateText = date.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "full", timeStyle: "long",});
    let parts = dateText.split(" ");

    let day = parts[0].substring(0,3).toUpperCase();
    let month = parts[1].substring(0,3).toUpperCase();
    let dayNum = parts[2].substring(0,parts[2].length-1);
    let year = parts[3];
    let timeParts = parts[5].split(":");
    let hour = timeParts[0];
    let minute = timeParts[1];
    let colonDisplay = (date.getMilliseconds() % 1000 < 500) ? "100%" : "0%";
    let ampm = parts[6];
    let timezone = parts[7];

    clock.innerHTML = day + ", " + month + " " + dayNum + ", " + year;
    clock.innerHTML += "<br>" + hour + "<span style='opacity: " + colonDisplay + "'>:</span>" + minute + " " + ampm + " " + timezone;
}