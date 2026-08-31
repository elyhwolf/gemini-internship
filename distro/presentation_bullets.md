# 📊 SoundDrop Capstone Presentation — Technical Architecture & Build Plan

### 1. 🏗️ Modern Web & Backend Architecture
- Built as a high-performance Single-Page Application (SPA) using HTML5, Vanilla CSS Glassmorphism design tokens, and modular ES6 JavaScript, backed by a lightweight Python REST micro-service (`server.py`).

### 2. 🎵 Web Audio API & Waveform Engine
- Integrates the native browser **Web Audio API (`AudioContext`)** to decode raw MP3/WAV audio buffers in real-time, rendering frequency spectrum canvases and audio waveform visualizers directly in the browser.

### 3. 🤖 Google Gemini AI Music Release Strategist
- Integrates Google Gemini AI to analyze song metadata and generate professional Electronic Press Kits (EPKs), Spotify artist bios, and editorial playlist pitch applications for independent artists.

### 4. 📡 Direct YouTube Data API v3 & DDEX Barcode Pipeline
- Utilizes the **YouTube Data API v3** with Multipart Media Uploads (`uploadType=multipart`) and Google OAuth 2.0 authentication to publish tracks directly to YouTube, while auto-generating standard ISRC (`US-SD9-26-XXXXX`) barcodes.

### 5. 📊 Real-Time Royalty Analytics & Financial Dashboard
- Features a financial dashboard tracking stream counts, geographic listener distributions, and per-stream royalty payouts, empowering creators with 100% royalty ownership and simulated direct deposit payouts.
