let mouseX = 0;
let mouseY = 0;
let mouseDX = 0;
let mouseDY = 0;
let ballCollection = new Map();
let invRes = 6; // inverse resolution (ex: 2 -> 1/2 resolution)
let ballDensity = .2; // balls per 1000 px^2
let mouseMotion = [];
let lastFrame = Date.now();
let endBlobs = false;

if (hasHWA) {
    setupBlobCages();
    updateCanvases();

    document.onmousemove = (e) => {
        mouseDX = e.clientX - mouseX;
        mouseDY = e.clientY - mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseMotion.push({x: mouseX, y: mouseY, dx: mouseDX, dy: mouseDY, t: Date.now()});
        if (mouseMotion.length > 200) {
            mouseMotion.splice(0,1);
        }
    };
} else {
    fillStaticBlobs();
}

function setupBlobCages() {
    let blobCages = document.getElementsByClassName("blobs");
    for (let i = 0; i < blobCages.length; i++) {
        let box = blobCages[i].getBoundingClientRect();
        // create canvases
        for (let c = 0; c < 12; c++) {
            let canvas = document.createElement("canvas");
            canvas.width = (box.width + 200)/invRes;
            canvas.height = (box.height + 200)/invRes;
            if (c % 2 == 0) {
                if (blobCages[i].classList.contains("invert")) {
                    canvas.style.filter = "blur(25px) contrast(100) invert()"
                    canvas.style.mixBlendMode = "lighten";
                } else {
                    canvas.style.filter = "blur(25px) contrast(100)"
                    canvas.style.mixBlendMode = "darken";
                }
            } else {
                if (blobCages[i].classList.contains("invert")) {
                    canvas.style.filter = "blur(25px) contrast(100)";
                    canvas.style.mixBlendMode = "darken";
                } else {
                    canvas.style.filter = "blur(25px) contrast(100) invert()";
                    canvas.style.mixBlendMode = "lighten";
                }
                
            }
            blobCages[i].appendChild(canvas);
        }
        blobCages[i].appendChild(document.createElement("div"));
        ballCollection.set(blobCages[i].id, []);
        let ballCount = Math.floor(box.width * box.height / 1000 * ballDensity) + 5;
        for (let b = 0; b < ballCount; b++) {
            ballCollection.get(blobCages[i].id).push({x: Math.random()*(box.width+200)/invRes, y: Math.random()*(box.height+200)/invRes, dx: (Math.random()*2-1)/invRes, dy: (Math.random()*2-1)/invRes, r: (Math.random()*100 + 20)/invRes, grow: (Math.random() > .5)});
        }
    }
}

