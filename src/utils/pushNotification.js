const axios = require('axios');
const {Expo} = require('expo-server-sdk')
const expo = new Expo()
// async function sendPushNotification(expoPushToken, title, body, data) {
//   const message = {
//     to: expoPushToken,
//     sound: 'default',
//     title: title,
//     body: body,
//     data: data,
//   };

//   try {
//     await axios.post('https://exp.host/--/api/v2/push/send', message, {
//       headers: {
//         Accept: 'application/json',
//         'Accept-Encoding': 'gzip, deflate',
//         'Content-Type': 'application/json',
//       },
//     });
//     console.log('Notification sent successfully');
//   } catch (error) {
//     console.error('Error sending notification', error);
//   }
// }

async function sendPushNotification(token, title, body, data) {
  let messages = [];

  // Check that the push token is valid
  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid Expo push token`);
    return;
  }

  // Construct a message with an image attachment
  messages.push({
    to: token,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  });

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Inspect the tickets to check for errors
  tickets.forEach(ticket => {
    if (ticket.status === 'error') {
      console.error(`Error in ticket: ${ticket.message}`);
      if (ticket.details && ticket.details.error) {
        console.error(`Error details: ${ticket.details.error}`);
      }
    }
  });
}

module.exports = sendPushNotification;
