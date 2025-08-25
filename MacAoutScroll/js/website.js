document.addEventListener("mousedown", function(event) {
    if (event.button === 1) {
        event.preventDefault();
        let scrollSpeed = 1;
        let scrollInterval = setInterval(function() {
            window.scrollBy(0, scrollSpeed);
        }, 10);

        function stopScrolling() {
            clearInterval(scrollInterval);
            document.removeEventListener("mouseup", stopScrolling);
            document.removeEventListener("mouseleave", stopScrolling);
        }

        document.addEventListener("mouseup", stopScrolling);
        document.addEventListener("mouseleave", stopScrolling);
    }
});