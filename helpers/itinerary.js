const { Anthropic } = require('@anthropic-ai/sdk');
const { get_flights } = require('../lib/flights');
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

 console.log('Conversation:', conversation);

 const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620',
  max_tokens: 1024,
  temperature: 0.7,
  messages: conversation,
  tools: [flightSearchTool],
 });

 const toolCalls = response.content[1].input;
 console.log('Tool Calls:', toolCalls);
 const flights = await get_flights(
  toolCalls.origin,
  toolCalls.destination,
  toolCalls.departureDate,
  toolCalls.returnDate
 );

 console.log('Flights:', flights);

 const finalResponse = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
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
     flights
    )}. Please format this information in a user-friendly way.`,
   },
  ],
 });

 return finalResponse.content[0].text;
}

module.exports = { generateItinerary };
