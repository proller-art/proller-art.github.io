let zoomDragXOffset = 0;
let minScale = 1;
let maxScale = 4;
let screenMargin = 80;
let zoomPercent = 0;
let imageFrameRect;
let imageFrame;
let imageOffset;
let originalScrollPosition = 0;
let eventTimeout;

zoom_thumb.addEventListener("mousedown", handleZoomScrollDrag);

// fullscreen image
function expandImage(button) {
    // store scroll position to return to later
    originalScrollPosition = window.scrollY;

    // fill dark canvas
    fillTransition(true);

    imageFrame = button.parentElement.parentElement;
    let imgToExpand = imageFrame.querySelector("img");

    // create placeholder for holding the spot of the expanded image
    let placeholder = imageFrame.cloneNode();
    placeholder.id = "img_placeholder";

    // get the screen position of the image to expand
    imageFrame.style.transition = null;
    imageFrameRect = imageFrame.getBoundingClientRect();
    let imageRect = imgToExpand.getBoundingClientRect();
    imageFrame.style.left = imageFrameRect.left + imageFrameRect.width/2 + "px";
    imageFrame.style.top = imageFrameRect.top + imageFrameRect.height/2 + "px";
    imageFrame.style.width = imageFrameRect.width + "px";

    // reveal image expand layout and place elements in their correct divs
    image_expand.style.display = "block";
    imageFrame.parentElement.insertBefore(placeholder, imageFrame);
    image_expand.prepend(imageFrame);
    imageFrame.style.position = "absolute";
    
    // hide expand button
    void (button.offsetHeight);
    button.style.transform = "translate(-50%, -50%) scale(0%)";

    // clear image cropping transforms
    imgToExpand.style.transition = "transform 1s 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s 1s cubic-bezier(0.23, 1, 0.320, 1)"; 
    imgToExpand.style.width = "100%";
    imgToExpand.style.transform = "translate(-50%, -50%)";

    // resize image frame to fit actual image ratio
    imageFrame.style.transition = "left 1s cubic-bezier(0.23, 1, 0.320, 1), top 1s cubic-bezier(0.23, 1, 0.320, 1), height 1s 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border-radius 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border 1s 1s cubic-bezier(0.23, 1, 0.320, 1)";
    imageFrame.style.height = imageRect.height + "px";
    imageFrame.style.width = imageRect.width + "px";
    imageFrame.style.borderRadius = "0px";
    imageFrame.style.left = window.innerWidth/2 + "px";
    imageFrame.style.top = window.innerHeight/2 + "px";
    imageFrame.style.marginLeft = "0px";
    imageFrame.style.marginTop = "0px";
    imageFrame.style.border = "1px solid #F2F2F290";

    // calculate minimum scale
    // scale 1 (imageRect.width, imageRect.height)
    // change minscale if the screen height or width is less than the image's height or width
    imageRect = imgToExpand.getBoundingClientRect();
    if (imageRect.width > imageRect.height && window.innerWidth - screenMargin < imageRect.width) {
        minScale = (window.innerWidth - screenMargin) / imageRect.width;
    } else if (window.innerHeight - screenMargin < imageRect.height) {
        minScale = (window.innerHeight - screenMargin) / imageRect.height;
    }
    imageFrame.style.transition = "left 1s cubic-bezier(0.23, 1, 0.320, 1), top 1s cubic-bezier(0.23, 1, 0.320, 1), height 1s 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border-radius 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border 1s 1s cubic-bezier(0.23, 1, 0.320, 1), transform 1s 1s cubic-bezier(0.23, 1, 0.320, 1)";
    imageFrame.style.transform = "translate(-50%, -50%) scale(" + minScale + ")";

    setTimeout(() => {
        imgToExpand.style.transition = null;    
        image_expand.style.height = "100vh";
        image_expand.style.overflow = "hidden";
        // reveal blobs and UI after 1s
        image_expand_blob1.style.display = "block";
        image_expand_blob2.style.display = "block";
        void (image_expand.offsetHeight);
        blob1_svg.style.transform = blob2_svg.style.transform = "translateY(0%)";

        document.addEventListener("keydown", handleEscapeKey);

        zoomPercent = 0;
        zoom_thumb.style.left = "0px";
        image_expand_bar.style.display = "flex";
        void (image_expand_bar.offsetHeight);
        image_expand_bar.style.bottom = "80px";

        eventTimeout = setTimeout(() => {
            imageFrame.style.transition = "left 1s cubic-bezier(0.23, 1, 0.320, 1), top 1s cubic-bezier(0.23, 1, 0.320, 1), height 1s 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border-radius 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border 1s 1s cubic-bezier(0.23, 1, 0.320, 1), transform 1s cubic-bezier(0.23, 1, 0.320, 1)";
            // add listeners for resizing and UI controls
            imageFrame.style.cursor = "grab";
            window.addEventListener("resize", handleResizeImageExpand);
            document.addEventListener("wheel", handleZoomWheel);
            imageFrame.addEventListener("mousedown", handleImageDrag);
        }, 1000);
    }, 1000);
}

