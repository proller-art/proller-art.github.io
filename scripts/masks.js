// text/image mask animations (uses keyframes)
const threeSqrt = 1.73205;
const layoutCutoffs = [990, 1380];

let layoutWidthIndex = 2;
layoutShiftCheck: for (let i = 0; i < layoutCutoffs.length; i++) {
    if (window.innerWidth < layoutCutoffs[i]) {
        layoutWidthIndex = i;
        break layoutShiftCheck;
    }
}

// readjust mask sizes on resize in case of layout shift
window.addEventListener("resize", layoutMaskResize);

// render one frame before making mask size calculations
window.requestAnimationFrame(createMasks);

// select all mask elements and create necessary divs around them
function createMasks() {
    let masks = document.getElementsByClassName("mask");
    // create necessary elements for mask animations
    for (let i = 0; i < masks.length; i++) {
        let maskFill = document.createElement("div");
        maskFill.classList.add("mask_fill");
        let inner = masks[i].getElementsByClassName("mask_content")[0];
        inner.style.top = 0 + "px";
        inner.style.transform = "rotate(30deg)";
        masks[i].style.transform = "rotate(-30deg)";

        maskFill.appendChild(inner);
        masks[i].appendChild(maskFill);

        let shadow = maskFill.cloneNode(true);
        shadow.classList.remove("mask");
        shadow.classList.add("shadow");
        masks[i].prepend(shadow);
        resizeMask(masks[i]);
        
        masks[i].style.display = "none";
    }

    document.addEventListener("scroll", checkScrollTriggers);
    window.addEventListener("resize", checkScrollTriggers);

    checkScrollTriggers();
}

// size a mask based on its mask content, given mask element
function resizeMask(mask) {
    let inners = mask.getElementsByClassName("mask_content");
    let innerRect = inners[0].getBoundingClientRect();
    
    // set mask height and width to circumscribe inner content at a 30deg angle
    mask.style.height = (innerRect.height * threeSqrt + innerRect.width) / 2 + "px";
    mask.style.width = (innerRect.width * threeSqrt + innerRect.height) / 2 + "px";

    let xOffset = (innerRect.height * threeSqrt) / 4;
    let yOffset = innerRect.height / 4;

    let innerXOffset = Math.sqrt(xOffset * xOffset + yOffset * yOffset);

    inners[0].style.left = innerXOffset + "px";
    inners[1].style.left = innerXOffset + "px";

    mask.style.transformOrigin = innerXOffset + "px 0px";
    mask.style.marginLeft = -innerXOffset + "px";
}

// resizes all masks (for in the event of a layout change)
function layoutMaskResize() {
    let newIndex = 2;
    layoutShiftCheck: for (let i = 0; i < layoutCutoffs.length; i++) {
        if (window.innerWidth < layoutCutoffs[i]) {
            newIndex = i;
            break layoutShiftCheck;
        }
    }
    // check if layout shifted, resize the masks here
    if (newIndex != layoutWidthIndex || window.innerWidth < layoutCutoffs[0]) {
        layoutWidthIndex = newIndex;
        
        let masks = document.getElementsByClassName("mask");
        // put elements in frames relative to their sizes (use funny trig equations here)
        for (let i = 0; i < masks.length; i++) {
            resizeMask(masks[i]);
        }
    }
}

// animates mask elements associated with the given mask IDs 
function animateMasks(maskIDs) {
    for (let i = 0; i < maskIDs.length; i++) {
        let mask = document.getElementById(maskIDs[i]);
        mask.style.display = "block";
    }
}