import { createScopedThreejs } from "../util/three";
import * as MODEL from "../js/model";
import * as SPRITE from "../js/sprite";
import navigate from "../js/astar";
import { initData } from "../js/data";
import { beaconUpdate, match2getFloor } from "../js/ibeacon";
import gps from "../js/gps";
import accChange from "../js/motionDetection";
import { autoMoving } from "../js/simNavigate";
import * as TWEEN from "../util/tween.min"; //动画操作
import { showOrientationText } from "../js/directionNotify";
import userControl from "../js/user";
import * as util from "../util/util";

var app = getApp();
var main = {};
main.initMap = function (that) {
    //分别获取文字精灵、图片精灵和地图canvas并创建相应处理Threejs实例
    wx.createSelectorQuery()
        .select("#sprite")
        .node()
        .exec((res) => {
            app.canvasSprite = res[0].node;
        });
    wx.createSelectorQuery()
        .select("#map")
        .node()
        .exec((res) => {
            const canvas = res[0].node;
            const THREE = createScopedThreejs(canvas);
            app.canvas = canvas;
            app.THREE = THREE;

            MODEL.renderModel(canvas, THREE);
            MODEL.initPath();

            let renderer = MODEL.getRenderer();
            let scene = MODEL.getScene();
            let camera = MODEL.getCamera();

            // navRender();
            //打开步数监测
            accChange();
            /**
             * @description 新开的一个循环线程，检测导航状态时更新显示导航文字，检测蓝牙变化更新位置
             * @date 2020-07-31
             */
            function navRender() {
                renderer.clear();
                let nowPoint = app.localization.nowBluePosition;
                let lastPoint = app.localization.lastBluePosition;
                let systemControl = app.systemControl;
                let me = app.me;
                let needsUpdateBlueLocation = false; //用于确定蓝牙点是否需要更新

                //如果当前是导航模式，那么静止的管状路线会动起来，并且进行语音播报
                if (systemControl.state === "navigating") {
                    app.pathControl.textures.forEach(function (item) {
                        item.offset.x -= 0.05;
                    });

                    //获取语音播报的节点信息，并显示在页面上
                    let text = showOrientationText();
                    if (text) {
                        that.setData({
                            navInformation: text,
                        });
                    }
                }

                //手势缩放时调整文字和图标大小并按等级显示
                util.changeScale(2200 / camera.position.z, "sprite", app.spriteControl); //参数2200为测试得到，不同模型参数需要重新测试
                // app.pathControl.changeScale(camera.position.z / 500)
                util.changeScale(camera.position.z / 600, "user", userControl); //参数600为测试得到，不同模型参数需要重新测试

                //直接改变位置到首个蓝牙点位置
                if (lastPoint.x == 0 && lastPoint.y == 0 && lastPoint.z == 0 && nowPoint.x != 0) {
                    needsUpdateBlueLocation = true;
                    userControl.changePosition(nowPoint.x, nowPoint.y, nowPoint.z, "direction");
                    main.displayOneFloor(nowPoint.floor);
                }

                //匹配当前点的楼层是否在nodelist中，显示当前楼层
                let floor = match2getFloor(nowPoint);
                if (floor != null) main.displayOneFloor(floor);

                //如果是真实模式，非模拟导航，并且me.radian已经加载完毕
                if (app.systemControl.realMode) {
                    //偏移检测
                    // if (systemControl.state === "navigating") {
                    //     let arrIndex;
                    //     let arr = app.resultParent
                    //     let [cur] = arr.filter((item ,index) => {
                    //         if(nowPoint.x == item.x && nowPoint.y == item.y && nowPoint.floor == item.floor) {
                    //             arrIndex = index;
                    //         }
                    //         return nowPoint.x == item.x && nowPoint.y == item.y && nowPoint.floor == item.floor;
                    //     });

                    //     if(cur) {
                    //         main.detectDis(cur, arr[arrIndex+1], me.position)
                    //     }
                    // }

                    //如果蓝牙的位置发生了变化，人物位置动画更新
                    if (
                        nowPoint.x != lastPoint.x ||
                        nowPoint.y != lastPoint.y ||
                        nowPoint.z != lastPoint.z ||
                        nowPoint.floor != lastPoint.floor
                    ) {
                        //如果是在真实模式的导航过程中，只能在resultPatent路线上的时候跳转
                        if (systemControl.state === "navigating") {
                            let [cur] = app.resultParent.filter((item) => {
                                return nowPoint.x == item.x && nowPoint.y == item.y && nowPoint.floor == item.floor;
                            });
                            console.log("cur", cur);
                            if (cur) {
                                needsUpdateBlueLocation = true;

                                userControl.changePosition(nowPoint.x, nowPoint.y, nowPoint.z, "animation");
                            }
                        } else {
                            needsUpdateBlueLocation = true;
                            //如果不是导航过程当中，只要发生了变化就应该跳转
                            userControl.changePosition(nowPoint.x, nowPoint.y, nowPoint.z, "animation");
                        }
                    }
                    if (me.radian && needsUpdateBlueLocation) {
                        //动画更新部分，只有第一次和导航过程中改变视角
                        if (lastPoint.x == 0 || app.navigateFlag == 2) {
                            main.changeFocus(nowPoint);
                        }
                        lastPoint.x = nowPoint.x;
                        lastPoint.y = nowPoint.y;
                        lastPoint.z = nowPoint.z;
                        lastPoint.floor = nowPoint.floor;

                    }
                }
                TWEEN.update();
                renderer.render(scene, camera);
                renderer.clearDepth();
                app.threadId = canvas.requestAnimationFrame(navRender);
            }
            //重新进入小程序，之前的navRender还存在，因此需要cancel
            if (app.isReady) {
                canvas.cancelAnimationFrame(app.threadId);
            }
            app.threadId = canvas.requestAnimationFrame(navRender);
        });

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

main.cameraExchange = function (index) {
    MODEL.cameraExchange(index);
};
main.displayAllFloor = function (onShow) {
    MODEL.displayAllFloor(onShow);
    //为了提高加载性能，暂不使用该函数
    // SPRITE.loadAllTargetText(scene);
};
main.displayOneFloor = function (floor) {
    if (floor == app.map.curFloor) return;
    MODEL.displayOneFloor(floor);
};
main.displayTwoFloor = (floor1, floor2) => {
    MODEL.displayTwoFloor(floor1, floor2);
};
main.selectObj = function (index) {
    return MODEL.selectObj(index);
};
main.backToMe = function () {
    MODEL.backToMe();
};

//获取当前经纬度坐标,用完必须关闭
main.setPoibyLngLat = function () {
    gps.getLocationChange();
};
//关闭GPS并清除定时器
main.closeGPS = function () {
    gps.closeGPS();
};

/** 当前点设定 */
main.setCurClick = function (point) {
    MODEL.setCurClick(point);
};
/** 使用用户点击位置作为起点 */
main.setStartClick = function (point) {
    MODEL.setStartClick(point);
};
/** 使用用户当前位置作为起点 */
main.setStartMe = function () {
    MODEL.setStartMe();
};
/** 终点设定 */
main.setEndClick = function (point) {
    MODEL.setEndClick(point);
};
/** 获得起点和终点信息后获得导航路径 */
main.navigateInit = function () {
    return navigate(app.nodeList, app.routeClass.startPoint, app.routeClass.endPoint);
};
/**
 * 模拟导航中的根据路径进行移动
 * @param {*} path
 */
main.autoMove = (path) => {
    autoMoving(path);
};
/**
 * 停止导航
 */
main.stopNav = () => {
    MODEL.stopNav();
};

/**
 * @description 通过data.js 向服务器获取数据集、初始化数据
 * @date 2020-07-23
 * @return 格式化后的数据 [[],[]]
 */
main.getBuildingData = () => {
    return new Promise((resolve, reject) => {
        initData.then(() => {
            resolve();
        });
    });
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

/** 切换注视点 */
main.changeFocus = (point) => {
    let camera = MODEL.getCamera();
    let controls = MODEL.getControl();
    let me = app.me;
    //动画更新部分
    let L = 200;
    let newP = {
        x: point.x - L * Math.sin(me.radian),
        y: point.y - L * Math.cos(me.radian),
        z: 300,
    };
    let newT = {
        x: point.x,
        y: point.y,
        z: point.z,
    };
    MODEL.animateCamera(camera.position, controls.target, newP, newT);
};

main.detectDis = util.throttle(function (now, next, me) {
    if (next) {
        let distance1 = util.dis3(now, next);
        let distance2 = util.dis3(me, now);
        let distance3 = util.dis3(me, next);
        console.log(now);
        console.log(next);
        console.log("distance1", distance1);
        console.log("distance2", distance2);
        console.log("distance3", distance3);
        if (distance2 + distance3 > 2 * distance1) {
            // wx.showToast({
            //     title: "您已经偏离",
            //     icon: "none",
            //     image: "",
            //     duration: 2000,
            //     mask: true,
            // });
            app.localization.isOffset = true;
        } else {
            app.localization.isOffset = false;
        }
    }
}, 1000);

export default main;
