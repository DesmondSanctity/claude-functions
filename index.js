const express = require('express');
const bodyParser = require('body-parser');
const messageService = require('./lib/messaging');
const { handleUserRequest } = require('./helpers/request');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Webhook route for incoming WhatsApp messages
app.post('/itinerary', async (req, res) => {
 const incomingMsg = req.body.Body;
 const from = req.body.From;

 try {
  // Send immediate acknowledgment
  await messageService.sendWhatsAppMessage(
   from,
   "We're generating your itinerary. This may take a few moments."
  );

  // Generate the itinerary
  const itinerary = await handleUserRequest(incomingMsg);

  // Send the itinerary via WhatsApp
  await messageService.sendWhatsAppMessage(from, itinerary);

  res
   .status(200)
   .json({ message: 'Itinerary generated and sent successfully', itinerary });
 } catch (error) {
  console.error('Error processing request:', error);
  res.status(500).json({ error: 'Internal Server Error' });
 }
});

// Start the server
app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});
