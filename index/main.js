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
            let controls = MODEL.getControl();

            navRender();
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

                app.spriteControl.changeScale(2000 / camera.position.z);

                //若是当前点是在初始位置，直接改变位置到初始
                if (lastPoint.x == 0 && lastPoint.y == 0 && lastPoint.z == 0 && nowPoint.x != 0) {
                    userControl.changePosition(nowPoint.x, nowPoint.y, nowPoint.z, "direction");
                    // console.log(nowPoint.floor)
                    main.displayOneFloor(nowPoint.floor);
                }

                //匹配当前点的楼层是否在nodelist中，显示当前楼层
                let floor = match2getFloor(nowPoint);
                if (floor != null) main.displayOneFloor(floor);

                //如果是真实模式，非模拟导航，并且me.radian 已经加载完毕
                if (app.systemControl.realMode && me.radian) {
                    //如果蓝牙的位置发生了变化，人物位置动画更新
                    if (
                        nowPoint.x != lastPoint.x ||
                        nowPoint.y != lastPoint.y ||
                        nowPoint.z != lastPoint.z ||
                        nowPoint.floor != lastPoint.floor
                    ) {
                        // console.log('当前点',nowPoint.x,nowPoint.y,nowPoint.z);
                        // console.log('之前点',lastPoint.x,lastPoint.y,lastPoint.z);
                        userControl.changePosition(nowPoint.x, nowPoint.y, nowPoint.z, "animation");

                        //动画更新部分
                        main.changeFocus(nowPoint);

                        lastPoint.x = nowPoint.x;
                        lastPoint.y = nowPoint.y;
                        lastPoint.z = nowPoint.z;
                        lastPoint.floor = nowPoint.floor;
                    }
                }

                TWEEN.update();
                renderer.render(scene, camera);
                renderer.clearDepth();
                canvas.requestAnimationFrame(navRender);
            }
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
main.displayAllFloor = function () {
    MODEL.displayAllFloor();
};
main.displayOneFloor = function (floor) {
    MODEL.displayOneFloor(floor);
    SPRITE.loadTargetTextByFloor(MODEL.getScene(), floor);
};
main.selectObj = function (index) {
    return MODEL.selectObj(index);
};
main.setStartPoint = function () {
    MODEL.showSprite(app.spriteControl.sprite.position, "start");
};
main.setEndPoint = function () {
    MODEL.showSprite(app.spriteControl.sprite.position, "end");
};
main.backToMe = function () {
    MODEL.backToMe();
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

//获取当前经纬度坐标,用完必须关闭
main.setPoibyLngLat = function () {
    gps.getLocationChange();
};
//关闭GPS并清除定时器
main.closeGPS = function () {
    gps.closeGPS();
};

/** 获得起点和终点信息后获得导航路径 */
main.navigateInit = function () {
    return navigate(app.nodeList, app.routeClass.startPoint, app.routeClass.endPoint);
};
/** 当前点设定 */
main.setCurClick = function (point) {
    MODEL.setCurClick(point);
};

/** 起点设定 */
main.startClick = function (point) {
    MODEL.setStartClick(point);
};

/** 终点设定 */
main.endClick = function (point) {
    MODEL.setEndClick(point);
};

/** 起点设定 */
main.startMe = function () {
    MODEL.setStartMe();
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

main.displayTwoFloor = (floor1, floor2) => {
    MODEL.displayTwoFloor(floor1, floor2);
};

export default main;
