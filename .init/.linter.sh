#!/bin/bash
cd /home/kavia/workspace/code-generation/personal-study-tracker-223925-223980/WebFrontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

