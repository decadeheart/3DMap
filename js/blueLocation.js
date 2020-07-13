
var beaconUUID = "FDA50693-A4E2-4FB1-AFCF-C6EB07647825";

/**
 * @description 调用蓝牙
 * @date 2020-07-13
 */
function  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        console.log("成功")
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            console.log("失败")
            // if (res.available) {
            //   this.startBluetoothDevicesDiscovery()
            // }
          })
        }
      }
    })
  }

module.exports = {
    openBluetoothAdapter: openBluetoothAdapter
};
