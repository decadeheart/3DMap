import * as MODEL from "../js/model";

var that;
let curDegree = 0;
let targetDegree = 0;
export function openCompass(thatTmp) {
	wx.startCompass({
		success: (res) => {
			console.log(res)
		},
	})
	that=thatTmp;
	
	
	wx.onCompassChange((result) => {
		//direction:方向度数，0表示北方 90表示东  accuracy：精度
		let curAngle = result.direction;
		rotate(curAngle);
		// MODEL.rotate(0,0,angle)
	})
}

function rotate(degree) {
	if (Math.abs(curDegree - degree) > 10) {
		let acc = 5;
		let gap = degree - curDegree;

		if (gap > 0) {
			let delta = gap / acc;
			//alert(delta);
			if (delta > 0.05) {
				rotateTo(curDegree + delta);
				rotate(degree);
			} else rotateTo(degree);
		}
		if (gap < 0) {
			let delta = gap / acc;
			//alert(delta);
			if (delta < (-0.05)) {
				rotateTo(curDegree + delta);
				rotate(degree);
			} else rotateTo(degree);
		}
	}
}

function rotateTo(degree) {
	curDegree = degree;   
	console.log(degree)
	that.setData({
		compassAngle: degree + "deg"
	})
}