let cat = document.getElementById("cat");
let mouseMoving = false;
let gifPlaying = false;

document.addEventListener("mousemove", function(event) {
    mouseMoving = true;

    if (!gifPlaying) {
        cat.src = cat.getAttribute("data-moving") + "?t=" + new Date().getTime();
        gifPlaying = true;
    }

    let mouseX = event.clientX;
    let mouseY = event.clientY + window.scrollY; // Adjust Y position based on the scroll position

    cat.style.position = "absolute";
    cat.style.left = mouseX + "px";
    cat.style.top = mouseY + "px";
});

setInterval(function() {
    if (mouseMoving) {
        mouseMoving = false;
    } else {
        if (gifPlaying) {
            cat.src = cat.getAttribute("data-paused");
            gifPlaying = false;
        }
    }
}, 100);
