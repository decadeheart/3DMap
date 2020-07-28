//配置文件参数   
App({
    onLaunch: function () { },
    canvasFont: null,
    canvasImg: null,
    THREE: null,
    curSpriteGroup: null,
    beaconCoordinate: [],
    navigateFlag: 0,
    me: [],
    arrow: [],
    scaleInvariableGroup: [],
    POItarget: [],
    resultParent: [],
    curName: '',
    map_conf: {
        map_id: "jxqzf",
        map_name: "江夏区政府",
        src_dir: "https://www.cleverguided.com/iLaN/3D-jxqzf/",
        img_dir: "https://www.cleverguided.com/iLaN/3D-jxqzf/target_img/",
        defaultFocus: { x: 0, y: 0 },
        defaultCameraPosi: { x: 0, y: -100, z: 200 },
        defaultUserPosition: { x: 0, y: 0 },
        default_layer: 1,
        int_userHeight: 2,
        fontSpriteScale: 4,
        imgSpriteScale: 2,
        noTargetSpriteScale: 7,
        float_mapProportion: 0.3,
        layerHeight: 15,
        lineHeight: 1,
        gcj02_p1: { x: 114.324121, y: 30.382188 },
        gcj02_p2: { x: 114.328199, y: 30.380626 },
        coor_p1: { x: -250, y: 87 },
        coor_p2: { x: 140, y: -88 },
    },
    building_conf: [
        {
            building_id: "1",
            building_name: "行政楼",
            layer_nums: 6,
            layer_height: 10,
        },
        {
            building_id: "2",
            building_name: "会议中心",
            layer_nums: 2,
            layer_height: 10,
        },
    ],
    localization: {
        lastBluePosition: { x: null, y: null, z: null, floor: null },
        lastBluePosition: 1,
        isWXReady: false,
        GPSOpen: 0,
        BluetoothOpen: 1,
        Counter: 0,
        BluetoothState: false,
        GPSx: 0,
        GPSy: 0,
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
            this.lastBluePosition = { x: x, y: y, z: z, floor: floor };
            if (this.BluetoothOpen === 1) {
                this.setModel("BLUE");
                this.Counter = 0;
                // if (!systemControl.isStimulation()) {

                //     TWEEN.remove(TweenControl.preLocationTween);
                //     TweenControl.preLocationTween = userControl.changePosition(x, y, z, "animation");
                // }
            }
        },
    },
    map: {
        int_totalLayerNums: 9,
        int_loadedLayerNums: 0,
        bool_isMapModelReady: false,
        stepCount: 0,
        preStep: 0,
        curFloor: 1,
        mapOrientation: null,
        deviceOrientation: 0,
        groundMeshes: [],
        compassRotation: 0,
        FloorChangeCheckTime: 5000,
    },
    systemControl: {
        state: 'normal',
        realMode: true,
        navPriorityCode: 1,//1电梯 -1楼梯
        touching: false,
        isStimulation: function () {
            return systemControl.state === "navigating" && !systemControl.realMode
        }
    },
    TweenControl: {
        preLocationTween: null,
        autoMoveTween: [],
        cameraTween: null
    },
    systemControl: {
        state: 'normal',
        realMode: true,
        navPriorityCode: 1,//1电梯 -1楼梯
        touching: false,
        isStimulation: function () {
            return systemControl.state === "navigating" && !systemControl.realMode
        }
    },
    spriteControl: {
        endSprite: null,
        startSprite: null,
        curSprite: null,
        targetSprites: [],
        setSizeAttenuation: function (Atten) {
            Object.keys(spriteControl).forEach(function (key) {
                if (spriteControl[key] instanceof THREE.Sprite) {
                    spriteControl[key].material.sizeAttenuation = Atten;
                }
            });
            this.targetSprites.forEach(function (groups) {
                groups.children.forEach(function (sprite) {
                    sprite.material.sizeAttenuation = Atten;
                });
            });
        },
        changeScale: function (scale) {
            Object.keys(spriteControl).forEach(function (key) {
                if (spriteControl[key] instanceof THREE.Sprite) {
                    spriteControl[key].scale.set(scale * map_conf.noTargetSpriteScale, scale * map_conf.noTargetSpriteScale, 1);
                }
            });
            this.targetSprites.forEach(function (groups) {
                groups.children.forEach(function (sprite) {
                    sprite.scale.set(sprite.initScale.x * scale, sprite.initScale.y * scale, 1);
                    if (scale > 4.5 - sprite.level && sprite.floor === map.curFloor) {
                        sprite.visible = false;
                    } else if (sprite.floor === map.curFloor) {
                        sprite.visible = true;
                    }
                });
            });
        }
    },
    pathControl: {
        PathTweengroup: [],//no use now
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
