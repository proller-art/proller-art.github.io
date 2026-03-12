const hasHWA = (() => {
    // disabling canvas shenanigans for now
    return false;

    // create a test function for both "default" drawing and forced software
    const test = (force=false) => {
        // Firefox (at least on macOS) doesn't accelerate OffscreenCanvas
        const canvas = document.createElement("canvas");
        // willReadFrequently will force software rendering
        const ctx = canvas.getContext("2d", { willReadFrequently: force });
        ctx.moveTo(0, 0),
        ctx.lineTo(120, 121); // HWA is bad at obliques
        ctx.stroke();
        return ctx.getImageData(0, 0, 200, 200).data.join();
    };
    // check that both return different results
    return test(true) !== test(false);
})();