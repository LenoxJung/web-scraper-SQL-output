const fs = require('fs');

fs.writeFile('insert-statements.txt', "INSERT INTO Locations\n  (name, region, phoneNumber, postalCode, cityName, streetName, address)\nVALUES\n", (err) => { // writeFile so the txt is replaced with insert statement everytime this script is run
  if (err) throw err;
  require('./aglc-scraper.js');
  require('./agco-scraper.js');
  require('./nslc-scraper.js');
});
