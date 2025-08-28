// Asset srcs
const AutoScrollSvg = chrome.runtime.getURL("img/AutoScroll.svg");
const TopSvg = chrome.runtime.getURL("img/top.svg");
const BottomSvg = chrome.runtime.getURL("img/bottom.svg");
const LeftSvg = chrome.runtime.getURL("img/left.svg");
const RightSvg = chrome.runtime.getURL("img/right.svg");
const TopLeftSvg = chrome.runtime.getURL("img/topLeft.svg");
const TopRightSvg = chrome.runtime.getURL("img/topRight.svg");
const BottomLeftSvg = chrome.runtime.getURL("img/bottomLeft.svg");
const BottomRightSvg = chrome.runtime.getURL("img/bottomRight.svg");

// Dead zone as percentage of screen (2% of screen height/width)
const deadZonePercentage = 0.02;
// Maximum scroll speed
const maxSpeed = 30;

// General variables
let AutoScrollEnabled = false;
let scrollInterval, scrollOverlay;

// Function to create an overlay
function createOverlay() {
    scrollOverlay = document.createElement("div");
    scrollOverlay.style.position = "fixed";
    scrollOverlay.style.top = "0";
    scrollOverlay.style.left = "0";
    scrollOverlay.style.width = "100%";
    scrollOverlay.style.height = "100%";
    scrollOverlay.style.zIndex = "9999";
    scrollOverlay.style.cursor = `url("${AutoScrollSvg}"), none`;
    scrollOverlay.style.background = "rgba(0, 0, 0, 0)";
    scrollOverlay.classList.add("scrollOverlay");
    document.body.appendChild(scrollOverlay);
}

// Function to remove the overlay
function removeOverlay() {
    if (scrollOverlay) {
        scrollOverlay.remove();
    }
}

const canScroll = document.documentElement.scrollHeight > window.innerHeight || document.documentElement.scrollWidth > window.innerWidth;

// Function to check if an element is scrollable
function isElementScrollable(element) {
    const horizontally = element.scrollWidth > element.clientWidth;
    const vertically = element.scrollHeight > element.clientHeight;

    if (horizontally && vertically) {
        return "both";
    }
    else if (horizontally) {
        return "horizontal";
    }
    else if (vertically) {
        return "vertical";
    }
    return "none";
}

// Auto-scroll functionality for middle mouse button click
document.addEventListener("mousedown", function(event) {
    // Original Mouse positions
    const originalMouseY = event.clientY;
    const originalMouseX = event.clientX;

    // Scroll speed
    let scrollSpeedX = 0;
    let scrollSpeedY = 0;

    // Direction flags
    // 0 = no scroll, 1 = scrolling, -1 = scrolling opposite direction
    let scrollingDirection = {
        upDown: 0,
        leftRight: 0,
    }

    // Update the scroll speed based on mouse movement
    function updateScrollSpeed(e) {
        // Calculate the change in mouse position
        const deltaY = e.clientY - originalMouseY;
        const deltaX = e.clientX - originalMouseX;

        // Get screen dimensions
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;

        // Calculate percentage of screen moved (0-1 range)
        const percentageY = Math.abs(deltaY) / screenHeight;
        const percentageX = Math.abs(deltaX) / screenWidth;
        
        // Calculate the scroll speed based on percentage of screen moved
        // Only start scrolling if movement exceeds the dead zone percentage
        if (percentageY < deadZonePercentage) {
            scrollSpeedY = 0;
        }
        else {
            // Calculate effective percentage after removing dead zone
            const effectivePercentageY = percentageY - deadZonePercentage;

            // Scale to maximum speed, maintaining direction
            const direction = deltaY > 0 ? 1 : -1;
            scrollSpeedY = direction * Math.min(maxSpeed, effectivePercentageY * maxSpeed * 2);
        }

        // Same logic for horizontal movement
        if (percentageX < deadZonePercentage) {
            scrollSpeedX = 0;
        } 
        else {
            // Calculate effective percentage after removing dead zone
            const effectivePercentageX = percentageX - deadZonePercentage;

            // Scale to maximum speed, maintaining direction
            const direction = deltaX > 0 ? 1 : -1;
            scrollSpeedX = direction * Math.min(maxSpeed, effectivePercentageX * maxSpeed * 2);
        }

        updateSpeedDirection();
    }

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

        // Set the cursor depending on the scroll direction
        if (scrollingDirection.upDown === 0 && scrollingDirection.leftRight === 0) {
            scrollOverlay.style.cursor = `url("${AutoScrollSvg}"), none`;
        }
        else if (scrollingDirection.upDown === 1 && scrollingDirection.leftRight === 0) {
            scrollOverlay.style.cursor = `url("${BottomSvg}"), none`;
        }
        else if (scrollingDirection.upDown === -1 && scrollingDirection.leftRight === 0) {
            scrollOverlay.style.cursor = `url("${TopSvg}"), none`;
        }
        else if (scrollingDirection.upDown === 0 && scrollingDirection.leftRight === 1) {
            scrollOverlay.style.cursor = `url("${RightSvg}"), none`;
        }
        else if (scrollingDirection.upDown === 0 && scrollingDirection.leftRight === -1) {
            scrollOverlay.style.cursor = `url("${LeftSvg}"), none`;
        }
        else if (scrollingDirection.upDown === 1 && scrollingDirection.leftRight === 1) {
            scrollOverlay.style.cursor = `url("${BottomRightSvg}"), none`;
        }
        else if (scrollingDirection.upDown === 1 && scrollingDirection.leftRight === -1) {
            scrollOverlay.style.cursor = `url("${BottomLeftSvg}"), none`;
        }
        else if (scrollingDirection.upDown === -1 && scrollingDirection.leftRight === 1) {
            scrollOverlay.style.cursor = `url("${TopRightSvg}"), none`;
        }
        else if (scrollingDirection.upDown === -1 && scrollingDirection.leftRight === -1) {
            scrollOverlay.style.cursor = `url("${TopLeftSvg}"), none`;
        }
    }

    // Stop scrolling on mouse up or when the mouse leaves the window
    function stopScrolling() {
        if (AutoScrollEnabled) {
            AutoScrollEnabled = false;
            if (scrollInterval) {
                clearInterval(scrollInterval);
            }

            if (scrollOverlay) {
                removeOverlay();
            }

            document.removeEventListener("mousemove", updateScrollSpeed);
            document.removeEventListener("blur", stopScrolling);
        }
    }

    // Middle mouse button is button 1
    if (event.button === 1 && canScroll) {
        // Check if the event has been prevented by the website
        if (event.defaultPrevented) {
            return;
        }
        
        event.preventDefault();

        if (!AutoScrollEnabled) {
            AutoScrollEnabled = true;
            
            // create an overlay for the autoscroll
            createOverlay();

            // Update scroll speed based on mouse movement
            scrollInterval = setInterval(function() {
                window.scrollBy(scrollSpeedX, scrollSpeedY);
            }, 10);

            // Listen for mouse movements and switching to another tab
            document.addEventListener("mousemove", updateScrollSpeed);
            window.addEventListener("blur", stopScrolling, { once: true });
        }
        else if (AutoScrollEnabled) {
            stopScrolling();
        }
    }
    // Right mouse button is button 2
    else if(event.button === 2) {
        stopScrolling();
    }
}, true);