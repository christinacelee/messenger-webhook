'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()),
  request = require('request'),
  PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // creates express http server

const PORT = process.env.PORT || 8080;
// Sets server port and logs message on success
app.listen(PORT, () => console.log('webhook is listening'));


//******************************************************

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log("WEBHOOK EVENT RECEIVED:");
      console.log(webhook_event);

      // //Get the sender PSID
      // let sender_psid = webhook_event.sender.id;
      // console.log('Sender PSID: ' + sender_psid);
      //
      // // Check if the event is a message or postback and
      // // pass the event to the appropriate handler function
      // if (webhook_event.message) {
      //   handleMessage(sender_psid, webhook_event.message);
      // } else if (webhook_event.postback) {
      //   handlePostback(sender_psid, webhook_event.postback);
      // }

    });

    // Returns a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});


//***********************************************************************************


// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});



//**************************************//
//**Functions to handle different msgs**//
//**************************************//

function handleMessage(sender_psid, received_message) {

  let response;

  // Check if the message contains text
  if (received_message.text) {

    if (received_message.text.includes("shirts")) {
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "list",
            "top_element_style": "compact",
            "elements": [
              {
                "title": "Classic T-Shirt Collection",
                "subtitle": "See all our colors",
                "image_url": "https://peterssendreceiveapp.ngrok.io/img/collection.png",
                "buttons": [
                  {
                    "title": "View",
                    "type": "web_url",
                    "url": "https://www.google.com",
                    "messenger_extensions": true,
                    "webview_height_ratio": "tall"
                    //"fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                  }
                ]
              },
              {
                "title": "Classic White T-Shirt",
                "subtitle": "See all our colors",
                "default_action": {
                  "type": "web_url",
                  "url": "https://www.google.com",
                  "messenger_extensions": false,
                  "webview_height_ratio": "tall"
                }
              },
              {
                "title": "Classic Blue T-Shirt",
                "image_url": "https://peterssendreceiveapp.ngrok.io/img/blue-t-shirt.png",
                "subtitle": "100% Cotton, 200% Comfortable",
                "default_action": {
                  "type": "web_url",
                  "url": "https://www.google.com",
                  "messenger_extensions": true,
                  "webview_height_ratio": "tall"
                  //"fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                },
                "buttons": [
                  {
                    "title": "Shop Now",
                    "type": "web_url",
                    "url": "https://www.google.com",
                    "messenger_extensions": true,
                    "webview_height_ratio": "tall",
                    //"fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                  }
                ]
              }
            ],
            "buttons": [
              {
                "title": "View More",
                "type": "postback",
                "payload": "payload"
              }
            ]
          }
        }
      }
    } else {
      // Create the payload for a basic text message
      response = {
        "text": `You sent the message: "${received_message.text}". Now send me an image!`
      }
    }
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}


function callSendAPI(sender_psid, response) {
  //just for kicks
  console.log("PAGE_ACCESS_TOKEN:" + PAGE_ACCESS_TOKEN);

  // Construct the message body
  let request_body = {
    "messaging_type": "RESPONSE",
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }

    console.log(res);
  });
}
