#!/usr/bin/env bash

host="$(hostname -i || echo '127.0.0.1')"

# Check the webpage
if ! curl --fail http://$host/; then
  exit 1
fi

# Check the API
if [ $(curl --fail http://$host/request/ | jq -r .status) != 'ok' ]; then
  exit 1
fi

exit 0
