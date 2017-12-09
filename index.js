const Alexa = require('alexa-sdk'); // Alexa SDKの読み込み
const IRKit = require('./irkit.js');
const languageStrings = {
  'ja-JP': {
    'translation': {
      'ASK_FIRST_ACTION': '何をしましょうか？',
      'ASK_NEXT_ACTION': '次に何をしますか？',
      'END_MESSAGE': 'リモコンを終了します。'
    }
  }
};

exports.handler = function(event, context, callback) {

    let alexa = Alexa.handler(event, context);

    // Alexa SDKの処理
    alexa.appId = process.env.APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers, nextHandlers);
    alexa.execute();

};

// ハンドラの定義
let handlers = {
    'LaunchRequest': function () {
        this.handler.state = '_NEXT';
        this.emit(':ask', this.t('ASK_FIRST_ACTION'));
    },
    'AMAZON.CancelIntent': function () {},
    'AMAZON.HelpIntent': function () {},
    'SessionEndedRequest ': function () {}
};

let nextHandlers = Alexa.CreateStateHandler('_NEXT', {
    'TVPowerSwitch': function () {
        let that = this;
        IRKit.request(IRKit.INFRARED_DATA.TV.POWER, function() {
            that.emit(':ask', '電源を切り替えました。' + that.t('ASK_NEXT_ACTION'));
        });
    },
    'TVChannelChange': function () {
        let that = this;
        let channel = that.event.request.intent.slots.TVChannel.value;
        let channelInfraredData = IRKit.INFRARED_DATA.TV.CHANNEL.getInfraredData(channel);
        if (channelInfraredData == '') {
            that.emit(':ask', '該当するチャンネルがありませんでした。' + that.t('ASK_NEXT_ACTION'));
        }
        IRKit.request(channelInfraredData, function() {
            that.emit(':ask', 'チャンネルを' + channel + 'に変えました。' + that.t('ASK_NEXT_ACTION'));
        });
    },
    'TVVolumeChange': function () {
        let that = this;
        let resolutions = that.event.request.intent.slots.VolumeCommand.resolutions;
        let resolution = (resolutions && resolutions.resolutionsPerAuthority && resolutions.resolutionsPerAuthority.length > 0) ? resolutions.resolutionsPerAuthority[0] : null;
        let command;
        if (resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
            let resolutionValue = resolution.values[0].value;
            command = resolutionValue.id;
        }
        let infraredData = IRKit.INFRARED_DATA.TV.VOLUME.getInfraredData(command);
        if (infraredData == '') {
            that.emit(':ask', '力及ばず。' + that.t('ASK_NEXT_ACTION'));
        }
        IRKit.request(infraredData, function() {
            let response = '音量を変えました。';
            if (command === 'TV_CHANGE_VOLUME_UP') {
                response = '音量を上げました。';
            } else if (command === 'TV_CHANGE_VOLUME_DOWN') {
                response = '音量を下げました。';
            }
            that.emit(':ask', response + that.t('ASK_NEXT_ACTION'));
        });
    },
    'ACPowerOff': function () {
        let that = this;
        IRKit.request(IRKit.INFRARED_DATA.AIR_CONDITIONER.POWER_OFF, function() {
            that.emit(':ask', 'エアコンの電源を切りました。' + that.t('ASK_NEXT_ACTION'));
        });
    },
    'ACHeatingOn': function () {
        let that = this;
        IRKit.request(IRKit.INFRARED_DATA.AIR_CONDITIONER.HEATING_ON, function() {
            that.emit(':ask', '暖房をつけました。' + that.t('ASK_NEXT_ACTION'));
        });
    },
    'HMDPowerSwitch': function () {
        let that = this;
        IRKit.request(IRKit.INFRARED_DATA.HUMIDIFIER.POWER, function() {
            that.emit(':ask', '加湿器の電源を切り替えました。' + that.t('ASK_NEXT_ACTION'));
        });
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('END_MESSAGE'));
        this.context.done(null, 'success');
    },
    'Unhandled': function () {
        this.emit(':ask', '力及ばず。' + this.t('ASK_NEXT_ACTION'));
    }
});

