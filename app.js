//配置文件参数
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
});
