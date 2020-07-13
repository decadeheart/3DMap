var blueConfig = {
    "blueConfig":[],
    "maxBufferLength":5,
    "minValidRssi":-90
}

/**
 * @description 监听ibeacon更新状态
 * @date 2020-07-13
 */
function beaconUpdate() { 
    wx.onBeaconUpdate((res) => {
        console.log(res)
        console.log(res.beacons.length)
        console.log(app.beaconCoordinate)
    });
}

module.exports = {

    beaconUpdate: beaconUpdate
}