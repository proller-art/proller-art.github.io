// scrollbar 
let hideScrollTimeout;
let scrollbarDragYOffset = 0;

document.addEventListener("mousemove", handleScrollbarHover);
document.addEventListener("scroll", handleScroll);
scrollbar_thumb.addEventListener("mousedown", handleScrollbarDrag);

function handleScrollbarHover(event) {
    if (event.clientX > window.innerWidth - 300 && window.innerHeight < document.documentElement.scrollHeight) {
        scrollbar_track.classList.add("visible");
    } else {
        if (!hideScrollTimeout) {
            scrollbar_track.classList.remove("visible");
        }
    }
}

function handleScroll(event) {
    scrollbar_track.classList.add("visible");

    clearTimeout(hideScrollTimeout);

    // move handle to correct spot
    let scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    let thumbHeight = scrollbar_thumb.getBoundingClientRect().height;
    let scrollbarHeight = scrollbar_track.getBoundingClientRect().height;
    scrollbar_thumb.style.top = (scrollbarHeight - thumbHeight) * scrollPercent + "px";

    hideScrollTimeout = setTimeout(() => {
        hideScrollTimeout = null;
        scrollbar_track.classList.remove("visible");
    }, 2000);
}

function handleScrollbarDrag(event) {
    event.preventDefault();
    scrollbar_track.classList.add("visible");
    clearTimeout(hideScrollTimeout);
    scrollbarDragYOffset = scrollbar_thumb.getBoundingClientRect().top - event.clientY;
    document.addEventListener("mousemove", dragScrollbar);
    document.addEventListener("mouseup", handleScrollbarDragEnd);
}

function dragScrollbar(event) {
    event.preventDefault();
    let scrollbarRect = scrollbar_track.getBoundingClientRect();
    let scrollbarThumbRect = scrollbar_thumb.getBoundingClientRect();

    let scrollbarProgress = Math.min(scrollbarRect.height - scrollbarThumbRect.height, Math.max(0, (event.clientY + scrollbarDragYOffset - scrollbarRect.top)));

    let scrollPercent = scrollbarProgress / (scrollbarRect.height - scrollbarThumbRect.height);

    scrollbar_thumb.style.top = scrollbarProgress + "px";
    document.documentElement.scrollTop = scrollPercent * (document.documentElement.scrollHeight - window.innerHeight);
}

function handleScrollbarDragEnd(event) {
    document.removeEventListener("mousemove", dragScrollbar);
    document.removeEventListener("mouseup", handleScrollbarDragEnd);

    hideScrollTimeout = setTimeout(() => {
        hideScrollTimeout = null;
        scrollbar_track.classList.remove("visible");
    }, 2000);
}