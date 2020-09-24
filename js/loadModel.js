import * as SPRITE from "./sprite";
//加载模型到场景中

var app = getApp();

/**
 * @description 根据楼层加载模型
 * @export
 * @param {*} scene 楼层放置的场景
 * @param {*} floor 楼层
 */
export function loadModelByFloor(scene, floor) {
    //获取必须的全局变量并改名
    let map = app.map;
    let building = app.building;
    let THREE = app.THREE;
    let loader = new THREE.GLTFLoader();
    building.forEach(function (building) {
        app.map.isFloorLoaded[floor] = true;
        if (floor <= building.layer_nums) {
            loader.load(
                map.src_dir + "data/" + map.map_id + "_" + building.building_id + "_" + floor + ".glb",
                function (glb) {
                    //添加建筑物到场景里
                    let building = glb.scene;
                    scene.add(building);
                    // 设置物体参数
                    building.name = building.building_id + "_" + floor + "_" + building.name;
                    setFloor(building, floor);
                }
            );
        }
    });
    if (app.canvasSprite) SPRITE.loadTargetTextByFloor(scene, floor);
}
/**
 * @description 设置楼层
 * @param {*} obj 场景元素
 * @param {*} f 楼层
 */
function setFloor(obj, f) {
    obj.floor = f;
    obj.children.forEach(function (child) {
        setFloor(child, f);
    });
}
/**
 * @description 加载地面
 * @export
 * @param {*} scene 地面放置的场景
 */
export function loadGround(scene) {
    //获取必须的全局变量并改名
    let map = app.map;
    let THREE = app.THREE;
    let loader = new THREE.GLTFLoader();
    loader.load(map.src_dir + "data/" + map.map_id + ".glb", function (glb) {
        //添加地面到场景里
        let ground = glb.scene;
        scene.add(ground);
        //设置物体参数
        ground.name = map.map_id + "_" + "outside";
        setFloor(ground, 0);
    });
}
