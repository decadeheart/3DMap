import * as util from "../util/util";

var blueConfig = {
    blueConfig: [],
    maxBufferLength: 8,/**/
    minValidRssi: -90,
    beaconInfo: [],
};
//算法中k j 权重调整
var kScale=0.1;
var jScale=20;
var app = getApp();
/**
 * @description 监听ibeacon更新状态
 * @date 2020-07-13
 */
function beaconUpdate() {
    wx.onBeaconUpdate((res) => {
        app.isBeaconGot = true;
        let data = [];
        if (!res.beacons.length) return;
        for (let i = 0; i < res.beacons.length; i++) {
            if (res.beacons[i].rssi !== 0) {
                //将搜索到的蓝牙信号和数据库中蓝牙信号比对匹配
                let temp = matchRecord(res.beacons[i]);
                if (temp != null && data.length < 6) {
                    data.push(temp);
                }
            }
        }

        if (blueConfig.beaconInfo.length >= blueConfig.maxBufferLength) {
            //移除第一个元素,beaconInfo是一个缓冲区，每次读第一个，放入新的元素到最后，满的时候删除第一个
            blueConfig.beaconInfo.shift();
        }

        //根据信号强度来排序
        blueConfig.beaconInfo.push(
            //data就是蓝牙信标数组
            data.sort(function (num1, num2) {
                return parseFloat(num2.rssi) - parseFloat(num1.rssi);
            })
        );

        let result = getMaxPossiblePoint();
        if (!result) {
            app.localization.getBlue(1, 1, 1, 1);
            return;
        }
        //minValidRssi表示最小有效的信号强度，小于这个强度的信号可以忽视
        if (parseInt(result.rssi) < parseInt(blueConfig.minValidRssi)) {
            return;
        }

        //获得有效的蓝牙位置，就可以定位移动图标
        app.localization.getBlue(result.x, result.y, result.z, result.floor);
    });
}
/**
 * @description 和列表中的蓝牙进行比对
 * @date 2020-07-14
 * @param {*} obj
 * @returns
 */
function matchRecord(obj) {
    for (let i = 0; i < app.beaconCoordinate.length; i++) {
        if (obj.major == app.beaconCoordinate[i].major && obj.minor == app.beaconCoordinate[i].minor) {
            //rssi表示设备的信号强度
            let beaCor = {
                rssi: obj.rssi,
            };
            let ret = util.extendObj(beaCor, app.beaconCoordinate[i]);

            return ret;
        }
    }
    return null;
}

/**
 * @description 得到强度最大的点
 * @date 2020-07-14
 * @returns
 */
function getMaxPossiblePoint() {
    let temp = [];

    //每次都是选择缓冲区的最前端来得到最大点，一个beaconInfo中有多组搜索到的蓝牙信标数组
    let buffer = blueConfig.beaconInfo.slice(0);
    for (let k = 0; k < buffer.length; k++) {
        let list = buffer[k];
        for (let j = 0; j < list.length; j++) {
            let i = 0;

            for (i; i < temp.length; i++) {
                if (temp[i].major === list[j].major && temp[i].minor === list[j].minor) {
                    //算法获得每一个信标的加权进行判断
                    temp[i].count += blueConfig.maxBufferLength * k * kScale + (blueConfig.maxBufferLength - j * jScale);
                    break;
                }
            }

            if (i === temp.length) {
                list[j].count = blueConfig.maxBufferLength * k * kScale + (blueConfig.maxBufferLength - j * jScale);

                temp.push(list[j]);
            }
        }
    }
    temp.sort(function (mem1, mem2) {
        return mem2.count - mem1.count;
    });

    return temp[0];
}

/**
 * @description 比对蓝牙，判断当前是否电梯、楼梯，准备切换楼层
 * @param {*} point
 * @returns int:floor
 */
function match2getFloor(point) {
    //找到当前的蓝牙点以及楼层
    if (app.nodeList != undefined) {
        let [cur] = app.nodeList.filter((item) => {
            return point.x == item.x && point.y == item.y && item.floor == point.floor;
        });
        if (
            cur == undefined ||
            cur == null ||
            cur.priority == undefined ||
            app.localization.lastBluePosition.floor == point.floor
        )
            return null;
        return cur.floor;
    }
}

export { beaconUpdate, match2getFloor };
