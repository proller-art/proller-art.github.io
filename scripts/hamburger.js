let transitionTimeout = null;
let menuTimeout = null;

window.addEventListener("resize", handleTransitionResize);

function handleTransitionResize() {
    // resize transition canvas
    let width = Math.ceil(window.innerWidth/2 + window.innerHeight/2 * Math.sqrt(3));
    let height = Math.ceil(window.innerHeight/2 + window.innerWidth/2 * Math.sqrt(3));

    let transitionCanvas = document.getElementById("page_transition").querySelector("canvas");
    let imageExpandCanvas;
    let imageExpandBg = document.getElementById("image_expand_bg");
    if (imageExpandBg) {
        imageExpandCanvas = imageExpandBg.querySelector("canvas");
    }
    
    // element display size
    transitionCanvas.style.width = width + 15 + "px";
    transitionCanvas.style.height = height + 15 + "px";
    if (imageExpandCanvas) {
        imageExpandCanvas.style.width = width + 15 + "px";
        imageExpandCanvas.style.height = height + 15 + "px";
    }

    // reset hamburger menu if screen is too wide for mobile layout
    if (window.innerWidth >= 990) {
        // hide hamburger menu
        let menu = document.getElementById("hamburger_menu");
        menu.style.display = "none";

        document.getElementById("hamburger").classList.remove("open");
        hamburger.onclick = openHamburger;

        // clear the transition animation canvas
        transitionCanvas.width = width/6;

        // content becomes visible again
        content.style.transition = "none";
        content.style.opacity = 1;
        void(content.offsetHeight);
        content.style.transition = null;

        // animate all hamburger menu elements off screen
        let elements = [...menu.getElementsByClassName("button_mount"), menu.querySelector("span")];
        for (let i = 0; i < elements.length; i++) {
            // clear transition
            elements[i].style.transition = "none";

            // reset to offscreen position
            elements[i].style.transform = "translateX(200%)";
            elements[i].style.opacity = 0;
        }
    }
}

function openHamburger() {
    let delay = true;
    if (transitionTimeout) {
        clearTimeout(transitionTimeout);
    }
    if (menuTimeout) {
        delay = false;
        clearTimeout(menuTimeout);
    }
    let hamburger = document.getElementById("hamburger");
    hamburger.classList.add("open");
    hamburger.onclick = closeHamburger;
    fillTransition();
    let menu = document.getElementById("hamburger_menu");
    let elements = [...menu.getElementsByClassName("button_mount"), menu.querySelector("span")];

    // reveal menu
    menu.style.display = "flex";
    void(menu.offsetHeight);
    
    for (let i = 0; i < elements.length; i++) {
        // transition
        elements[i].style.transition = "transform .4s cubic-bezier(0.23, 1, 0.320, 1), opacity .4s cubic-bezier(0.23, 1, 0.320, 1)";

        // transition delay
        if (delay) {
            elements[i].style.transitionDelay = (i * .05 + .5) + "s";
        } else {
            elements[i].style.transitionDelay = "0s";
        }
        
        // values to transition to
        elements[i].style.transform = "translateX(0%)";
        elements[i].style.opacity = 1;
    }

}
function closeHamburger() {
    let hamburger = document.getElementById("hamburger");
    hamburger.classList.remove("open");
    hamburger.onclick = openHamburger;
    let menu = document.getElementById("hamburger_menu");
    let elements = [...menu.getElementsByClassName("button_mount"), menu.querySelector("span")];
    for (let i = 0; i < elements.length; i++) {
        // transition
        elements[i].style.transition = "transform .4s cubic-bezier(0.68, 0, 0.77, 0), opacity .4s cubic-bezier(0.68, 0, 0.77, 0)";

        // transition delay
        if (i > 2) {
            elements[i].style.transitionDelay = .35 - (i * .05) + "s";
        } else {
            elements[i].style.transitionDelay = (i * .05) + "s";
        }

        // values to transition to
        elements[i].style.transform = "translateX(200%)";
        elements[i].style.opacity = 0;
    }

    // reveal content again
    emptyTransition();

    // hide menu
    menuTimeout = setTimeout(() => {
        menu.style.display = "none";
        menuTimeout = null;
    }, 1100);
}

function hamburgerTransition(url) {
    let hamburger = document.getElementById("hamburger");
    hamburger.classList.remove("open");
    let menu = document.getElementById("hamburger_menu");
    let elements = [...menu.getElementsByClassName("button_mount"), menu.querySelector("span")];
    for (let i = 0; i < elements.length; i++) {
        // transition
        elements[i].style.transition = "transform .4s cubic-bezier(0.68, 0, 0.77, 0), opacity .4s cubic-bezier(0.68, 0, 0.77, 0)";

        // transition delay
        if (i > 2) {
            elements[i].style.transitionDelay = .35 - (i * .05) + "s";
        } else {
            elements[i].style.transitionDelay = (i * .05) + "s";
        }

        // values to transition to
        elements[i].style.transform = "translateX(200%)";
        elements[i].style.opacity = 0;
    }

    setTimeout(() => {
        if (url) {
            window.location.href = url;
        }
    }, 900);
}