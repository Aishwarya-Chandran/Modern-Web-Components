#  Modern Glassmorphism Sidebar 

A sophisticated, responsive navigation interface featuring a **Glassmorphism UI**, real-time search filtering, and interactive state management. Built for performance and modern aesthetic standards.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-purple.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

###  Live Preview
<img src="./preview.gif" width="600px" alt="Modern Auth UI Animation">

###  Core Features
* **Glassmorphism Design:** Implementation of `backdrop-filter` and layered `radial-gradients` for a frosted-glass effect.
* **Intelligent Search:** Real-time menu filtering with a **"Starts-With" prioritization algorithm** to enhance user speed.
* **Interactive Components:** High-visibility badges for "Messages" (9), "Tasks" (3), and "Analytics" (Live).
* **Responsive Architecture:** Mobile-first design with a smooth-transition hamburger menu.
* **Optimized Performance:** 100% Vanilla JavaScript—no bulky libraries, ensuring sub-millisecond interaction times.

###  Technical Stack
* **Styling:** CSS3 (Custom Properties, Keyframe Animations, Flexbox)
* **Logic:** JavaScript ES6+ (DOM Manipulation, Array Filtering, Event Delegation)
* **Typography:** Syne & DM Sans via Google Fonts
* **Icons:** Remix Icon / SVG Path Integration

###  Manually Configured Components
This version utilizes a controlled data set to demonstrate UI capabilities:
* **User Identity:** Profile initialized with **AC (Aishwarya Chandran)** and "Designer" role.
* **Notification Badges:** Manually assigned values for **Messages (9)**, **Tasks (3)**, and **Calendar (2)**.
* **Search Index:** A static array of 9 primary navigation nodes synchronized with the DOM.

###  Dynamic Implementation & Reuse
To integrate this component into a dynamic environment (Django, React, or Node.js):

#### 1. Automating Badges (API Integration)
Replace static badge values by fetching real-time data from your backend:
```javascript
// Example: Fetching live message counts
async function updateStats() {
    const response = await fetch('/api/user/stats');
    const data = await response.json();
    document.querySelector('.badge-purple').innerText = data.messages;
}