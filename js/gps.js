import * as MODEL from "../js/model";
const gps = {};
var app = getApp();
/**
 * @description 开启GPS
 */
gps.openGPS = function openGPS() {
	return new Promise((resolve, reject) => {
		wx.startLocationUpdate({
			success(res) {
				console.log('开启定位', res)
				let data = {
					status: "success"
				}
				resolve(data)

			},
			fail(res) {
				console.log('开启定位失败', res)
			}
		})
	})

}
/**
 * @description 关闭GPS
 */
gps.closeGPS = function () {
	wx.stopLocationUpdate();
}
/**
 * @description 获取gps实时变化
 */
gps.getLocationChange = function () {
	gps.openGPS();
	var x=[48,51,56,61,61,61];
	var y=[-68,-68,-68,63,-58,-55];
	var i=0;
	var p=setInterval(()=>{
		i++;
		MODEL.addUser(x[i],y[i],0);
		console.log(x[i],y[i])
		if(i>=5) clearInterval(p)
	},2000)
	
	wx.onLocationChange(res => {
		const latitude = res.latitude;
		const longitude = res.longitude;
		let x = app.map_conf.coor_p1.x + (longitude - app.map_conf.gcj02_p1.x) * app.localization.outsideScale;
		let y = app.map_conf.coor_p1.y + (latitude - app.map_conf.gcj02_p1.y) * app.localization.outsideScale;
		if (Math.min(Math.abs(x - app.map_conf.coor_p1.x), Math.abs(x - app.map_conf.coor_p2.x)) > (app.map_conf.coor_p2.x - app.map_conf.coor_p1.x) * 1.5 ||
			y > app.map_conf.coor_p2.y + (app.map_conf.coor_p2.y - app.map_conf.coor_p1.y) * 1.5 || y < app.map_conf.coor_p1.y - (app.map_conf.coor_p2.y - app.map_conf.coor_p1.y) * 1.5) {
			return;
		}
		
		
	});
}
/**
 * @description 获取当前的gps信息
 */
gps.getLocation = function () {
	return new Promise((resolve, reject) => {
		wx.getLocation({
			type: 'gcj02',
			isHighAccuracy: true,
			highAccuracyExpireTime: 3000,
			success(res) {
				const latitude = res.latitude
				const longitude = res.longitude
				let x = app.map_conf.coor_p1.x + (longitude - app.map_conf.gcj02_p1.x) * app.localization.outsideScale;
				let y = app.map_conf.coor_p1.y + (latitude - app.map_conf.gcj02_p1.y) * app.localization.outsideScale;
				if (Math.min(Math.abs(x - app.map_conf.coor_p1.x), Math.abs(x - app.map_conf.coor_p2.x)) > (app.map_conf.coor_p2.x - app.map_conf.coor_p1.x) * 1.5 ||
					y > app.map_conf.coor_p2.y + (app.map_conf.coor_p2.y - app.map_conf.coor_p1.y) * 1.5 || y < app.map_conf.coor_p1.y - (app.map_conf.coor_p2.y - app.map_conf.coor_p1.y) * 1.5) {
					return;
				}
				// app.localization.getGPS(x, y);
				console.log(x, y)
				resolve([x,y]);
			},
			fail() {
				reject("fail")
			},
			complete() {

			}
		})
	})
}
export default gps;