const Amadeus = require('amadeus');
require('dotenv').config();

const amadeus = new Amadeus({
 clientId: process.env.AMADEUS_API_KEY,
 clientSecret: process.env.AMADEUS_API_SECRET,
});

async function get_flights(origin, destination, departureDate) {
 try {
  const response = await amadeus.shopping.flightOffersSearch.get({
   originLocationCode: origin,
   destinationLocationCode: destination,
   departureDate: departureDate,
   adults: '1',
  });
  return response.data;
 } catch (error) {
  console.error('Error searching flights:', error);
  throw error;
 }
}

module.exports = { get_flights };
