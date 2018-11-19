#!/bin/bash
cd scratch-vm
npm install
npm link
#npm run watch
cd ../scratch-gui
npm install
npm link scratch-vm
npm start
