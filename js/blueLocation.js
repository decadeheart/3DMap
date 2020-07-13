var blueConfig = {
    "blueConfig": [],
    "maxBufferLength": 5,
    "minValiRssi": -90
}

var beaconUUID = "FDA50693-A4E2-4FB1-AFCF-C6EB07647825";

function toList(){
    wx.startBeaconDiscovery({
        uuids: ['FDA50693-A4E2-4FB1-AFCF-C6EB07647825'],
        success: (result)=>{
            console.log("开始扫描设备")
            wx.showToast({
                title: '扫描成功',
                icon: 'none',
                image: '',
                duration: 1500,
                mask: true,
            });
            
        },
        fail: (err)=>{
            console.log(err)
        },
    });

}

module.exports = {
    toList: toList,
};
