import { createScopedThreejs } from "../util/three";
import * as MODEL from "../js/model";
import naviagte from "../js/astar";
import initData from "../js/data";
import tts from "../js/tts";
import beaconUpdate from "../js/ibeacon";
import accChange from "../js/motionDetection";


var app = getApp();
var nodeList;

var main = {};
main.initData = function () {
    //分别获取文字精灵、图片精灵和地图canvas并创建相应处理Threejs实例
    wx.createSelectorQuery()
        .select("#font")
        .node()
        .exec((res) => {
            app.canvasFont = res[0].node;
        });
    wx.createSelectorQuery()
        .select("#img")
        .node()
        .exec((res) => {
            app.canvasImg = res[0].node;
        });
    wx.createSelectorQuery()
        .select("#map")
        .node()
        .exec((res) => {
            const canvas = res[0].node;
            const THREE = createScopedThreejs(canvas);
            app.canvas = canvas;
            app.THREE = THREE;            
            MODEL.renderModel(canvas,THREE);
            MODEL.loadTargetText();
        });
    
    // 处理数据
    initData.then((res) => {
        // console.log(res);
        let data = res.data;

        nodeList = data.nodeList;

        let target = data.target;
        app.beaconCoordinate = data.beaconCoordinate;

        for (let build in target) {
            for (let floor in target[build]) {
                target[build][floor].forEach(function (item) {
                    item.z = (item.floor - 1) * app.map_conf.layerHeight;
                    item.floor = parseInt(floor);
                    item.building = build;
                    app.POItarget.push(item);
                });
            }
        }

        nodeList.forEach(function (node) {
            node.z = (node.floor - 1) * app.map_conf.layerHeight;
        });
        app.beaconCoordinate.forEach(function (node) {
            node.z = (node.floor - 1) * app.map_conf.layerHeight;
        });

        // console.log(nodeList);
        naviagte(nodeList);
    }),
        (err) => {
            console.log(err);
        };
    /** 初始化授权 */
    wx.getSetting({
        success(res) {
            if (!res.authSetting["scope.userLocation"]) {
                wx.authorize({
                    scope: "scope.userLocation",
                    success() {
                        // 用户已经同意小程序使用定位功能
                        wx.getLocation();
                    },
                });
            }
        },
    });
};
main.cameraExchange = function () {
    MODEL.cameraExchange();
};
/** ibeacon 打开测试 */
main.startBeaconDiscovery = function () {
    return new Promise((resolve, reject) => {
        wx.startBeaconDiscovery({
            uuids: ["FDA50693-A4E2-4FB1-AFCF-C6EB07647825"],
            success: (result) => {
                console.log("开始扫描设备");
                wx.showToast({
                    title: "扫描成功",
                    icon: "none",
                    image: "",
                    duration: 1500,
                    mask: true,
                });
                beaconUpdate();
                var data = {
                    status: "success",
                    showBlueStatus: false,
                };
                resolve(data);
            },
            fail: (res) => {
                console.log(res);
                if (res.errCode === 11000 || res.errCode === 11001) {
                    var data = {
                        status: "error",
                        showBlueStatus: true,
                    };
                    resolve(data);
                }
            },
        });
    });
};

main.stepChange = function (that) {
    accChange(that);
}

export default main;