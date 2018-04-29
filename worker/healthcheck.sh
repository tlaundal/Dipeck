#!/usr/bin/env bash

if [ "$(curl http://127.0.0.1:1109/)" == 'true' ]; then
    exit 0
fi

exit 1