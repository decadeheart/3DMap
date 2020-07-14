import tts from "../js/tts"
// tts("你好")
var app = getApp();
var main={};
main.tts=(text)=>{
	tts(text);
}
export default main;