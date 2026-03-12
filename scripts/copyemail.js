function copyEmail(target) {
    navigator.clipboard.writeText("squonkler@proller.art");
    let text = target.querySelector("span");
    text.innerText = "Email Copied!";
    setTimeout(() => {
        text.innerText = "Copy Email";
    }, 1800);
}