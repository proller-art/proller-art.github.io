// page transition script

// create necessary elements
let imageExpand = false;
let transitionParticles = [];
let lastTransition = Date.now();

let imageExpandBackground = document.getElementById("image_expand_bg");
if (hasHWA) {
    let transitionCanvas = document.createElement("canvas");
    let darken = document.createElement("div");
    darken.classList.add("darken");
    let width = Math.ceil(window.innerWidth/2 + window.innerHeight/2 * Math.sqrt(3));
    let height = Math.ceil(window.innerHeight/2 + window.innerWidth/2 * Math.sqrt(3));
    
    // element display size
    transitionCanvas.style.width = width + "px";
    transitionCanvas.style.height = height + "px";
    // can be lower resolution
    transitionCanvas.width = width/6;
    transitionCanvas.height = height/90;
    page_transition.appendChild(transitionCanvas);
    page_transition.appendChild(darken);

    if (imageExpandBackground) {
        let imageExpandCanvas = document.createElement("canvas");
        let lighten = document.createElement("div");
        lighten.classList.add("lighten");
        
        // element display size
        imageExpandCanvas.style.width = width + "px";
        imageExpandCanvas.style.height = height + "px";
        // can be lower resolution
        imageExpandCanvas.width = width/6;
        imageExpandCanvas.height = height/90;
        imageExpandBackground.appendChild(imageExpandCanvas);
        imageExpandBackground.appendChild(lighten);
    }
} else if (imageExpandBackground) {
    imageExpandBackground.appendChild(document.createElement("div"));
}

let transitionFill = false;
let transitionEmpty = false;
let transitionIsAnimating = false;

emptyTransition(false);

function fillTransition(imageBg, url, event, hamburger) {
    // prevent immediate link
    if (event) {
        event.preventDefault();
    }

    if (hamburger) {
        closeHamburger();
    }

    imageExpand = imageBg;
    if (imageBg) {
        image_expand_bg.style.pointerEvents = "auto";
    }
    if (hasHWA) {
        transitionFill = true;
        transitionEmpty = false;
        lastTransition = Date.now();
        if (!transitionIsAnimating) {
            transitionIsAnimating = true;
            pageTransitionLoop();
        }
    } else if (imageBg) {
        image_expand_bg.querySelector("div").style.height = "100%";
    }
    content.style.transition = "opacity .7s cubic-bezier(0.95, 0.05, 0.795, 0.035)";
    content.style.opacity = 0;
    if (imageBg) {
        header.style.transition = "opacity .7s cubic-bezier(0.95, 0.05, 0.795, 0.035)";
        header.style.opacity = 0;
    }
    setTimeout(() => {
        content.style.height = 0;
    }, 700);
    setTimeout(() => {
        if (url) {
            // clear transition for if user returns afterward
            content.style.height = null;
            content.style.transition = "opacity 1.5s .2s cubic-bezier(0.075, 0.82, 0.165, 1)";
            content.style.opacity = 1;
            emptyTransition(false);
            // serve link
            window.location.href = url;
        }
    }, 900);
}

function emptyTransition(imageBg) {
    imageExpand = imageBg;
    if (imageBg) {
        image_expand_bg.style.pointerEvents = "none";
    }
    if (hasHWA) {
        transitionEmpty = true;
        transitionFill = false;
        lastTransition = Date.now();
        if (!transitionIsAnimating) {
            transitionIsAnimating = true;
            pageTransitionLoop();
        }
    } else if (imageBg) {
        image_expand_bg.querySelector("div").style.height = "0%";
    }
    content.style.height = null;
    content.style.transition = "opacity 1.5s .2s cubic-bezier(0.075, 0.82, 0.165, 1)";
    content.style.opacity = 1;
    if (imageBg) {
        header.style.transition = "opacity 1.5s .2s cubic-bezier(0.075, 0.82, 0.165, 1)";
        header.style.opacity = 1;
    }
}

function pageTransitionLoop() {
    let width = Math.ceil(window.innerWidth/2 + window.innerHeight/2 * Math.sqrt(3));
    let height = Math.ceil(window.innerHeight/2 + window.innerWidth/2 * Math.sqrt(3));

    let transitionID = "page_transition";
    if (imageExpand) {
        transitionID = "image_expand_bg";
    }
    let transitionCanvas = document.getElementById(transitionID).querySelector("canvas");
    
    // element display size
    transitionCanvas.style.width = width + 15 + "px";
    transitionCanvas.style.height = height + 15 + "px";
    // can be lower resolution
    transitionCanvas.width = width/6;
    transitionCanvas.height = height/90;

    let ctx = transitionCanvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";

    let dt = (Date.now() - lastTransition);

    if (transitionFill) {
        if (dt > 1000 && transitionParticles.length > 0) {
            transitionParticles = [];
            transitionFill = false;
            transitionIsAnimating = false;
            ctx.rect(0, 0, transitionCanvas.width, transitionCanvas.height);
            ctx.fill();
        } else {
            // create new particles
            if (transitionParticles.length == 0) {
                let particleCount = 30;
                for (let i = 0; i < particleCount; i++) {
                    transitionParticles.push({x: Math.random() * transitionCanvas.width, y: Math.random() * transitionCanvas.height + transitionCanvas.height/2, r: 0 - Math.random() * 2});
                }
            }
            // draw particles
            for (let i = 0; i < transitionParticles.length; i++) {
                let radius = Math.max(0, transitionParticles[i].r + 2 + Math.pow(dt/400, 4));
                ctx.beginPath();
                ctx.arc(transitionParticles[i].x, transitionParticles[i].y - Math.pow(dt/500, 5) - dt/80 , radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(transitionCanvas.width/2, transitionCanvas.height, Math.max(0, 2 + Math.pow(dt/300, 4)), 0, Math.PI * 2);
            ctx.fill();
            window.requestAnimationFrame(pageTransitionLoop);
        }
    } else if (transitionEmpty) {
        if (dt > 1000 && transitionParticles.length > 0) {
            transitionParticles = [];
            transitionEmpty = false;
            transitionIsAnimating = false;
            transitionCanvas.width = transitionCanvas.width = width/6;
        } else {
            // create new particles
            if (transitionParticles.length == 0) {
                let particleCount = 30;
                for (let i = 0; i < particleCount; i++) {
                    transitionParticles.push({x: Math.random() * transitionCanvas.width, y: Math.random() * transitionCanvas.height + transitionCanvas.height/5, r: 0 - Math.random() * 2});
                }
            }
            // draw particles
            for (let i = 0; i < transitionParticles.length; i++) {
                let radius = Math.max(0, transitionParticles[i].r + Math.pow(Math.max(0,(900-dt))/200, 3));
                ctx.beginPath();
                ctx.arc(transitionParticles[i].x, transitionParticles[i].y - Math.pow((700-dt)/300, 4) - dt/30 , radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(transitionCanvas.width/2, 0, Math.max(0, Math.pow(Math.max(0,(700-dt))/300, 4)), 0, Math.PI * 2);
            ctx.fill();
            window.requestAnimationFrame(pageTransitionLoop);
        }
    }
}