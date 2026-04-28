#AI Disaster Guardian
Google Solution Challenge 2025 Submission

> Transforming satellite data into life-saving decisions using AI. 


#The Problem
Natural disasters are increasing rapidly due to climate change, outpacing existing warning technologies. Current systems are often slow, complex, and fail to reach people in critical minutes—especially in vulnerable rural areas. A lack of real-time, personalized, and actionable alerts leads to an avoidable loss of lives.

#Our Solution
AI Disaster Guardian is a unified platform designed for high-stress emergency situations. Instead of forcing users to decode complex weather maps, we provide a single, highly accessible SCAN AREA? button. 

By combining real-time environmental data with deep learning models, our AI Agent instantly analyzes a user's exact GPS coordinates to provide direct answers, personalized safety guidance, and actionable evacuation routes. 

Target UN Sustainable Development Goals (SDGs):
Goal 11: Sustainable Cities and Communities
Goal 13: Climate Action


Core Features (MVP)
One-Tap "SCAN AREA ?" USP: A simplistic, human-centric interface designed for panic situations. One tap grabs the user's location and evaluates immediate risk.
Gemini-Powered Risk Analysis: Uses the Gemini 1.5 Flash API as an intelligent disaster agent to process location data and return a JSON-formatted risk level (Safe/Danger).
Dynamic UI Alerts: The app interface adapts instantly based on the threat level, flashing Red for danger (with evacuation instructions) or Green for safe.
Low-Bandwidth Optimization: Designed to load fast and operate efficiently in remote or rural environments.


Technology Stack
Frontend: Flutter (Cross-platform Web/Mobile UI)
Backend & Auth: Firebase (Cloud Functions, Authentication, Firestore)
AI Engine: Google Gemini 1.5 Flash API 
Location Services: Geolocator Plugin (for real-time GPS fetching)


Getting Started (Local Development)

Follow these steps to run the AI Disaster Guardian prototype locally:

Prerequisites
Flutter SDK (v3.19 or higher)
Dart SDK
A Google Cloud Project with the Gemini API enabled
A Firebase Project

Installation

1. Clone the repository:
   ```bash
