const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://www.agco.ca/status-current-cannabis-retail-store-applications';
const fs = require("fs");
const filePath = "insert-statements.txt";
let fileData = "";


const info = []; // result of data scrape

rp(url)
    .then((html) => {
        $('tbody > tr', html).each((i, tRow) => {
            const tableData = tRow.children;
            const data = {
                region: 'ON',
                storeName: '',
                operatorName: '',
                municipality: '',
                storeAddress: '',
                licenseStatus: '',
                authorizationStatus: ''
            };

            tableData.forEach((elem, index) => {
                if(elem.name === 'td') {
                    cellData = elem.children[0].data;
                    switch(index) {
                        case 0: // store name
                            if(cellData === '\n') { // a few of the store names are in p tags within the td
                                data.storeName = elem.children[1].children[0].data;
                                if(elem.children[3]) {
                                    data.storeName += ' ' + elem.children[3].children[0].data; // name is split into 2 p tags
                                } else if(elem.children[1].children && elem.children[1].children[1]) { // I'm not sure how else to differentiate this case
                                    data.storeName += elem.children[1].children[1].children[0].data + elem.children[1].children[2].data; // &is in a span, the rest is in text on either side of the span
                                }
                            } else if (elem.children[0].children && elem.children[1]) {
                                data.storeName = elem.children[0].children[0].data + elem.children[1].data
                            } else {
                                data.storeName = cellData;
                            }
                            break;
                        case 2: // operator name
                            if(elem.children[3]) {
                                data.operatorName = elem.children[1].children[0].data + ' ' + elem.children[3].children[0].data; // first and last name in 2 different p tags inside td
                            } else if (elem.children[0].children) {
                                data.operatorName = elem.children[0].children[0].data + elem.children[1].data; // CGS is in a span, while 'Foods Inc.' is in plain text
                            } else if (elem.children[1] && elem.children[1].children) {
                                data.operatorName = elem.children[1].children[0].data; // text inside of p inside of td
                            } else {
                                data.operatorName = cellData;
                            }
                            break;
                        case 4: //municipality
                            data.municipality = cellData;
                            break;
                        case 6: // store address
                        if(cellData === '\n') { // a few of the store addresses are in p tags within the tr
                            data.storeAddress = elem.children[1].children[0].data;
                        } else {
                            data.storeAddress = cellData;
                        }
                            break;
                        case 8: // license status
                            if(cellData === '\n') {
                                if(elem.children[1].children[0].children) {
                                    data.licenseStatus = elem.children[1].children[0].children[0].data; // text inside strong inside of p inside of td
                                }
                                else {
                                    data.licenseStatus = elem.children[1].children[0].data; // text inside p inside td
                                }
                            } else if(!cellData){
                                if(elem.children[0].children) {
                                    data.licenseStatus = elem.children[0].children[0].data; // text inside of strong inside of td
                                }
                            } else {
                                data.licenseStatus = cellData; // text inside of td
                            }
                            break;
                        case 10: // authorization status
                            if(cellData === '\n') { // a few of the store names are in p tags within the tr
                                if(elem.children[3]) {
                                    data.authorizationStatus = elem.children[1].children[0].data + ' ' + elem.children[3].children[0].data; // Public notice with dates is in 2 separate p tags
                                    console.log(elem.children[1].children[0].data + ' ' + elem.children[3].children[0].data)
                                } else {
                                    data.authorizationStatus = elem.children[1].children[0].data; // public notice period ended in a p tag
                                }
                            } else {
                                if(elem.children[0].children) {
                                    data.authorizationStatus = elem.children[0].children[0].data; // text inside of strong inside of td
                                } else {
                                    data.authorizationStatus = cellData;
                                }
                            }
                            info.push(data); // authorization status is the last piece of info for the licensee
                            fileData += `  ('${data.storeName.replace('\'','\'\'')}', '${data.region}', '', '', '${data.municipality}', '${data.storeAddress}', ''),\n`; // insert value statement with newline
                            break;
                        default:
                            break;
                    }
                }
            });
        });
        console.log(info);
        fs.appendFile(filePath, fileData, (err) => { // appendFile so it doesn't override txt
          if (err) throw err;
          console.log("The file has been saved!");
        });
    })
    .catch((err) => {
        //handle error
        console.log(err);
    });
