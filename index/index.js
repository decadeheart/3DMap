import main from "./main";
var app = getApp();
Page({
    data: {
        baseUrl: "https://www.cleverguided.com/iLaN/3D-jxqzf/",
        dimensionImgUrl: ["../img/2D.png","../img/3D.png"],
        dimension: 3,
        allFloorImgUrl: "../img/more.png",
        floorImgUrl: ["../img/1F.png","../img/2F.png","../img/3F.png","../img/4F.png","../img/5F.png","../img/6F.png"],
        logoUrl: "",
        // 1 显示搜索框 2 显示起点终点 3 显示导航路线提示
        navFlag: 1,
        startPointName: "我的位置",
        endPointName: "华中科技大学",
        navInformation: "前方路口右转",
        currentPointName: "华中科技大学",
        distanceInfo: "全程100米，大约耗时2分钟 ",
        // 1 设置起点终点 2 导航和模拟导航 3 结束导航
        infoFlag: 0,
        showBlue: false,
        step: 0,
        buttons: [
            {
                type: "primary",
                className: "",
                text: "确认",
                value: 1,
            },
        ],
        //模态框是否显示
        // modalFlag: true,
        searchTitle: app.map_conf.map_name,
    },

    onLoad: function () {
        //初始化图片url
        this.setData({
            // dimensionImgUrl: [
            //     this.data.baseUrl + "ui_img/2D.png",
            //     this.data.baseUrl + "ui_img/3D.png",
            // ],
            // allFloorImgUrl: this.data.baseUrl + "ui_img/more.png",
            // floorImgUrl: [
            //     this.data.baseUrl + "ui_img/1F.png",
            //     this.data.baseUrl + "ui_img/2F.png",
            //     this.data.baseUrl + "ui_img/3F.png",
            //     this.data.baseUrl + "ui_img/4F.png",
            //     this.data.baseUrl + "ui_img/5F.png",
            //     this.data.baseUrl + "ui_img/6F.png",
            // ],
            // logoUrl: this.data.baseUrl + "ui_img/LOGO_500.png",
        });

        main.initData();
        var that = this;
        main.startBeaconDiscovery().then((res) => {
            console.log(res, this);
            that.setData({
                showBlue: res.showBlueStatus,
            });
        });

        /** 步数监测 */
        main.stepChange(that);
    },

    /**
     * @description 弹窗事件
     * @date 2020-07-13
     * @param {*} e
     */
    blueToothTap(e) {
        this.setData({
            showBlue: true,
        });
        var that = this;
        main.startBeaconDiscovery().then((res) => {
            // console.log(res, this);
            that.setData({
                showBlue: res.showBlueStatus,
            });
        });
    },

    /**
     * @description 地图二维和三维视角切换
     */
    changeDimension() {
        let index = this.data.dimension == 2 ? 3 : 2;
        main.cameraExchange(index);
        this.setData({
            dimension: index,
        });
    },
    /**
     * @description 显示所有楼层
     * @param {*} e wxml的参数通过e获取
     */
    allFloor(e) {
        main.displayAllFloor();
    },
    /**
     * @description 页面点击楼层图片，切换楼层
     * @param {*} e wxml的参数通过e获取
     */
    selectFloor(e) {
        let floor = e.currentTarget.dataset.floor;
        main.onlyDisplayFloor(floor);
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

    /**
     * @description 获取当前的位置
     * @param {*}
     */
    getMyLocation() {
        console.log("我在这");
        main.backToMe();
        // tts("你好中国");
        // tts("你好湖北");
        // tts("你好武汉");
    },
    test() {
        this.setData({
            navFlag: this.data.navFlag == 3 ? 1 : Number(this.data.navFlag) + 1,
            infoFlag: this.data.infoFlag == 3 ? 1 : Number(this.data.infoFlag) + 1,
        });
        // console.log(this.data.navFlag, this.data.infoFlag);
    },

    /**
     * @description 点击搜索栏，页面跳转
     */
    switchSearch() {
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
                res.eventChannel.emit("acceptDataFromOpenerPage", { data: "test" });
            },
        });
        // var status = this.data.modalFlag == true ? false : true;
        // this.setData({
        //     modalFlag: status,
        // });
    },
    /**
     * @description 模拟导航
     * @date 2020-07-20
     * @param {*} e
     */
    simNavigate(e) {
        // console.log(e);
        app.systemControl.state = "navigating";
        app.systemControl.realMode = false;
        app.map.FloorChangeCheckTime = 1000;

        let dis = main.navigateInit();
        this.setData({
            distanceInfo: dis,
        });
    },

    touchTap(e) {
        console.log("tap");
        app.curName = main.selectObj(e.touches[0]);
        if (!!!app.curName) app.curName = "室外";
        console.log(app.curName);
        this.setData({
            navFlag: 1,
            infoFlag: 1,
            currentPointName: app.curName,
        });
    },
    touchStart(e) {
        app.canvas.dispatchTouchEvent({
            ...e,
            type: "touchstart",
        });
    },
    touchMove(e) {
        app.canvas.dispatchTouchEvent({
            ...e,
            type: "touchmove",
        });
    },
    touchEnd(e) {
        app.canvas.dispatchTouchEvent({
            ...e,
            type: "touchend",
        });
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    },

    /**
     * 导航点击专区
     */

    /**
     * @description 设置起点
     * @date 2020-07-20
     */
    setStartPoint() {
        main.startClick();
        let self = this;
        setTimeout(function(){
            if (!!app.spriteControl.endSprite) {
                self.setData({
                    navFlag: 2,
                    infoFlag: 2,
                });
                let dis = main.navigateInit();
                self.setData({
                    distanceInfo: dis,
                });
            }
        }, 50);
        this.setData({
            startPointName: app.curName,
        });
    },

    /**
     * @description 设置终点
     * @date 2020-07-20
     */
    setEndPoint() {
        main.endClick();
        let self = this;
        setTimeout(function(){
            if (!!app.spriteControl.startSprite) {
                self.setData({
                    navFlag: 2,
                    infoFlag: 2,
                });
                let dis = main.navigateInit();
                self.setData({
                    distanceInfo: dis,
                });
            }
        }, 50);

        this.setData({
            endPointName: app.curName,
        });
    },
});
