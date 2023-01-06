# Travelio Client

## About

This repo is the client-side application for our travel chat/info server. It allows users to chat with other users after authenticating, and also allows users to enter special strings or commands to get specific API results printed to the console.

## Usage

- Primary:
  1. run `npx notifyme-client` in the command line

- Alternate:
  1. navigate to any preferred directory in which to install the github repo
  2. `git clone https://github.com/Notifyme-US/notifyme-client.git`
  3. `cd notifyme-client`
  4. `npm i`
  5. `node index.js`

## Commands

- `!back` - returns to the "rooms" menu
- `!weather [<zip>]` - returns 5 day forecast for the provided zip, or for the user's default zip, if none is provided
- `!events [<zip>]` - returns 5 day forecast for the provided zip, or for the user's default zip, if none is provided
- `!subscribe <type>` - subscribes the user to receive a daily email with the weather forecast or the area's events, as specified. Uses the user's default zip.
