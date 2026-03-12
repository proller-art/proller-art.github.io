const fillGrowth = 4;
let activeButtonAnims = [];
let buttonsAnimating = false;

// target all buttons and create canvases and filter layers for each
const buttons = document.querySelectorAll(".button");
for (let i = 0; i < buttons.length; i++) {
    let lighten = document.createElement("div");
    lighten.classList.add("lighten");
    let darken = document.createElement("div");
    darken.classList.add("darken");
    if (hasHWA) {
        let canvas = document.createElement("canvas");
        buttons[i].appendChild(canvas);

        // adjust canvas sizes
        let rect = buttons[i].getBoundingClientRect();
        canvas.width = rect.width + fillGrowth + 10;
        canvas.height = rect.height + fillGrowth + 10;
        canvas.style.width = (rect.width + fillGrowth + 10) + "px";
        canvas.style.height = (rect.height + fillGrowth + 10) * 5 + "px";

        // set onhovers and onmouseout function
        buttons[i].onmouseenter = function(e) {
            fillButton(buttons[i]);
        };
        buttons[i].onmouseleave = function(e) {
            emptyButton(buttons[i]);
        };
    } else {
        let fill = document.createElement("div");
        fill.classList.add("simple_fill");
        buttons[i].appendChild(fill);
    }
    buttons[i].appendChild(lighten);
    buttons[i].appendChild(darken);

    let buttonWidth = Math.floor(buttons[i].getBoundingClientRect().width);
    buttons[i].parentElement.style.width = buttonWidth + "px";
}

let stasisElements = document.querySelectorAll(".stasis");
for (let i = 0; i < stasisElements.length; i++) {
    stasisElements[i].classList.remove("stasis");
}

// starts canvas fill animation for given button div
function fillButton(div) {
    let activeButton = activeButtonAnims.find(storedDiv => storedDiv.div == div);
    // if button is already animating, reset necessary variables for fill direction
    if (activeButton) {
        activeButton.fill = true;
        activeButton.size = 0;
        activeButton.last = Date.now();
    } else { // otherwise, set up new ball particles to fill the button and initialize the activeButton
        let balls = [];
        let rect = div.getBoundingClientRect();
        let count = Math.floor((rect.height * rect.width) / 1000) + 2;
        for (let i = 0; i < count; i++) {
            balls.push({x: Math.random() * rect.width, y: (Math.random() * rect.height)});
        }
        activeButtonAnims.push({div: div, fill: true, last: Date.now(), balls: balls, size: 0});
    }
    if (!buttonsAnimating) {
        animateButtons();
    }
}

// starts canvas empty animation for given button div
function emptyButton(div) {
    let activeButton = activeButtonAnims.find(storedDiv => storedDiv.div == div);
    let canvas = activeButton.div.querySelector("canvas");
    activeButton.fill = false;
    activeButton.size = Math.min(activeButton.size + 2 + Math.pow((Date.now() - activeButton.last)/60, 2), canvas.width);
    activeButton.last = Date.now();
}

// animation loop for all button animations, stops when all buttons have emptied
function animateButtons() {
    buttonsAnimating = true;
    for (let i = 0; i < activeButtonAnims.length; i++) {
        let canvas = activeButtonAnims[i].div.querySelector("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = canvas.width;
        ctx.fillStyle = "#FFFFFF";
        if (activeButtonAnims[i].fill) { // fill
            for (let j = 0; j < activeButtonAnims[i].balls.length; j++) {
                ctx.beginPath();
                ctx.arc(activeButtonAnims[i].balls[j].x, activeButtonAnims[i].balls[j].y, Math.min(activeButtonAnims[i].size + 2 + Math.pow((Date.now() - activeButtonAnims[i].last)/50, 2), canvas.width), 0, 2 * Math.PI);
                ctx.fill();
            }
        } else { // empty
            for (let j = 0; j < activeButtonAnims[i].balls.length; j++) {
                ctx.beginPath();
                ctx.arc(activeButtonAnims[i].balls[j].x, activeButtonAnims[i].balls[j].y, Math.max(activeButtonAnims[i].size - 10 - (Date.now() - activeButtonAnims[i].last)/3, 0), 0, 2 * Math.PI);
                ctx.fill();
            }
            if (Date.now() - activeButtonAnims[i].last > 1000) {
                canvas.width = canvas.width;
                activeButtonAnims.splice(i, 1);
                i--;
            }
        }
    }
    if (activeButtonAnims.length > 0) {
        window.requestAnimationFrame(animateButtons);
    } else {
        buttonsAnimating = false;
    }
}