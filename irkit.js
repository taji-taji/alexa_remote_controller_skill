const request = require('request');
const fs = require('fs');
const infrared = JSON.parse(fs.readFileSync('./infrared.json', 'utf8'));

exports.request = function(message, callback) {
    let headers = {
        'Content-Type': 'application/json'
    };
    let options = {
        url: 'https://api.getirkit.com/1/messages',
        method: 'POST',
        headers: headers,
        json: false,
        form: {
            "deviceid": process.env.DEVICE_ID,
            "clientkey": process.env.CLIENT_KEY,
            "message": message
        }
    };
    //リクエスト送信
    request(options, function (error, response, body) {
        callback();
    });
};

exports.INFRARED_DATA = Object.freeze({
    TV: Object.freeze({
        // power
        POWER: infrared.TV.POWER,
        // channel
        CHANNEL: Object.freeze({
            getInfraredData: function(channel) {
                try {
                    return eval("infrared.TV.CHANNEL._" + channel);
                } catch(e) {
                    console.log(e);
                    return "";
                }
            },
        }),
        // volume
        VOLUME: Object.freeze({
            getInfraredData: function(command) {
                let type = "";
                if (command === 'TV_CHANGE_VOLUME_UP') {
                    type = 'UP';
                } else if (command === 'TV_CHANGE_VOLUME_DOWN') {
                    type = 'DOWN'
                }
                try {
                    return eval("infrared.TV.VOLUME." + type);
                } catch(e) {
                    console.log(e);
                    return "";
                }
            }
        })
    }),
    AIR_CONDITIONER: Object.freeze({
        POWER_OFF: infrared.AIR_CONDITIONER.POWER_OFF,
        HEATING_ON: infrared.AIR_CONDITIONER.HEATING_ON
    }),
    HUMIDIFIER: Object.freeze({
        POWER: infrared.HUMIDIFIER.POWER
    })
});
