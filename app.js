//配置文件参数
App({
    onLaunch: function () {
        let url = this.url;
        let map = this.map.map_id;
        this.map.data_url = url + map + "/data/" + map + ".json";
        this.map.src_dir = `${url}${map}/`;
        this.map.img_dir = `${url}${map}/target_img/`;
    },
    isReady: false, //当所有元素加载好之后修改为true，重新进入时通过该标志来取消原动画渲染线程并进行部分全局变量初始化
    threadId: 0, //渲染进程id，配合isReady使用
    url: "https://www.cleverguided.com/iLaN/3D-",
    THREE: null,
    canvas: null,
    canvasSprite: null,
    beaconCoordinate: [],
    me: [],
    target: [],
    navigateFlag: 0,
    POItarget: [],
    resultParent: [],
    map: {
        stepCount: 0,
        preStep: 0,
        curFloor: 0,
        isFloorLoaded: [false, false, false, false, false, false, false],
        map_id: "jxqzf",
        map_name: "江夏区政府",
        data_url: "",
        src_dir: "",
        img_dir: "",
        int_userHeight: 2,
        fontSpriteScale: 4,
        imgSpriteScale: 7,
        float_mapProportion: 0.6,
        layerHeight: 15,
        lineHeight: 1,
        bd_p1: { x: 114.417444, y: 30.519147 },
        bd_p2: { x: 114.428314, y: 30.512629 },
        coor_p1: { x: -250, y: 87 },
        coor_p2: { x: 140, y: -88 },
    },
    building: [
        {
            building_id: "1",
            building_name: "行政楼",
            layer_nums: 6,
            layer_height: 15,
        },
        {
            building_id: "2",
            building_name: "会议中心",
            layer_nums: 2,
            layer_height: 15,
        },
    ],
    systemControl: {
        state: "normal",
        realMode: true,
        touching: false,
        isStimulation: function () {
            return systemControl.state === "navigating" && !systemControl.realMode;
        },
    },
    spriteControl: {
        curSprite: null,
        startSprite: null,
        endSprite: null,
        targetSprites: [],
    },
    pathControl: {
        textures: [],
        texture: null,
        pathGroup: null,
    },
    routeClass: {
        startPoint: {},
        endPoint: {},
        distance: 0,
        time: 0,
    },
    localization: {
        lastBluePosition: { x: 0, y: 0, z: 0, floor: 1 },
        nowBluePosition: { x: 0, y: 0, z: 0, floor: 1 },
        isOffset: false,
        isWXReady: false,
        GPSOpen: 0,
        BluetoothOpen: 1,
        setModel: function (mode) {
            switch (mode) {
                case "GPS":
                    this.GPSOpen = 1;
                    this.BluetoothOpen = 1;
                    break;
                case "BLUE":
                    this.GPSOpen = 0;
                    this.BluetoothOpen = 1; //蓝牙一直打开
                    break;
                case "OFF":
                    this.GPSOpen = 0;
                    this.BluetoothOpen = 0;
                    break;
            }
        },
        getBlue: function (x, y, z, floor) {
            // this.lastBluePosition=this.nowBluePosition;
            this.nowBluePosition = { x: x, y: y, z: z, floor: floor };
            if (this.BluetoothOpen === 1) {
                this.setModel("BLUE");
            }
        },
    },
});
