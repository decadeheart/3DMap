import { addUser } from "./model";

var blueConfig = {
    blueConfig: [],
    maxBufferLength: 5,
    minValidRssi: -90,
    beaconInfo: [],
};
var app = getApp();

/**
 * @description 监听ibeacon更新状态
 * @date 2020-07-13
 */
function beaconUpdate() {
    wx.onBeaconUpdate((res) => {
        let data = [];

        for (let i = 0; i < res.beacons.length; i++) {
            if (res.beacons[i].rssi !== "0") {
                let temp = matchRecord(res.beacons[i]);
                if (temp != null && data.length < 6) {
                    data.push(temp);
                }
            }
        }
        if (blueConfig.beaconInfo.length >= blueConfig.maxBufferLength) {
            //移除第一个元素
            blueConfig.beaconInfo.shift();
        }

        //根据信号强度来排序
        blueConfig.beaconInfo.push(
            data.sort(function (num1, num2) {
                return parseFloat(num2.rssi) - parseFloat(num1.rssi);
            })
        );

        let result = getMaxPossiblePoint();

        if (parseInt(result.rssi) < parseInt(blueConfig.minValidRssi)) {
            return;
        }

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
        if (
            obj.major == app.beaconCoordinate[i].major &&
            obj.minor == app.beaconCoordinate[i].minor
        ) {
            //rssi表示设备的信号强度
            let beaCor = { rssi: obj.rssi };
            let ret = extendObj(beaCor, app.beaconCoordinate[i]);
            return ret;
        }
    }
    return null;
}

/**
 * @description 复制一个对象到另一个对象
 * @date 2020-07-14
 * @param {*} oldObj
 * @returns
 */
function cloneObj(oldObj) {
    if (typeof oldObj != "object") return oldObj;
    if (oldObj == null) return oldObj;
    var newObj = new Object();
    for (var i in oldObj) newObj[i] = cloneObj(oldObj[i]);
    return newObj;
}

/**
 * @description 扩展对象
 * @date 2020-07-14
 */
function extendObj() {
    var args = arguments;
    if (args.length < 2) return;
    var temp = cloneObj(args[0]); //调用复制对象方法
    for (var n = 1; n < args.length; n++) {
        for (var i in args[n]) {
            temp[i] = args[n][i];
        }
    }
    return temp;
}

/**
 * @description 得到强度最大的点
 * @date 2020-07-14
 * @returns
 */
function getMaxPossiblePoint() {
    let temp = [];
    //提取字符串
    let buffer = blueConfig.beaconInfo.slice(0);

    for (let k = 0; k < buffer.length; k++) {
        let list = buffer[k];
        for (let j = 0; j < list.length; j++) {
            let i = 0;
            for (i; i < temp.length; i++) {
                if (temp[i].major === list[j].major && temp[i].minor === list[j].minor) {
                    temp[i].count =
                        temp[i].count +
                        blueConfig.maxBufferLength * k +
                        (blueConfig.maxBufferLength - j * 2);
                    break;
                }
            }

            if (i === temp.length) {
                list[j].count =
                    blueConfig.maxBufferLength * k + (blueConfig.maxBufferLength - j * 2);

                temp.push(list[j]);
            }
        }
    }

    temp.sort(function (mem1, mem2) {
        return mem2.count - mem1.count;
    });

    return temp[0];
}

export default beaconUpdate;
