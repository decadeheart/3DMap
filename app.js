//配置文件参数   
App({
    onLaunch: function () { },
    THREE: null,
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
        curFloor: 1,
        isFloorLoaded: [false, false, false, false, false, false]
    },
    map_conf: {
        map_id: "jxqzf",
        map_name: "江夏区政府",
        src_dir: "https://www.cleverguided.com/iLaN/3D-jxqzf/",
        img_dir: "https://www.cleverguided.com/iLaN/3D-jxqzf/target_img/",
        int_userHeight: 2,
        fontSpriteScale: 4,
        imgSpriteScale: 7,
        float_mapProportion: 0.3,
        layerHeight: 15,
        lineHeight: 1,
        bd_p1: { x: 114.417444, y: 30.519147 },
        bd_p2: { x: 114.428314, y: 30.512629 },
        coor_p1: { x: -250, y: 87 },
        coor_p2: { x: 140, y: -88 },
    },
    building_conf: [
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
    localization: {
        lastBluePosition: { x: 0, y: 0, z: 0, floor: 1 },
        nowBluePosition: { x: 0, y: 0, z: 0, floor: 1 },
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
                    this.BluetoothOpen = 1;//蓝牙一直打开
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
    systemControl: {
        state: 'normal',
        realMode: true,
        touching: false,
        isStimulation: function () {
            return systemControl.state === "navigating" && !systemControl.realMode;
        }
    },
    spriteControl: {
        endSprite: null,
        startSprite: null,
        curSprite: null,
        targetSprites: [],
        changeScale: function (scale) {
            this.targetSprites.forEach(function (groups) {
                groups.children.forEach(function (sprite) {
                    if (scale < 4) sprite.scale.set(sprite.initScale.x * 4 / scale, sprite.initScale.y * 4 / scale, 1);
                    if (sprite.level > scale) {
                        sprite.visible = false;
                    } else {
                        sprite.visible = true;
                    }
                });
            });
        }
    },
    pathControl: {
        textures: [],
        texture: null,
        pathGroup: null,
        changeScale: function (scale) {
            if (this.pathGroup !== null) {
                this.pathGroup.children.forEach(function (tube) {
                    tube.scale.set(scale, scale, 1);
                });
            }
        }
    },
    routeClass: {
        startPoint: {},
        endPoint: {},
        distance: 0,
        time: 0
    }
});
