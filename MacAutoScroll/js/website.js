// Asset srcs
const autoScrollSvg = chrome.runtime.getURL('img/autoScroll.svg');
const horizontalScrollSvg = chrome.runtime.getURL('img/horizontalScroll.svg');
const verticalScrollSvg = chrome.runtime.getURL('img/verticalScroll.svg');
const topSvg = chrome.runtime.getURL('img/top.svg');
const bottomSvg = chrome.runtime.getURL('img/bottom.svg');
const leftSvg = chrome.runtime.getURL('img/left.svg');
const rightSvg = chrome.runtime.getURL('img/right.svg');
const topLeftSvg = chrome.runtime.getURL('img/topLeft.svg');
const topRightSvg = chrome.runtime.getURL('img/topRight.svg');
const bottomLeftSvg = chrome.runtime.getURL('img/bottomLeft.svg');
const bottomRightSvg = chrome.runtime.getURL('img/bottomRight.svg');

// Dead zone as percentage of screen (4% of screen height/width)
const deadZonePercentage = 0.04;
// Maximum scroll speed
const maxSpeed = 100;

// General variables
let autoScrollEnabled = false;
let defaultCursor = autoScrollSvg;
let scrollInterval, scrollOverlay;
let updateScrollSpeed; // Keep reference to remove listener

// Function to stop auto-scrolling
function stopScrolling() {
  if (autoScrollEnabled) {
    autoScrollEnabled = false;
    if (scrollInterval) {
      clearInterval(scrollInterval);
    }

    if (scrollOverlay) {
      removeOverlay();
    }

    if (updateScrollSpeed) {
      document.removeEventListener('mousemove', updateScrollSpeed);
    }
    window.removeEventListener('blur', stopScrolling);
    document.removeEventListener('mousedown', stopScrolling, true);
    document.removeEventListener('keydown', stopScrolling, true);
    document.removeEventListener('wheel', preventScrolling, true);
    document.removeEventListener('keydown', preventScrolling, true);
  }
}

// Function to create an overlay
function createOverlay(type) {
  scrollOverlay = document.createElement('div');
  scrollOverlay.style.position = 'fixed';
  scrollOverlay.style.top = '0';
  scrollOverlay.style.left = '0';
  scrollOverlay.style.width = '100%';
  scrollOverlay.style.height = '100%';
  scrollOverlay.style.zIndex = '9999';
  scrollOverlay.style.cursor = `url("${defaultCursor}"), none`;
  scrollOverlay.style.background = 'rgba(0, 0, 0, 0)';
  scrollOverlay.classList.add('scrollOverlay');
  document.body.appendChild(scrollOverlay);
}

// Function to remove the overlay
function removeOverlay() {
  if (scrollOverlay) {
    scrollOverlay.remove();
  }
}

// Function to check if an element is overflow hidden
function isElementOverflowHidden(element) {
  const styles = getComputedStyle(element);
  const result = {
    horizontal: styles.overflowX === 'hidden' || styles.overflowX === 'clip',
    vertical: styles.overflowY === 'hidden' || styles.overflowY === 'clip',
  };

  return result;
}

// Function to check if an element has a scrollbar
function isElementScrollable(element) {
  if (element) {
    function checkScrollBar(element, dir) {
      dir = dir === 'vertical' ? 'scrollTop' : 'scrollLeft';

      let res = !!element[dir];

      if (!res) {
        element[dir] = 1;
        res = !!element[dir];
        element[dir] = 0;
      }

      return res;
    }

    const hasOverflow = isElementOverflowHidden(element);
    const hasVerticalScrollbar =
      checkScrollBar(element, 'vertical') && !hasOverflow.vertical;
    const hasHorizontalScrollbar =
      checkScrollBar(element, 'horizontal') && !hasOverflow.horizontal;

    if (hasHorizontalScrollbar && hasVerticalScrollbar) {
      return 'both';
    } else if (hasHorizontalScrollbar) {
      return 'horizontal';
    } else if (hasVerticalScrollbar) {
      return 'vertical';
    }
    return 'none';
  }
}

// Find the closest scrollable ancestor element
function findClosestScrollableElement(element) {
  let scrollable = isElementScrollable(element);
  while (scrollable === 'none' && element) {
    // Check if the element is a shadow host
    element = element.parentElement || element.parentNode.host;
    scrollable = isElementScrollable(element);
  }

  if (!element) {
    return null;
  }

  return element;
}

