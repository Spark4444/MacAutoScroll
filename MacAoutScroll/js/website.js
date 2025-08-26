// Auto-scroll functionality for middle mouse button click
document.addEventListener("mousedown", function(event) {
    // Middle mouse button is usually button 1
    if (event.button === 1) {
        event.preventDefault();
        const AutoScrollSvg = chrome.runtime.getURL('img/AutoScroll.svg');
        const TopSvg = chrome.runtime.getURL('img/top.svg');
        const BottomSvg = chrome.runtime.getURL('img/bottom.svg');
        const LeftSvg = chrome.runtime.getURL('img/left.svg');
        const RightSvg = chrome.runtime.getURL('img/right.svg');
        const TopLeftSvg = chrome.runtime.getURL('img/topLeft.svg');
        const TopRightSvg = chrome.runtime.getURL('img/topRight.svg');
        const BottomLeftSvg = chrome.runtime.getURL('img/bottomLeft.svg');
        const BottomRightSvg = chrome.runtime.getURL('img/bottomRight.svg');

        // Create an overlay to capture mouse movements
        const scrollOverlay = document.createElement("div");
        scrollOverlay.style.position = "fixed";
        scrollOverlay.style.top = "0";
        scrollOverlay.style.left = "0";
        scrollOverlay.style.width = "100%";
        scrollOverlay.style.height = "100%";
        scrollOverlay.style.zIndex = "9999";
        scrollOverlay.style.cursor = `url('${AutoScrollSvg}', none)`;
        scrollOverlay.style.background = "rgba(0, 0, 0, 0)";
        scrollOverlay.classList.add("scrollOverlay");

        document.body.appendChild(scrollOverlay);

        // Store the original mouse position at the start of the scroll
        const originalMouseY = event.clientY;
        const originalMouseX = event.clientX;
        // Scroll speed variable
        let scrollSpeedX = 0;
        let scrollSpeedY = 0;

        // Direction flags
        // 0 = no scroll, 1 = scrolling, -1 = scrolling opposite direction
        let scrollingDirection = {
            upDown: 0,
            leftRight: 0,
        }

        // Update scroll speed based on mouse movement
        let scrollInterval = setInterval(function() {
            window.scrollBy(scrollSpeedX, scrollSpeedY);
        }, 10);

        // Function to update scrolling direction based on speed
        function updateSpeedDirection() {
            if (scrollSpeedY > 0) {
                scrollingDirection.upDown = 1; // Scrolling down
            }
            else if (scrollSpeedY < 0) {
                scrollingDirection.upDown = -1; // Scrolling up
            }
            else {
                scrollingDirection.upDown = 0; // No vertical scroll
            }

            if (scrollSpeedX > 0) {
                scrollingDirection.leftRight = 1; // Scrolling right
            }
            else if (scrollSpeedX < 0) {     
                scrollingDirection.leftRight = -1; // Scrolling left
            }
            else {
                scrollingDirection.leftRight = 0; // No horizontal scroll
            }

            if (scrollingDirection.upDown === 0 && scrollingDirection.leftRight === 0) {
                scrollOverlay.style.cursor = `url('${AutoScrollSvg}'), none`;
            }
            else if (scrollingDirection.upDown === 1 && scrollingDirection.leftRight === 0) {
                scrollOverlay.style.cursor = `url('${BottomSvg}'), none`;
            }
            else if (scrollingDirection.upDown === -1 && scrollingDirection.leftRight === 0) {
                scrollOverlay.style.cursor = `url('${TopSvg}'), none`;
            }
            else if (scrollingDirection.upDown === 0 && scrollingDirection.leftRight === 1) {
                scrollOverlay.style.cursor = `url('${RightSvg}'), none`;
            }
            else if (scrollingDirection.upDown === 0 && scrollingDirection.leftRight === -1) {
                scrollOverlay.style.cursor = `url('${LeftSvg}'), none`;
            }
            else if (scrollingDirection.upDown === 1 && scrollingDirection.leftRight === 1) {
                scrollOverlay.style.cursor = `url('${BottomRightSvg}'), none`;
            }
            else if (scrollingDirection.upDown === 1 && scrollingDirection.leftRight === -1) {
                scrollOverlay.style.cursor = `url('${BottomLeftSvg}'), none`;
            }
            else if (scrollingDirection.upDown === -1 && scrollingDirection.leftRight === 1) {
                scrollOverlay.style.cursor = `url('${TopRightSvg}'), none`;
            }
            else if (scrollingDirection.upDown === -1 && scrollingDirection.leftRight === -1) {
                scrollOverlay.style.cursor = `url('${TopLeftSvg}'), none`;
            }
        }

        // Update the scroll speed based on mouse movement
        function updateScrollSpeed(e) {
            // Calculate the change in mouse position
            const deltaY = e.clientY - originalMouseY;
            const deltaX = e.clientX - originalMouseX;

            // Calculate the scroll speed based on the distance from the original position
            scrollSpeedY = Math.max(-20, Math.min(20, deltaY / 5));

            // Calculate horizontal scroll speed
            scrollSpeedX = Math.max(-20, Math.min(20, deltaX / 5));

            updateSpeedDirection();
        }

        // Listen for mouse movements
        document.addEventListener("mousemove", updateScrollSpeed);


        // Stop scrolling on mouse up or when the mouse leaves the window
        function stopScrolling() {
            clearInterval(scrollInterval);
            scrollOverlay.remove();
            document.removeEventListener("mouseup", stopScrolling);
            document.removeEventListener("mouseleave", stopScrolling);
            document.removeEventListener("mousemove", updateScrollSpeed);
        }

        // Bind the stop function to mouseup and mouseleave events
        document.addEventListener("mouseup", stopScrolling);
        document.addEventListener("mouseleave", stopScrolling);
    }
});