# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Course Help is a React Native application built with Expo that helps users manage their shopping and daily purchases.

## Development Commands

- `npm start` or `expo start` - Start the Expo development server
- `npm run android` or `expo start --android` - Run on Android
- `npm run ios` or `expo start --ios` - Run on iOS
- `npm run web` or `expo start --web` - Run on web

## Architecture

- **App.js** - Main application component with landing page and modal navigation
- Uses React Native with Expo framework
- Features include:
  - Landing page with hero section and feature cards
  - Contact form with validation
  - Modal-based blue page with additional features
  - Custom styling with StyleSheet

## Key Dependencies

- React Native 0.73.4
- React 18.2.0  
- Expo ~50.0.0
- Uses built-in React Native components (View, Text, ScrollView, Modal, etc.)