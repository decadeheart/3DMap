//语音合成
/*
配额说明
由于资源限制，当前各个接口调用存在配额限制，如业务有特殊更多需求，请邮箱联系roytianzou@tencent.com申请，邮件配额模版如下。 语音输入配额：每个小程序250条/分钟，3w条/天。 文本翻译配额：每个小程序500次/分钟，10w次/天。 语音合成配额：每个小程序100次/分钟，2w次/天
*/
var plugin = requirePlugin("WechatSI")

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
				// console.log("succ tts", res.filename)
				// audioSrc = res.filename
				resolve(res.filename);
			},
			fail: function (res) {
				console.log("fail tts", res)
			}
		})

	})
}

/**
 * @description 播放语音
 */
 async function tts(text) {
	const innerAudioContext = wx.createInnerAudioContext()
	wx.setInnerAudioOption({
		obeyMuteSwitch: false
	})
	innerAudioContext.playbackRate = 2;
	innerAudioContext.autoplay = true;
	innerAudioContext.src = encodeURI( await getAudioSrc(text))
	innerAudioContext.onPlay(() => {
		console.log('开始播放')
	})
	innerAudioContext.onError((res) => {
		console.log(res.errMsg)
		console.log(res.errCode)
	})
	// for (let i = 0; i < text.length; i++) {
	// 	const innerAudioContext = wx.createInnerAudioContext()
	// 	innerAudioContext.autoplay = true
	// 	innerAudioContext.src = await getAudioSrc(text[i])
	// 	innerAudioContext.onPlay(() => {
	// 		console.log('开始播放')
	// 	})
	// 	innerAudioContext.onError((res) => {
	// 		console.log(res.errMsg)
	// 		console.log(res.errCode)
	// 	})
	// }
}
export default tts