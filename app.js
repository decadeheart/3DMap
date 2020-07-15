//配置文件参数
App({
    onLaunch: function () {},

    canvas: null,
    canvasFont: null,
    canvasImg: null,
    THREE: null,
    nodeList: [],
    beaconCoordinate: [],
    me: [],
    POItarget: [],
    map_conf: {
        map_id: "jxqzf",
        map_name: "江夏区政府",
        img_dir: "https://www.cleverguided.com/iLaN/3D-jxqzf/target_img/",
        defaultFocus: { x: 0, y: 0 },
        defaultCameraPosi: { x: 0, y: -100, z: 200 },
        defaultUserPosition: { x: 0, y: 0 },
        default_layer: 1,
        int_userHeight: 2,
        TargetSpriteScale: 5,
        noTargetSpriteScale: 10,
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
    localization :{
      lastBluePosition: {x: null, y: null, z: null, floor: null},
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
  
          this.lastBluePosition = {x: x, y: y, z: z, floor: floor};
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
  userControl : {
    isInitUser: false,
    userToCamera: 0,
    userDefaultPosition: {x: 0, y: 0, z: 0},
    moveDetect: function () {
        map.stepCount += 1;
        if (map.stepCount - map.preStep > 0) {
            let distance = map_conf.float_mapProportion * (map.stepCount - map.preStep) * 0.5;
            let x = me.position.x + Math.sin(map.mapOrientation * Math.PI / 180) * distance;
            let y = me.position.y + Math.cos(map.mapOrientation * Math.PI / 180) * distance;
            if (!systemControl.isStimulation()) {
                userControl.changePosition(x, y, null, "direction");
            }
            map.preStep = map.stepCount;
        }
    },
    changeScale: function (scale) {
        if (this.isInitUser === false || map.bool_isMapModelReady === false) {
            return;
        }
        me.scale.set(scale, scale, me.scale.z);
    },
    changeRotation: function (x, y, z, mode) {
        if (userControl.isInitUser) {
            x = (x === null) ? me.rotation.x : x;
            y = (y === null) ? me.rotation.y : y;
            z = (z === null) ? me.rotation.z : z;
            if (mode === "animation") {
                //tweenjs类库主要用来调整和动画html5和js
                new TWEEN.Tween(me.rotation).to({x: x, y: y, z: z}, dis3(me.rotation, {
                    x: x,
                    y: y,
                    z: z
                } * 100)).start();
            } else {
                me.rotation.x = x;
                me.rotation.y = y;
                me.rotation.z = z;

            }

        }
    },
    changePosition: function (x, y, z, mode, Group) {
        if (this.isInitUser === false) {
            return;
        }
        if (typeof mode === "undefined" || mode === null) {
            mode = "direction";
        }
        let nextpoint = {
            x: (x === null) ? me.position.x : x,
            y: (y === null) ? me.position.y : y,
            z: (z === null) ? me.position.z : z
        };

        switch (mode) {
            case "direction":
                me.position.set(nextpoint.x, nextpoint.y, nextpoint.z);
                break;
            case "animation":
                let meTween;
                meTween = new TWEEN.Tween(me.position).to(nextpoint, dis3(me.position, nextpoint) * 100);
                meTween.start();
                return meTween;
                // if (TweenControl.preLocationTween != null) {
                //     TweenControl.preLocationTween.chain(meTween);
                // }else {
                //     meTween.start();
                // }

                break;
        }

    }
},
map : {
    int_totalLayerNums: 1,
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
systemControl : {
    state: 'normal',
    realMode: true,
    navPriorityCode: 1,//1电梯 -1楼梯
    touching: false,
    isStimulation: function () {
        return systemControl.state === "navigating" && !systemControl.realMode
    }
}

});
