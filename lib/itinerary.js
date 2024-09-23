const { Anthropic } = require('@anthropic-ai/sdk');
const { get_flights } = require('../helpers/flights');
require('dotenv').config();

const anthropic = new Anthropic({
 apiKey: process.env.ANTHROPIC_API_KEY,
});

const flightSearchTool = {
 name: 'get_flights',
 description: 'Search for flights based on origin, destination, and dates',
 input_schema: {
  type: 'object',
  properties: {
   origin: { type: 'string' },
   destination: { type: 'string' },
   departureDate: { type: 'string' },
   returnDate: { type: 'string' },
  },
  required: ['origin', 'destination', 'departureDate', 'returnDate'],
 },
};

async function generateItinerary(
 currentLocation,
 destinationLocation,
 departureDate,
 returnDate
) {
 const conversation = [
  {
   role: 'user',
   content: `Compile a flight list for ${currentLocation} to ${destinationLocation} from ${departureDate} to ${returnDate}.`,
  },
 ];

 const response = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307',
  max_tokens: 1024,
  temperature: 0.7,
  messages: conversation,
  tools: [flightSearchTool],
 });

 const toolCalls = response.content[1].input;
 const flights = await get_flights(
  toolCalls.origin,
  toolCalls.destination,
  toolCalls.departureDate,
  toolCalls.returnDate
 );

 const finalResponse = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307',
  max_tokens: 1000,
  messages: [
   {
    role: 'user',
    content: `Compile a flight list for ${currentLocation} to ${destinationLocation} from ${departureDate} to ${returnDate}.`,
   },
   { role: 'assistant', content: response.content[0].text },
   {
    role: 'user',
    content: `Here are the flight results: ${JSON.stringify(
     flights.slice(0, 5)
    )}. PS: Format this information in a user-friendly way and not more than 1600 characters for WhatsApp. Also do not include this part in the response`,
   },
  ],
 });

 return finalResponse.content[0].text;
}

module.exports = { generateItinerary };
