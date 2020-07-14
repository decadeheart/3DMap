App({
    onLaunch: function () {},

    canvas: null,
    THREE: null,

    nodeList: [],
    beaconCoordinate: [],

    POItarget: [],
    map_conf: {
        map_id: "jxqzf",
        map_name: "江夏区政府",
        img_dir: "../target_img/",
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
  }    
});
