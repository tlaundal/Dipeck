 Dipeck
========

**The **di**stributed **p**rime ch**eck**er**

This is a test project to play around with:
 - Containerization and microservices
 - Message Queues and worker processes
 - Websockets
 - CI and CD
 - *Actually seeing a project through*

## The goal
>  Create an over-engineered web-app for checking whether a number is prime

## The services
 + **Frontend** - A simple HTML page with some JavaScript to send queries to the backend, and listen for results of uncached numbers
 + **Request API** *(python/flask)* - Backend service which receives requests and either returns cached results, or queues the check
 + **Notification service** *(JavaScript/node)* - Should notify clients when their results are ready, likely with websockets
 + **Worker** *(java)* - Simple worker process that consumes numbers from the MQ
