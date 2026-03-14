let mouseX = 0;
let mouseY = 0;
let mouseDX = 0;
let mouseDY = 0;
let ballCollection = new Map();
let invRes = 2; // inverse resolution (ex: 2 -> 1/2 resolution)
let ballDensity = .1; // balls per 1000 px^2
let mouseMotion = [];

let ringMargin = 24;
let blurRadius = 36;
let ringCount = 6;

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

        // create canvas
        let canvas = document.createElement("canvas");
        canvas.width = (box.width + 200)/invRes;
        canvas.height = (box.height + 200)/invRes;
        if (blobCages[i].classList.contains("invert")) {
            canvas.style.filter = "blur(6px) brightness(.67) contrast(300) invert()";
        }
        blobCages[i].appendChild(canvas);

        blobCages[i].appendChild(document.createElement("div"));
        ballCollection.set(blobCages[i].id, []);
        let ballCount = Math.floor(box.width * box.height / 1000 * ballDensity);
        for (let b = 0; b < ballCount; b++) {
            ballCollection.get(blobCages[i].id).push({x: Math.random()*(box.width+200)/invRes, y: Math.random()*(box.height+200)/invRes, dx: (Math.random()*2-1)/invRes, dy: (Math.random()*2-1)/invRes, r: (Math.random()*60 + 10)/invRes, grow: (Math.random() > .5)});
        }
    }
}

function updateCanvases() {
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
        let canvas = blobCages[b].querySelector("canvas");

        canvas.width = (box.width + 200)/invRes;

        let balls = ballCollection.get(blobCages[b].id);
        let margin = (100 + ringCount * 20) / invRes;
        for (let i = 0; i < balls.length; i++) {
            // wrap to other side if fully off of canvas
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

            balls[i].dx = balls[i].dx > 0 ? Math.min(2/invRes, balls[i].dx) : Math.max(-2/invRes, balls[i].dx);
            balls[i].dy = balls[i].dy > 0 ? Math.min(2/invRes, balls[i].dy) : Math.max(-2/invRes, balls[i].dy);

            // apply movement
            balls[i].x += balls[i].dx + Math.sin((Date.now()/1000+(balls[i].y)/(400/invRes)))*.8/invRes;
            balls[i].y += balls[i].dy + Math.cos((Date.now()/1000+(balls[i].x)/(400/invRes)))*.8/invRes;

            // change ball size
            if (balls[i].r > 120/invRes || balls[i].r <= 20/invRes) {
                balls[i].grow = !balls[i].grow;
            }
            balls[i].r += (balls[i].grow ? .1 : -.1)/invRes;
        }

        let ctx = canvas.getContext("2d");
        for (let c = 0; c < ringCount; c++) {
            for (let i = 0; i < balls.length; i++) {
                let radius = balls[i].r + ((ringCount - c) * ringMargin + (c%2==0?0:ringMargin*.9)) / invRes;
                ctx.beginPath();
                ctx.arc(balls[i].x, balls[i].y, radius + blurRadius/invRes, 0, Math.PI * 2);
                let gradient = ctx.createRadialGradient(balls[i].x, balls[i].y, radius, balls[i].x, balls[i].y, radius + blurRadius/invRes);
                if (c % 2 == 0) {
                    gradient.addColorStop(0, "#000000");
                    gradient.addColorStop(1, "#00000000");
                } else {
                    gradient.addColorStop(0, "#FFFFFF");
                    gradient.addColorStop(1, "#FFFFFF00");
                }
                ctx.fillStyle = gradient;
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