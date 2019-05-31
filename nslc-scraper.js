const rp = require('request-promise');
const $ = require('cheerio');
const {split, Syntax} = require('sentence-splitter');
const url = 'https://www.mynslc.com/en/CannabisInfo/Cannabis-Info';
const fs = require("fs");
const filePath = "insert-statements.txt";
let fileData = "";

const info = []; // result of data scrape

rp(url)
    .then((html) => {
        $('div[class=Layout-main] > div > p', html).each((i, pTag) => {
            if(i == 7) {// this is the paragrah of text that contains where recreational cannabis can be purchased
                const text = pTag.children[0].data;
                let sentence = split(text)[2].raw.split(', '); // raw text of sentence containing locations
                for(let i = 0; i < sentence.length; i++) { // skipped first word because I'm looking for capital letters to identify location names
                if(sentence[i].charAt(0) == sentence[i].charAt(0).toUpperCase()) { // Checking for first letter capitalized
                        if(i == 0) {
                            const leadingStr = sentence[0];
                            const splitLeadingStr = leadingStr.split('');
                            for(let j = 1; j < splitLeadingStr.length; j++) { // looking for capital letter to remove the leading text; skipped first letter because it's capitalized
                                if(splitLeadingStr[j].match(/[A-Z]/) != null) {
                                    let subStr = leadingStr.slice(j);
                                    info.push(subStr);
                                    j = splitLeadingStr.length; // only the first capital letter is necessary since the following ones will be the same location
                                    const city = subStr.substring(0, subStr.indexOf(' '));
                                    fileData += `  ('NSLC', 'NS', '', '', '${city}', '', ''),\n`;
                                }
                            }
                        } else {
                            info.push(sentence[i]);
                            const location = sentence[i]; // splitting up the location string to make use for AND scenarios as well as streetName scenarios
                            const andIndex = location.indexOf(' and ');
                            const inIndex = location.indexOf(' in ');
                            const city = location.substring(inIndex + 4, location.length);
                            if (location.includes(' in ') && location.includes(' and ')) {
                              const address1 = location.substring(0, andIndex);
                              const address2 = location.substring(andIndex + 5, inIndex);
                              fileData += `  ('NSLC', 'NS', '', '', '${city}', '${address1}', ''),\n`;
                              fileData += `  ('NSLC', 'NS', '', '', '${city}', '${address2}', ''),\n`;
                            }
                            else if (location.includes(' in ')) {
                              const address = location.substring(0, inIndex);
                              if (address.includes('St')) {
                                fileData += `  ('NSLC', 'NS', '', '', '${city}', '${address}', ''),\n`;
                              }
                              else {
                                fileData += `  ('NSLC', 'NS', '', '', '${city}', '', ''),\n`;
                              }
                            }
                            else if (location.includes(' and ')) {
                              const city1 = location.substring(0, andIndex);
                              const city2 = location.substring(andIndex + 5, location.length - 1);
                              fileData += `  ('NSLC', 'NS', '', '', '${city1}', '', ''),\n`;
                              fileData += `  ('NSLC', 'NS', '', '', '${city2}', '', ''),\n`;
                            }
                            else {
                              fileData += `  ('NSLC', 'NS', '', '', '${location}', '', ''),\n`;
                            }
                        }
                }
                }
            }
        });
        fs.appendFile(filePath, fileData, (err) => { // appendFile so it doesn't override txt
          if (err) throw err;
          console.log("The file has been saved!");
        });
        console.log(info);
    })
    .catch((err) => {
        //handle error
        console.log(err);
    });