// Prevent scrolling
function preventScrolling(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Auto-scroll functionality for middle mouse button click
document.addEventListener(
  'mousedown',
  function (event) {
    // stop scrolling on any click
    if (autoScrollEnabled && event.button !== 1) {
      stopScrolling();
      return;
    }

    const targetElement = findClosestScrollableElement(event.target);
    const scrollbarDirection = isElementScrollable(targetElement);

    // Middle mouse button is button 1
    if (event.button === 1 && scrollbarDirection !== 'none' && targetElement) {
      // If autoscroll is already enabled, a middle click should stop it.
      
      if (autoScrollEnabled) {
        stopScrolling();
        event.preventDefault();
        return;
      }

      defaultCursor = autoScrollSvg;
      if (scrollbarDirection === 'horizontal') {
        defaultCursor = horizontalScrollSvg;
      } else if (scrollbarDirection === 'vertical') {
        defaultCursor = verticalScrollSvg;
      }

      // Original Mouse positions
      const originalMouseY = event.clientY;
      const originalMouseX = event.clientX;

      let hasScrolled = false;

      // Scroll speed
      let scrollSpeedX = 0;
      let scrollSpeedY = 0;

      // Direction flags
      // 0 = no scroll, 1 = scrolling, -1 = scrolling opposite direction
      let scrollingDirection = {
        upDown: 0,
        leftRight: 0,
      };

      // Update the scroll speed based on mouse movement
      updateScrollSpeed = function (e) {
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
        } else {
          // Calculate effective percentage after removing dead zone
          const effectivePercentageY = percentageY - deadZonePercentage;

          // Scale to maximum speed, maintaining direction
          const direction = deltaY > 0 ? 1 : -1;
          scrollSpeedY =
            direction * Math.min(maxSpeed, effectivePercentageY * maxSpeed * 2);
        }

        // Same logic for horizontal movement
        if (percentageX < deadZonePercentage) {
          scrollSpeedX = 0;
        } else {
          // Calculate effective percentage after removing dead zone
          const effectivePercentageX = percentageX - deadZonePercentage;

          // Scale to maximum speed, maintaining direction
          const direction = deltaX > 0 ? 1 : -1;
          scrollSpeedX =
            direction * Math.min(maxSpeed, effectivePercentageX * maxSpeed * 2);
        }

        updateSpeedDirection();
      };

      // Function to update scrolling direction based on speed
      function updateSpeedDirection() {
        if (scrollSpeedY > 0 && scrollbarDirection !== 'horizontal') {
          scrollingDirection.upDown = 1; // Scrolling down
        } else if (scrollSpeedY < 0 && scrollbarDirection !== 'horizontal') {
          scrollingDirection.upDown = -1; // Scrolling up
        } else {
          scrollingDirection.upDown = 0; // No vertical scroll
        }

        if (scrollSpeedX > 0 && scrollbarDirection !== 'vertical') {
          scrollingDirection.leftRight = 1; // Scrolling right
        } else if (scrollSpeedX < 0 && scrollbarDirection !== 'vertical') {
          scrollingDirection.leftRight = -1; // Scrolling left
        } else {
          scrollingDirection.leftRight = 0; // No horizontal scroll
        }

        if (scrollingDirection.upDown !== 0 || scrollingDirection.leftRight !== 0) {
          hasScrolled = true;
        }

        // Set the cursor depending on the scroll direction
        if (
          scrollingDirection.upDown === 0 &&
          scrollingDirection.leftRight === 0
        ) {
          scrollOverlay.style.cursor = `url("${defaultCursor}"), none`;
        } else if (
          scrollingDirection.upDown === 1 &&
          scrollingDirection.leftRight === 0
        ) {
          scrollOverlay.style.cursor = `url("${bottomSvg}"), none`;
        } else if (
          scrollingDirection.upDown === -1 &&
          scrollingDirection.leftRight === 0
        ) {
          scrollOverlay.style.cursor = `url("${topSvg}"), none`;
        } else if (
          scrollingDirection.upDown === 0 &&
          scrollingDirection.leftRight === 1
        ) {
          scrollOverlay.style.cursor = `url("${rightSvg}"), none`;
        } else if (
          scrollingDirection.upDown === 0 &&
          scrollingDirection.leftRight === -1
        ) {
          scrollOverlay.style.cursor = `url("${leftSvg}"), none`;
        } else if (
          scrollingDirection.upDown === 1 &&
          scrollingDirection.leftRight === 1
        ) {
          scrollOverlay.style.cursor = `url("${bottomRightSvg}"), none`;
        } else if (
          scrollingDirection.upDown === 1 &&
          scrollingDirection.leftRight === -1
        ) {
          scrollOverlay.style.cursor = `url("${bottomLeftSvg}"), none`;
        } else if (
          scrollingDirection.upDown === -1 &&
          scrollingDirection.leftRight === 1
        ) {
          scrollOverlay.style.cursor = `url("${topRightSvg}"), none`;
        } else if (
          scrollingDirection.upDown === -1 &&
          scrollingDirection.leftRight === -1
        ) {
          scrollOverlay.style.cursor = `url("${topLeftSvg}"), none`;
        }
      }

      // Check if the event has been prevented by the website
      if (event.defaultPrevented) {
        return;
      }

      event.preventDefault();

      autoScrollEnabled = true;

      // create an overlay for the autoscroll
      createOverlay(scrollbarDirection);

      // Update scroll speed based on mouse movement
      scrollInterval = setInterval(function () {
        targetElement.scrollBy(scrollSpeedX, scrollSpeedY);
      }, 10);

      // Listen for mouse movements and switching to another tab
      document.addEventListener('mousemove', updateScrollSpeed);
      window.addEventListener('blur', stopScrolling, { once: true });
      document.addEventListener('keydown', stopScrolling, {
        once: true,
        capture: true,
      });
      document.addEventListener('mousedown', stopScrolling, {
        once: true,
        capture: true,
      });
      document.addEventListener('wheel', preventScrolling, {
        capture: true,
        passive: false,
      });
      document.addEventListener('keydown', preventScrolling, { capture: true });

      // Stop scrolling on mouse up if the user has scrolled, e.g. it was a long click
      document.addEventListener('mouseup', function () {
        if (hasScrolled) {
           stopScrolling();
        }
      }, { once: true });
    }
  },
  true
);
