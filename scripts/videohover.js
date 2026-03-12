function hoverItemVideo(item) {
    if (window.innerWidth < 990) {
        return;
    }
    item.nextSibling.nextSibling.style.top = "calc(100% + 36px)";
    item.addEventListener("mouseleave", unhoverItemVideo);

    let video = item.querySelector("video");
    if (!video) {
        return;
    }
    item.querySelector("img").style.opacity = 0;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.currentTime = 0;
    video.play();
}

function unhoverItemVideo(event) {
    this.nextSibling.nextSibling.style.top = "calc(100% + 16px)";
    this.removeEventListener("mouseleave", unhoverItemVideo);
    let video = this.querySelector("video");
    if (!video) {
        return;
    }
    this.querySelector("img").style.opacity = 1;
    video.pause();
}