// close on escape key press
function handleEscapeKey(e) {
    if (e.key === "Escape") {
        closeImage();
    }
}

// return image to original position and close fullscreen UI
function closeImage() {
    // clear timeout that adds events from original expand function
    clearTimeout(eventTimeout);

    // remove events
    document.removeEventListener("keydown", handleEscapeKey);
    window.removeEventListener("resize", handleResizeImageExpand);
    document.removeEventListener("wheel", handleZoomWheel);
    imageFrame.removeEventListener("mousedown", handleImageDrag);

    // reset image size and other attributes
    let placeholderRect = document.getElementById("img_placeholder").getBoundingClientRect();
    imageFrame.style.transition = "left 1s cubic-bezier(0.23, 1, 0.320, 1), top 1s cubic-bezier(0.23, 1, 0.320, 1), height 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s cubic-bezier(0.23, 1, 0.320, 1), border-radius 1s cubic-bezier(0.23, 1, 0.320, 1), border 1s cubic-bezier(0.23, 1, 0.320, 1), transform 1s cubic-bezier(0.23, 1, 0.320, 1)"
    void (imageFrame.offsetHeight);
    imageFrame.style.height = null;
    imageFrame.style.width = placeholderRect.width + "px";
    imageFrame.style.borderRadius = null;
    imageFrame.style.border = null;
    imageFrame.style.cursor = "auto";
    imageFrame.style.left = window.innerWidth/2 + "px";
    imageFrame.style.top = window.innerHeight/2 + "px";
    imageFrame.style.transform = "translate(-50%, -50%) scale(1)";

    // clear image cropping transforms
    let imgToExpand = imageFrame.querySelector("img");
    imgToExpand.style.transition = "transform 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s cubic-bezier(0.23, 1, 0.320, 1)";
    imgToExpand.style.transform = null;
    imgToExpand.style.width = null;

    // hide UI
    image_expand_bar.style.bottom = "-80px"; 

    // hide blobs
    blob1_svg.style.transform = blob2_svg.style.transform = null;

    setTimeout(() => {
        imgToExpand.style.transition = null;
        image_expand_bar.style.display = null;
        image_expand.style.height = null;
        image_expand.style.overflow = null;
        image_expand.style.position = "absolute";
        image_expand_blob1.style.display = null;
        image_expand_blob2.style.display = null;
        emptyTransition(true);
        document.documentElement.scrollTop = document.body.scrollTop = originalScrollPosition;
        imageFrame.style.transition = "auto";
        imageFrame.style.left = window.innerWidth/2 + "px";
        imageFrame.style.top = window.innerHeight/2 + window.scrollY + "px";
        void (imageFrame.offsetHeight);
        imageFrame.style.transition = null;
        
        // match to placeholder postion
        placeholderRect = document.getElementById("img_placeholder").getBoundingClientRect();
        imageFrame.style.transition = "left 1s cubic-bezier(0.23, 1, 0.320, 1), top 1s cubic-bezier(0.23, 1, 0.320, 1), height 1s 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border-radius 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border 1s 1s cubic-bezier(0.23, 1, 0.320, 1)";
        imageFrame.style.left = placeholderRect.left + placeholderRect.width/2 + "px";
        imageFrame.style.top = placeholderRect.top + placeholderRect.height/2 + window.scrollY + "px";
        
        setTimeout(() => {
            imageFrame.style.width = null;
            // placing the img back into its original div
            imageFrame.style.transition = null;
            image_expand.style.position = null;
            imageFrame.style.transform = null;
            imageFrame.style.left = null;
            imageFrame.style.top = null;
            imageFrame.style.marginLeft = null;
            imageFrame.style.marginTop = null;
            imageFrame.style.position = null;
            img_placeholder.parentElement.insertBefore(imageFrame, img_placeholder);
            img_placeholder.remove();

            // reveal expand button
            let button = imageFrame.querySelector(".button");
            void (button.offsetHeight);
            button.style.transform = null;
        }, 1000);
    }, 1000);
}

// reposition image on resize and adjust maximum
function handleResizeImageExpand(event) {
    // center the image;
    imageFrame.style.left = window.innerWidth/2 + "px";
    imageFrame.style.top = window.innerHeight/2 + "px";

    // adjust min size, adjust scrollbar position to match current image size
    if (imageFrameRect.width > imageFrameRect.height && window.innerWidth - screenMargin < imageFrameRect.width) {
        minScale = (window.innerWidth - screenMargin) / imageFrameRect.width;
    } else if (window.innerHeight - screenMargin < imageFrameRect.height) {
        minScale = (window.innerHeight - screenMargin) / imageFrameRect.height;
    }

    // change image scale
    imageFrame.style.transition = null;
    let newScale = minScale + (zoomPercent * (maxScale - minScale));
    imageFrame.style.transform = "translate(-50%, -50%) scale(" + newScale + ")";
}

