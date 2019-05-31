const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://aglc.ca/cannabis/retail-cannabis/cannabis-licensee-search';
const fs = require("fs");
const filePath = "insert-statements.txt";
let fileData = "";

const info = []; // result of data scrape

rp(url)
    .then((html) => {
        $('tbody > tr', html).each((i, tRow) => {
            const tableData = tRow.children;
            const data = {
                region: 'AL',
                city: '',
                licenseeName: '',
                address: '',
                postalCode: '',
                phoneNumber: ''
            };

            tableData.forEach((elem, index) => {
                if(elem.name === 'td') {
                    cellData = elem.children[0].data;
                    switch(index) {
                        case 1:
                            data.city = cellData;
                            break;
                        case 3:
                            data.licenseeName = cellData;
                            break;
                        case 5:
                            data.address = cellData;
                            break;
                        case 7:
                            data.postalCode = cellData;
                            break;
                        case 9:
                            data.phoneNumber = cellData;
                            info.push(data); // phone number is the last piece of info for the licensee
                            fileData += `  ('${data.licenseeName.replace('\'','\'\'')}', '${data.region}', '${data.phoneNumber}', '${data.postalCode}', '${data.city}', '${data.address}', '${data.address}, ${data.city}, ${data.region} ${data.postalCode}'),\n`; // insert value statement with newline
                            break;
                        default:
                            break;
                    }
                }
            });
        });
        console.log(info);
        fileData = fileData.substring(0, fileData.length - 2) + ";";
        fs.appendFile(filePath, fileData, (err) => { // appendFile so it doesn't override txt
          if (err) throw err;
          console.log('The file has been saved!');
        });
    })
    .catch((err) => {
        //handle error
        console.log(err);
    });
