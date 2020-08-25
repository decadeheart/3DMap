import * as MODEL from "../js/model";
import userControl from "./user";
const gps = {};
var app = getApp();
/**
 * @description 开启GPS
 */
gps.openGPS = function openGPS() {
    return new Promise((resolve, reject) => {
        wx.startLocationUpdate({
            success(res) {
                console.log("开启定位", res);
                let data = {
                    status: "success",
                };
                resolve(data);
            },
            fail(res) {
                console.log("开启定位失败", res);
            },
        });
    });
};
/**
 * @description 关闭GPS
 */
gps.closeGPS = function () {
    wx.stopLocationUpdate();
};
/**
 * @description 打开GPS，获取gps实时变化，修改当前在地图上的位置
 */
gps.getLocationChange = function () {
    gps.openGPS();

    wx.onLocationChange((res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        let [x, y] = getXY(longitude, latitude);
        userControl.changePosition(x, y, 0, "animation");
    });
};
/**
 * @description 获取当前的gps信息
 */
gps.getLocation = function () {
    return new Promise((resolve, reject) => {
        wx.getLocation({
            type: "gcj02",
            isHighAccuracy: true,
            highAccuracyExpireTime: 3000,
            success(res) {
                const latitude = res.latitude;
                const longitude = res.longitude;
                resolve(getXY(longitude, latitude));
            },
            fail() {
                reject("fail");
            },
            complete() {},
        });
    });
};

function dis2(nowLi, nowLi2) {
    //勾股定理
    let a = nowLi.x - nowLi2.x;
    let b = nowLi.y - nowLi2.y;
    if (isNaN(Math.sqrt(a * a + b * b))) {
    }
    return Math.sqrt(a * a + b * b);
}
//var scale=dis2(app.map.coor_p1, app.map.coor_p2) / dis2(app.map.bd_p1, app.map.bd_p2);
var scaleX = Math.abs(app.map.coor_p1.x - app.map.coor_p2.x) / Math.abs(app.map.bd_p1.x - app.map.bd_p2.x);
var scaleY = Math.abs(app.map.coor_p1.y - app.map.coor_p2.y) / Math.abs(app.map.bd_p1.y - app.map.bd_p2.y);

//火星坐标转百度坐标
function gcj02tobd09(lng, lat) {
    let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
    let z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_pi);
    let theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_pi);
    let bd_lng = z * Math.cos(theta) + 0.0065;
    let bd_lat = z * Math.sin(theta) + 0.006;

    return [bd_lng, bd_lat];
}
function getXY(marsLng, marsLat) {
    let [lng, lat] = gcj02tobd09(marsLng, marsLat);
    let x = app.map.coor_p1.x + (lng - app.map.bd_p1.x) * scaleX;
    let y = app.map.coor_p1.y + (lat - app.map.bd_p1.y) * scaleY;
    // if (Math.min(Math.abs(x - app.map.coor_p1.x), Math.abs(x - app.map.coor_p2.x)) > (app.map.coor_p2.x - app.map.coor_p1.x) * 1.5 ||
    // 	y > app.map.coor_p2.y + (app.map.coor_p2.y - app.map.coor_p1.y) * 1.5 || y < app.map.coor_p1.y - (app.map.coor_p2.y - app.map.coor_p1.y) * 1.5) {
    // 	return;
    // }
    return [x, y];
}
export default gps;