// scale image on mouse scroll
function handleZoomWheel(event) {
    // update zoomPercent and cap between 0 and 1
    zoomPercent = Math.floor(Math.min(Math.max(0, zoomPercent - event.deltaY/2000), 1) * 200) / 200; 

    // move zoom bar position
    let progress = 200 * zoomPercent;
    zoom_thumb.style.left = progress + "px";

    // scale the image to new zoom
    imageFrame.style.transition = "left 1s cubic-bezier(0.23, 1, 0.320, 1), top 1s cubic-bezier(0.23, 1, 0.320, 1), height 1s 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border-radius 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border 1s 1s cubic-bezier(0.23, 1, 0.320, 1)";
    let newScale = minScale + (zoomPercent * (maxScale - minScale));
    imageFrame.style.transform = "translate(-50%, -50%) scale(" + newScale + ")";
    putImagePositionAtRest();
}

// start zoom thumb dragging
function handleZoomScrollDrag(event) {
    event.preventDefault();
    imageFrame.style.transition = "left 1s cubic-bezier(0.23, 1, 0.320, 1), top 1s cubic-bezier(0.23, 1, 0.320, 1), height 1s 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border-radius 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border 1s 1s cubic-bezier(0.23, 1, 0.320, 1)";
    zoomDragXOffset = zoom_thumb.getBoundingClientRect().left - event.clientX;
    document.addEventListener("mousemove", dragZoom);
    document.addEventListener("mouseup", handleZoomDragEnd);
}

// dragging zoom thumb
function dragZoom(event) {
    event.preventDefault();
    let trackRect = zoom_track.getBoundingClientRect();
    let thumbRect = zoom_thumb.getBoundingClientRect();

    let progress = Math.min(trackRect.width - thumbRect.width, Math.max(0, (event.clientX + zoomDragXOffset - trackRect.left)));
    zoomPercent = progress / (trackRect.width - thumbRect.width);

    zoom_thumb.style.left = progress + "px";
    // scale image based on zoomPercent between max size and calculated minimum for the current window size
    let newScale = minScale + (zoomPercent * (maxScale - minScale));
    imageFrame.style.transform = "translate(-50%, -50%) scale(" + newScale + ")";
    putImagePositionAtRest();
}

// release zoom thumb
function handleZoomDragEnd(event) {
    document.removeEventListener("mousemove", dragZoom);
    document.removeEventListener("mouseup", handleZoomScrollDrag);
}

function handleImageDrag(event) {
    event.preventDefault();
    if (event.button != 0) {
        return;
    }
    let imageFrameDragRect = imageFrame.getBoundingClientRect();
    
    imageOffset = {x: event.clientX - (imageFrameDragRect.left + imageFrameDragRect.width/2), y: event.clientY - (imageFrameDragRect.top + imageFrameDragRect.height/2)};

    imageFrame.style.cursor = "grabbing";
    document.addEventListener("mousemove", dragImage);
    document.addEventListener("mouseup", handleImageDragEnd);
}

function dragImage(event) {
    imageFrame.style.transition = "height 1s 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border-radius 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border 1s 1s cubic-bezier(0.23, 1, 0.320, 1)";
    imageFrame.style.left = (event.clientX - imageOffset.x) + "px"
    imageFrame.style.top = (event.clientY - imageOffset.y) + "px";
}

function handleImageDragEnd(event) {
    if (event.button != 0) {
        return;
    }
    imageFrame.style.cursor = "grab";
    document.removeEventListener("mousemove", dragImage);
    document.removeEventListener("mouseup", handleImageDragEnd);

    imageFrame.style.transition = imageFrame.style.transition = "left 1s cubic-bezier(0.23, 1, 0.320, 1), top 1s cubic-bezier(0.23, 1, 0.320, 1), height 1s 1s cubic-bezier(0.23, 1, 0.320, 1), width 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border-radius 1s 1s cubic-bezier(0.23, 1, 0.320, 1), border 1s 1s cubic-bezier(0.23, 1, 0.320, 1), transform 1s cubic-bezier(0.23, 1, 0.320, 1)";

    putImagePositionAtRest();
}

function putImagePositionAtRest() {
    let currentImageRect = imageFrame.getBoundingClientRect();
    if (currentImageRect.width < window.innerWidth) {
        imageFrame.style.left = window.innerWidth/2 + "px";
    } else {
        let overshoot = currentImageRect.width - window.innerWidth;
        imageFrame.style.left = Math.min(Math.max(window.innerWidth/2 - overshoot/2 - screenMargin, currentImageRect.left + currentImageRect.width/2), window.innerWidth/2 + overshoot/2 + screenMargin) + "px";
    }
    if (currentImageRect.height < window.innerHeight) {
        imageFrame.style.top = window.innerHeight/2 + "px";
    } else {
        let overshoot = currentImageRect.height - window.innerHeight;
        imageFrame.style.top = Math.min(Math.max(window.innerHeight/2 - overshoot/2 - screenMargin, currentImageRect.top + currentImageRect.height/2), window.innerHeight/2 + overshoot/2 + screenMargin) + "px";
    }
}