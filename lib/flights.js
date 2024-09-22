const axios = require('axios');

async function get_flights(origin, destination, depatureDate, returnDate) {
 // This is a mock implementation. In a real scenario, you'd use an actual flight API.
 return [
    {
      airline: 'MockAir',
      flightNumber: 'MA123',
      departureTime: '10:00 AM',
      arrivalTime: '12:00 PM',
      price: 299.99,
    },
    {
      airline: 'FakeJet',
      flightNumber: 'FJ456',
      departureTime: '2:00 PM',
      arrivalTime: '4:00 PM',
      price: 349.99,
    },
  ];
}

module.exports = { get_flights };
