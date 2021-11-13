let request = require('request-promise');
let { writeFile } = require('fs');
let { join } = require('path');
let blend = require('@mapbox/blend');
let argv = require('minimist')(process.argv.slice(2));

const getUrl = (text, width, height, color, size) => {
    return {
        url: `https://cataas.com/cat/says/${text}?width=${width}&height=${height}&color${color}&s=${size}`,
        encoding: 'binary',
        resolveWithFullResponse: true
    }
}

const sendRequest = async (url) => {
    return await request.get(url)
        .then(response => {
            console.log('Received response with status: ' + response.statusCode);
            return response.body;
        })
        .catch(err => {
            console.log(err);
        });
}

// Save File
const saveFile = (fileOut, data) => {
    writeFile(fileOut, data, 'binary', (err) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log("The file was saved!");
    });
}

// Blend Images
const blendImages = (widthPer, height, ...images) => {
    const blendData = [];
    for (let i = 0; i < images.length; i++) {
        blendData.push({
            buffer: new Buffer(images[i], 'binary'),
            x: widthPer * i,
            y:0,
        })
    }
    blend(blendData, {
        width: widthPer * images.length,
        height: height,
        format: 'jpeg',
    }, (err, data) => {
        const fileOut = join(process.cwd(), `/cat-card.jpg`);
        saveFile(fileOut, data)
    });
}

let { greeting = 'Hello', who = 'You', width = 400, height = 500, color = 'Pink', size = 100 } = argv;

let firstUrl = getUrl(greeting, width, height, color, size);
let secondUrl = getUrl(who, width, height, color, size);

(async () => {
    const firstBody = await sendRequest(firstUrl);
    const secondBody = await sendRequest(secondUrl);
    blendImages(width, height, firstBody, secondBody);
})()
