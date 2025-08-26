# MacAutoScroll
An extension that brings Windows-style middle-click auto-scrolling to Mac and Linux browsers

## Principles 
This extension is supposed to be faithfull to the original feature as much as possible

## Features

* **Middle-click auto-scrolling**: Click the middle mouse button to activate auto-scroll mode
* **Directional scrolling**: Move your mouse in any direction to control scroll speed and directi
* **Speed control**: Scroll speed increases based on how far you move the mouse from the initial click point

## Installation

1. Press the blue button `<> Code`.
2. Hover over the `Download Zip` button and click it to download the ZIP version of this repository.

### &nbsp;&nbsp;&nbsp;Or

Use the `git clone` command to copy it onto your computer:
```bash
git clone https://github.com/Spark4444/MacAutoScroll
```
3. Go to the extensions tab in your browser.
4. Enable developer mode in the top-right corner.
5. Press the "Load unpacked" button and select the `MacAoutScroll` folder from the downloaded files (the one inside the main `MacAutoScroll` folder). That's it!

## Usage

* **Activating auto-scroll**: Click the middle mouse button on any webpage that has scrollable content
* **Controlling direction and speed**: 
  - Move your mouse away from the initial click point to start scrolling
  - The further you move the mouse, the faster the scrolling becomes
  - Move up/down to scroll vertically, left/right to scroll horizontally
  - Move diagonally to scroll in both directions simultaneously
* **Visual indicators**: The cursor will change to show arrows indicating the current scroll direction
* **Stopping auto-scroll**: 
  - Click anywhere on the page
  - Press any key
  - Switch to another tab or window
  - Move the mouse back to the center (dead zone)

## How It Works

* **Event Detection**: The extension listens for middle mouse button clicks (button 1) on all web pages
* **Overlay Creation**: When activated, creates an invisible overlay that captures mouse movements
* **Speed Calculation**: Calculates scroll speed based on mouse distance from the initial click point
* **Dead Zone**: Implements a 2% screen size dead zone to prevent accidental scrolling from small movements
* **Direction Mapping**: Maps mouse movement to 8 different scroll directions with corresponding cursor icons
* **Smooth Scrolling**: Uses `setInterval` to provide smooth, continuous scrolling at 10ms intervals
* **Auto-cleanup**: Automatically stops scrolling when the user clicks, switches tabs, or moves mouse to center

### Current state of this project
Finished