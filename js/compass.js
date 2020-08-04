import * as TWEEN from "../util/tween.min"; //动画操作
import * as MODEL from "./model"
var app = getApp();
/**
 * @description 打开罗盘，转动指南针
 * @paras that index里面的this，修改数据
 */
export function openCompass(that) {
    wx.startCompass({
        success: (res) => {
            // console.log(res)
        },
        fail: (res) => {
            console.log(res);
        },
    });
    let preAngle = 0;
    let cnt = 0;
    wx.onCompassChange((result) => {
        //direction:方向度数，0表示北 90表示东  accuracy：精度
        let curAngle = Math.round(result.direction);
        if (Math.abs(preAngle - curAngle) >= 20) {
            // console.log(preAngle,curAngle)
            that.setData({
                compassAngle: 45 - curAngle + "deg",
            });
            preAngle = curAngle;
            let radian = (curAngle / 360) * 2 * Math.PI;
            if (cnt > 0) {
                rotate(radian);
                app.me.radian = radian;

            } else {
                setTimeout(() => {
                    rotate(radian);
                    app.me.radian = radian;

                }, 2000);
                cnt=1;
            }
        }
    });
}
//旋转当前在地图上的朝向
function rotate(angle) {
    let me = app.me;
    // console.log(me);
    let a = new TWEEN.Tween(me.rotation).to({
        x: me.rotation.x,
        y: me.rotation.y,
        z: -angle,
    });
    a.start();
}
