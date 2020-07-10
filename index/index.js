const { createScopedThreejs } = require("../util/three");
const { renderModel } = require("../js/model");

const app = getApp();

Page({
    data: {
        baseUrl: "https://www.cleverguided.com/iLaN/3D-jxqzf/",
        dimensionImgUrl: [],
        dimension: 3,
        allFloorImgUrl: "",
        floorImgUrl: [],
        logoUrl: "",
        // 1 显示搜索框 2 显示起点终点 3 显示导航路线提示
        navFlag: 3,
        startPointName: "我的位置",
        endPointName: "华中科技大学",
        navInformation: "前方路口右转",
    },

    onLoad: function () {
        wx.createSelectorQuery()
            .select("#map")
            .node()
            .exec((res) => {
                const canvas = res[0].node;
                this.canvas = canvas;
                // var gl = canvas.getContext('webgl', {
                //   alpha: true
                // });
                const THREE = createScopedThreejs(canvas);
                renderModel(canvas, THREE);
            });

        //初始化图片url
        this.setData({
            dimensionImgUrl: [
                this.data.baseUrl + "ui_img/2D.png",
                this.data.baseUrl + "ui_img/3D.png",
            ],
            allFloorImgUrl: this.data.baseUrl + "ui_img/more.png",
            floorImgUrl: [
                this.data.baseUrl + "ui_img/1F.png",
                this.data.baseUrl + "ui_img/2F.png",
                this.data.baseUrl + "ui_img/3F.png",
                this.data.baseUrl + "ui_img/4F.png",
                this.data.baseUrl + "ui_img/5F.png",
                this.data.baseUrl + "ui_img/6F.png",
            ],
            logoUrl: this.data.baseUrl + "ui_img/LOGO_500.png",
        });
    },
    /**
     * @description 地图二维和三维视角切换
     */
    changeDimension() {
        let index = this.data.dimension == 2 ? 3 : 2;
        this.setData({
            dimension: index,
        });
    },
    /**
     * @description 页面点击楼层图片，切换楼层
     * @param {*} e wxml的参数通过e获取
     */
    selectFloor(e) {
        let floor = e.currentTarget.dataset.floor;
        console.log(floor);
    },
    /**
     * @description 切换起点终点
     */
    switchPoint() {
        this.setData({
            startPointName: this.data.endPointName,
            endPointName: this.data.startPointName,
        });
    },
    /**
     * @description 切换页面上方的提示  1 显示搜索框 2 显示起点终点 3 显示导航路线提示
     * @param {*} e 根据传来的参数切换
     */
    switchNavFlag(e) {
        this.setData({
            navFlag: e.currentTarget.dataset.flag,
        });
    },
    test() {
        this.setData({
            navFlag: this.data.navFlag == 3 ? 0 : this.data.navFlag + 1,
        });
    },
    /**
     * @description 点击搜索栏，页面跳转
     */
    goSearch() {
        wx.navigateTo({
            url: "../search/search",
            events: {
                // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                acceptDataFromOpenedPage: function (data) {
                    console.log(data);
                },
                someEvent: function (data) {
                    console.log(data);
                },
            },
            success: function (res) {
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit("acceptDataFromOpenerPage", {
                    data: "test",
                });
            },
        });
    },
    touchStart(e) {
        this.canvas.dispatchTouchEvent({
            ...e,
            type: "touchstart",
        });
    },
    touchMove(e) {
        this.canvas.dispatchTouchEvent({
            ...e,
            type: "touchmove",
        });
    },
    touchEnd(e) {
        this.canvas.dispatchTouchEvent({
            ...e,
            type: "touchend",
        });
    },
});
