const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
 process.env.TWILIO_ACCOUNT_SID,
 process.env.TWILIO_AUTH_TOKEN
);

async function sendWhatsAppMessage(to, message) {
 try {
  await client.messages.create({
   body: message,
   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
   to: `${to}`,
  });
 } catch (error) {
  console.error('Error sending message:', error);
 }
}

module.exports = { sendWhatsAppMessage };
