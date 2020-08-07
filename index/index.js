import main from "./main";
import {
    openCompass
} from "../js/compass";
import {
    backToMe
} from "../js/model";
var app = getApp();
Page({
    data: {
        baseUrl: "https://www.cleverguided.com/iLaN/3D-jxqzf/",
        dimensionImgUrl: ["../img/2D.png", "../img/3D.png"],
        dimension: 3,
        allFloorImgUrl: "../img/more.png",
        floorImgUrl: ["../img/1F.png", "../img/2F.png", "../img/3F.png", "../img/4F.png", "../img/5F.png", "../img/6F.png"],
        logoUrl: "../img/LOGO_500.png",
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
        buttons: [{
            type: "primary",
            className: "",
            text: "确认",
            value: 1,
        }, ],
        //模态框是否显示,模态框搜索结果
        modalFlag: false,
        searchResult: [],
        buildingList: [],
        buildingIndex: 0,
        buildingData: [],
        buildingData1D: [],
        buildingRoomGroup: [],
        searchHidden: true,
        floorIndex: 0,
        searchTitle: app.map_conf.map_name,
        compassAngle: "",
        isAndroid: false,
    },

    onLoad: function () {
        var that = this;

        //最先应该获取设备的型号，也很快
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    systemInfo: res,
                })
                if (res.platform == "devtools") {
                    console.log('PC')
                } else if (res.platform == "ios") {
                    console.log('ios')
                    that.setData({
                        isAndroid: false
                    })
                } else if (res.platform == "android") {
                    console.log('android')
                    that.setData({
                        isAndroid: true
                    })
                }
            }
        })


        main.getBuildingData().then((buildingDataTmp) => {
            // 将其变成一维数组，方便遍历
            var eachFloor = [].concat(...buildingDataTmp[1]);
            eachFloor = [].concat(...eachFloor);
            that.setData({
                buildingList: buildingDataTmp[0],
                buildingData: buildingDataTmp[1],
                buildingRoomGroup: buildingDataTmp[2],
                searchResult: eachFloor,
                buildingData1D: eachFloor,
                modalSearch: that.modalSearch.bind(that),
            });
            main.startBeaconDiscovery().then((res) => {
                that.setData({
                    showBlue: res.showBlueStatus,
                });

                main.initMap(that);
            });

        });



        openCompass(this);

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
        main.displayOneFloor(floor + 1);
    },

    /**
     * @description 切换起点终点
     */
    switchPoint() {
        this.setData({
            startPointName: this.data.endPointName,
            endPointName: this.data.startPointName,
        });
        let tmp = app.routeClass.startPoint;
        app.routeClass.startPoint = app.routeClass.endPoint;
        app.routeClass.endPoint = tmp;

        main.endClick(app.routeClass.endPoint);
        main.startClick(app.routeClass.startPoint);
        main.navigateInit();
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
        main.backToMe();
    },
    test() {
        this.setData({
            navFlag: this.data.navFlag == 3 ? 1 : Number(this.data.navFlag) + 1,
            infoFlag: this.data.infoFlag == 3 ? 1 : Number(this.data.infoFlag) + 1,
        });
    },

    /**
     * @description 点击搜索栏，页面跳转
     */
    switchModal() {
        var status = this.data.modalFlag == true ? false : true;
        this.setData({
            modalFlag: status,
        });
    },
    /**
     * @description 模态框搜索
     */
    modalSearch(e) {
        let searchInput = e.detail.value;
        searchInput = searchInput.replace(/\s+/g, "");
        if (searchInput.length != 0) {
            let tmp = this.data.buildingData1D.filter((item) => {
                var reg = new RegExp(searchInput);
                return reg.test(item.name) || reg.test(item.name2);
            });
            this.setData({
                searchResult: tmp,
                searchHidden: false,
            });
        }
        return new Promise(() => {});
    },
    /**
     * @description 搜索提示框隐藏和显示
     */
    switchHidden() {
        this.setData({
            searchHidden: !this.data.searchHidden,
        });
    },
    /**
     * @description 选中搜索结果后触发
     */
    selectResult: function (e) {
        var target = e.currentTarget.dataset.selected;
        // 对应关闭模态框，显示提示框，修改当前地点的名字
        this.setData({
            currentPointName: target.name + target.name2,
            modalFlag: false,
            infoFlag: 1,
        });
        //调用
        main.displayOneFloor(parseInt(target.floor));
        main.setCurClick(target);
        main.changeFocus(target);
    },
    /**
     * @description 搜索栏切换tab
     * @date 2020-07-24
     * @param {*} e 事件
     */
    switchTap(e) {
        // wx.vibrateShort({});
        let index = e.target.dataset.tapindex;
        this.setData({
            buildingIndex: index,
        });
    },
    /**
     * @description 显示该楼层的具体房间，如果重复选择该层，则隐藏
     * @date 2020-07-24
     * @param {*} e 事件
     */
    showFloor(e) {
        let index = e.currentTarget.dataset.floorindex;
        index = index == this.data.floorIndex ? -1 : index;
        this.setData({
            floorIndex: index,
        });
    },
    /**
     * @description 模拟导航
     * @date 2020-07-20
     * @param {*} e 事件
     */
    simNavigate(e) {
        app.systemControl.state = "navigating";
        app.systemControl.realMode = false;
        main.autoMove(app.resultParent);
        app.navigateFlag = 1;
        this.setData({
            navFlag: 3,
            infoFlag: 3,
        });
    },
    startNavigate(e) {
        let self = this;
        app.systemControl.state = "navigating";
        app.systemControl.realMode = true;
        if (self.startPointName != "我的位置") {
            main.startMe();

            setTimeout(function () {
                let dis = main.navigateInit();
                main.backToMe();
                self.setData({
                    navFlag: 3,
                    infoFlag: 3,
                    distanceInfo: dis,
                    startPointName: "我的位置",
                });
            }, 50);
        }
    },

    /**
     * @description 结束导航
     * @date 2020-08-03
     * @param {*} e
     */
    stopNavigate(e) {
        app.systemControl.state = "normal";
        app.systemControl.realMode = true;
        app.navigateFlag = 0;
        this.setData({
            navFlag: 1,
            infoFlag: 1,
        });
        main.stopNav();

        main.backToMe();
    },
    touchTap(e) {
        if (!app.navigateFlag) {
            let tmp = main.selectObj(e.touches[0]);
            this.setData({
                navFlag: 1,
                infoFlag: 1,
                currentPointName: tmp,
            });
        }

    },
    touchStart(e) {
        app.canvas.dispatchTouchEvent({
            ...e,
            type: "touchstart",
        });
        if (this.data.isAndroid) {
            if (!app.navigateFlag) {
                let tmp = main.selectObj(e.touches[0]);
                this.setData({
                    navFlag: 1,
                    infoFlag: 1,
                    currentPointName: tmp,
                });
            }

        }
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
        this.setData({
            startPointName: this.data.currentPointName,
        });

        setTimeout(function () {
            if (!!app.spriteControl.endSprite) {
                let dis = main.navigateInit();
                self.setData({
                    navFlag: 2,
                    infoFlag: 2,
                    distanceInfo: dis,
                });
                let startFloor = app.routeClass.startPoint.floor;
                let endFloor = app.routeClass.endPoint.floor
                if(startFloor == endFloor){
                    main.displayOneFloor(startFloor)
                }else {
                    main.displayTwoFloor(startFloor, endFloor)
                }

            }
        }, 50);
    },

    /**
     * @description 设置终点
     * @date 2020-07-20
     */
    setEndPoint() {
        main.endClick();
        let self = this;
        this.setData({
            endPointName: this.data.currentPointName,
        });

        setTimeout(function () {
            if (!!app.spriteControl.startSprite) {
                let dis = main.navigateInit();
                self.setData({
                    navFlag: 2,
                    infoFlag: 2,
                    distanceInfo: dis,
                });
                let startFloor = app.routeClass.startPoint.floor;
                let endFloor = app.routeClass.endPoint.floor
                if(startFloor == endFloor){
                    main.displayOneFloor(startFloor)
                }else {
                    main.displayTwoFloor(startFloor, endFloor)
                }
            }
        }, 50);
    },
    /**
     * @description 按钮“到这里去”的点击事件
     */
    goThere() {
        main.endClick();
        main.startMe();
        let self = this;
        setTimeout(function () {
            if (!!app.spriteControl.startSprite) {
                let dis = main.navigateInit();
                self.setData({
                    navFlag: 2,
                    infoFlag: 2,
                    distanceInfo: dis,
                    endPointName: self.data.currentPointName,
                    startPointName: "我的位置",
                });
                let startFloor = app.routeClass.startPoint.floor;
                let endFloor = app.routeClass.endPoint.floor
                if(startFloor == endFloor){
                    main.displayOneFloor(startFloor)
                }else {
                    main.displayTwoFloor(startFloor, endFloor)
                }
            }
        }, 50);
    },
});