const { Anthropic } = require('@anthropic-ai/sdk');
const { generateItinerary } = require('../lib/itinerary');
require('dotenv').config();

const anthropic = new Anthropic({
 apiKey: process.env.ANTHROPIC_API_KEY,
});

const currentYear = new Date().getFullYear();

async function handleUserRequest(message) {
 const extractionPrompt = `
    Extract the following information from the user's message. The current year is ${currentYear}, if dates are proided without a year, use the current year above. You can also extrapolate from the current year eg: next year will be the year after current year. If any information is missing, respond with "MISSING" for that field:
    1. Current location IATA code
    2. Destination location IATA code
    3. Departure date in (YYYY-MM-DD).
    4. Return date in (YYYY-MM-DD).

    User message: "${message}"

    Response format:
    Current location: [extracted location or MISSING]
    Destination: [extracted destination or MISSING]
    Departure date: [extracted departure date or MISSING]
    Return date: [extracted return date or MISSING]
  `;

 const extractionResponse = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307',
  max_tokens: 1024,
  temperature: 0.5,
  messages: [{ role: 'user', content: extractionPrompt }],
 });

 const extractedText = extractionResponse.content[0].text;
 const extractedLines = extractedText
  .split('\n')
  .filter((line) => line.includes(':'));

 const extractedInfo = extractedLines.reduce((acc, line) => {
  const [key, value] = line.split(':').map((part) => part.trim());
  acc[key.toLowerCase()] = value;
  return acc;
 }, {});

 if (
  extractedInfo['current location'] === 'MISSING' ||
  extractedInfo['destination'] === 'MISSING' ||
  extractedInfo['departure date'] === 'MISSING' ||
  extractedInfo['return date'] === 'MISSING'
 ) {
  // If any information is missing, ask the user for it
  const missingInfoPrompt = `Some information is missing from your request. Please provide:
      ${
       extractedInfo['current location'] === 'MISSING'
        ? '- Your current location\n'
        : ''
      }
      ${
       extractedInfo['destination'] === 'MISSING' ? '- Your destination\n' : ''
      }
      ${
       extractedInfo['departure date'] === 'MISSING'
        ? '- Your departure date\n'
        : ''
      }
      ${
       extractedInfo['return date'] === 'MISSING' ? '- Your return dates\n' : ''
      }
      `;

  return missingInfoPrompt;
 }

 const itinerary = await generateItinerary(
  extractedInfo['current location'],
  extractedInfo['destination'],
  extractedInfo['departure date'],
  extractedInfo['return date']
 );
 return itinerary;
}

module.exports = { handleUserRequest };
