var Sentiment = require('sentiment');
var sentiment = new Sentiment();
var result = sentiment.analyze("Cats are not amazing.");
console.log('sentiment',result);

var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
  application_id: "6e819ed4",
  application_key: "dd23f9f366cddf1577a1965be0154f6b"
});
textapi.sentiment({
  'text': 'Cats are not amazing.'
}, function(error, response) {
  if (error === null) {
    console.log('alyien',response);
  }
  // console.log('error', error);
});
