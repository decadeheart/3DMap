//语音合成
/*
配额说明
由于资源限制，当前各个接口调用存在配额限制，如业务有特殊更多需求，请邮箱联系roytianzou@tencent.com申请，邮件配额模版如下。 语音输入配额：每个小程序250条/分钟，3w条/天。 文本翻译配额：每个小程序500次/分钟，10w次/天。 语音合成配额：每个小程序100次/分钟，2w次/天
*/

// 百度接口 总量一亿次，并发数100人  https://cloud.baidu.com/doc/SPEECH/s/yk38y8h3j 每30天需要换token

var plugin = requirePlugin("WechatSI");
var app=getApp();
const token = app.ttsToken;//"24.c11dfd63fd7f4e256785ebc3416b1a7c.2592000.1604025349.282335-17687672";

/**
 * @description 将文本转成语音
 * @param {*} text 文本
 * @returns 语音MP3的url res.filename
 */
var getAudioSrc = (text) => {
    return new Promise((resolve, reject) => {
        let audioSrc = "";
        plugin.textToSpeech({
            lang: "zh_CN",
            tts: true,
            content: text,
            success: function (res) {
                resolve(res.filename);
            },
            fail: function (res) {
                console.log("fail tts", res);
            },
        });
    });
};
/**
 * @description 播放语音
 * @paras {text} 文字
 */
async function tts(text) {
    const innerAudioContext = wx.createInnerAudioContext();
    wx.setInnerAudioOption({
        obeyMuteSwitch: false,
    });
    innerAudioContext.autoplay = true;

    
    innerAudioContext.src = encodeURI(await getAudioSrc(text));

    // innerAudioContext.src = encodeURI("https://tsn.baidu.com/text2audio?lan=zh&ctp=1&cuid=abcdxxx&tok=" +token +"&tex=" +text +"&vol=9&per=0&spd=5&pit=5&aue=3");
    // console.log(innerAudioContext.src);

    innerAudioContext.onPlay(() => {});
    innerAudioContext.onError((res) => {
        console.log(res.errMsg);
        console.log(res.errCode);
    });
}
export default tts;
