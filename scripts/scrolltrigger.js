let timingOffset = .15;

function checkScrollTriggers() {
    let upperBound = window.innerHeight * .1;
    let lowerBound = window.innerHeight * .9;
    for (let i = 0; i < scrollables.length; i++) {
        let trigger = document.getElementById(scrollables[i].triggerID);
        let rect = trigger.getBoundingClientRect();

        // check if center is within bounds
        // console.log(scrollables[i].triggerID, rect.top, rect.bottom, window.innerHeight, (rect.top > upperBound || rect.bottom < lowerBound));
        if ((rect.top > upperBound && rect.top < lowerBound) || (rect.bottom > upperBound && rect.bottom < lowerBound) || (upperBound > rect.top && lowerBound < rect.bottom)) {
            if (!scrollables[i].used) {
                if (scrollables[i].animateIDs.length > 0) {
                    animateMasks(scrollables[i].animateIDs);
                } else {
                    let element = document.getElementById(scrollables[i].triggerID);
                    let spans = element.querySelectorAll("span");
                    if (spans.length > 0) {
                        for (let j = 0; j < spans.length; j++) {
                            spans[j].style.animation = "fadeUp 1.5s cubic-bezier(0.075, 0.82, 0.165, 1) " + (j * timingOffset) + "s forwards";
                        }
                    } else {
                        let targets = element.getElementsByClassName("mount");
                        for (let j = 0; j < targets.length; j++) {
                            targets[j].style.animation = "fadeUp 1.5s cubic-bezier(0.075, 0.82, 0.165, 1) " + (j * timingOffset) + "s forwards";
                        }
                    }
                }
            }
            scrollables[i].used = true;
        }
    }
}