# Web-scraper modified to output SQL insert statements
# Instructions
npm install

node scraper-runner.js to run all three web-scrapers to write onto same txt

set up database

CREATE TABLE Locations (
  locationId SERIAL PRIMARY key,
  name text,
  region text,
  description text,
  locationLat text,
  locationLong text,
  phoneNumber text,
  website text,
  postalCode text,
  cityName text,
  streetName text,
  address text,
  hoursMon text,
  hoursTue text,
  hoursWed text,
  hoursThur text,
  hoursFri text,
  hoursSat text,
  hoursSun text  
);

copy and paste contents of insert-statements.txt and run to format table

then view table:
SELECT name, region, phoneNumber, postalCode, cityName, streetName, address FROM Locations;