function updateCanvases() {
    if (endBlobs) {
        return;
    }

    // update mouse motion timeouts
    for (let i = 0; i < mouseMotion.length; i++) {
        if (Date.now() - mouseMotion[i].t > 2000) {
            mouseMotion.splice(i, 1);
            i--;
        }
    }

    let blobCages = document.getElementsByClassName("blobs");
    for (let b = 0; b < blobCages.length; b++) {
        let box = blobCages[b].getBoundingClientRect();
        let canvases = blobCages[b].querySelectorAll("canvas");
        for (let c = 0; c < canvases.length; c++) {
            canvases[c].width = (box.width + 200)/invRes;
            canvases[c].height = (box.height + 200)/invRes;
        }
        let balls = ballCollection.get(blobCages[b].id);
        let margin = (100 + canvases.length * 20) / invRes;
        for (let i = 0; i < balls.length; i++) {
            if (balls[i].x < 100/invRes - balls[i].r - margin && balls[i].dx < 0) {
                balls[i].x = (box.width + 100)/invRes + balls[i].r + margin;
            } else if (balls[i].x > (box.width + 100)/invRes + balls[i].r + margin && balls[i].dx > 0) {
                balls[i].x = 100/invRes - balls[i].r - margin;
            }
            if (balls[i].y < 100/invRes - balls[i].r - margin && balls[i].dy < 0) {
                balls[i].y = (box.height + 100)/invRes + balls[i].r + margin;
            } else if (balls[i].y > (box.height + 100)/invRes + balls[i].r + margin && balls[i].dy > 0) {
                balls[i].y = 100/invRes - balls[i].r - margin;
            }

            // mouse influence
            for (let m = 0; m < mouseMotion.length; m++) {
                let x = (mouseMotion[m].x - box.left + 100) / invRes;
                let y = (mouseMotion[m].y - box.top + 100) / invRes;
                
                let d = Math.max(0, Math.sqrt((x - balls[i].x) * (x - balls[i].x) + (y - balls[i].y) * (y - balls[i].y)) - 20);
                let dx = mouseMotion[m].dx > 0 ? Math.max(0, (300/invRes - d) * mouseMotion[m].dx) : Math.min(0, (300/invRes - d) * mouseMotion[m].dx);
                let dy = mouseMotion[m].dy > 0 ? Math.max(0, (300/invRes - d) * mouseMotion[m].dy) : Math.min(0, (300/invRes - d) * mouseMotion[m].dy);
                balls[i].x += dx/6000*(2000+mouseMotion[m].t-Date.now())/3000;
                balls[i].y += dy/6000*(2000+mouseMotion[m].t-Date.now())/3000;
            }

            balls[i].dx = balls[i].dx > 0 ? Math.min(3/invRes, balls[i].dx) : Math.max(-3/invRes, balls[i].dx);
            balls[i].dy = balls[i].dy > 0 ? Math.min(3/invRes, balls[i].dy) : Math.max(-3/invRes, balls[i].dy);

            // apply movement
            balls[i].x += balls[i].dx + Math.sin((Date.now()/1000+(balls[i].y)/(400/invRes)))*.8/invRes;
            balls[i].y += balls[i].dy + Math.cos((Date.now()/1000+(balls[i].x)/(400/invRes)))*.8/invRes;

            // change ball size
            if (balls[i].r > 120/invRes || balls[i].r <= 20/invRes) {
                balls[i].grow = !balls[i].grow;
            }
            balls[i].r += (balls[i].grow ? .1 : -.1)/invRes;

            for (let c = 0; c < canvases.length; c++) {
                let canvas = canvases[c];
                let ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.arc(balls[i].x, balls[i].y, balls[i].r + ((canvases.length-c-(c%2))*(20/invRes)) + (c%2==0?(-38/invRes):0), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    window.requestAnimationFrame(updateCanvases);
}

function fillStaticBlobs() {
    let blobs = document.getElementsByClassName("blobs");
    for (let i = 0; i < blobs.length; i++) {
        let blobRect = blobs[i].getBoundingClientRect();
        let blobImg = document.createElement("img");
        blobImg.src = "media/blobs/blob" + Math.ceil(Math.random() * 3) + ".png";
        let rotate;
        if (blobs[i].classList.contains("invert")) {
            rotate = Math.floor(Math.random() * 2) * 2;
            blobImg.style.filter = "invert()";
        } else {
            rotate = Math.floor(Math.random() * 4);
        }
        
        let rotateXOffset = rotate % 2 == 0 ? 0 : -420;
        let rotateYOffset = rotate % 2 == 0 ? 0 : 420;
        blobImg.style.left = rotateXOffset - Math.floor(Math.random() * ((rotate % 2 == 0 ? 1920 : 1080) - blobRect.width)) + "px";
        blobImg.style.top = rotateYOffset - Math.floor(Math.random() * ((rotate % 2 == 0 ? 1080 : 1920) - blobRect.height)) + "px";
        blobImg.style.rotate = rotate * 90 + "deg";
        blobImg.setAttribute('draggable', false);
        blobs[i].appendChild(blobImg);
        blobs[i].appendChild(document.createElement("div"));
    }
}