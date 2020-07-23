//加载模型到场景中

var app = getApp();
/**
 * @description 加载模型
 * @export
 * @param {*} scene 模型放置的场景
 */
export function loadModel(scene) {
    //获取必须的全局变量并改名
    let map = app.map;
    let map_conf = app.map_conf;
    let building_conf = app.building_conf;
    let THREE = app.THREE;
    let loader = new THREE.GLTFLoader();
    // loader.load('../img/jxqzf.gltf', function (glb) { //后期可以考虑使用gltf格式文件代替glb文件
    loader.load(map_conf.src_dir + 'data/' + map_conf.map_id + '.glb', function (glb) {
        //添加地面到场景里
        let ground = glb.scene;
        scene.add(ground);
        //设置物体参数
        ground.name = map_conf.map_id + "_" + "outside";
        setFloor(ground, 0);
        //修改已加载楼层数并判断是否加载完毕
        map.int_loadedLayerNums += 1;
        map.int_loadedLayerNums === map.int_totalLayerNums ? (function () {
            //initStep2();
            map.bool_isMapModelReady = true;
        })() : null;
    });
    building_conf.forEach(function (building) {
        for (let i = 1; i <= building.layer_nums; i++) {
            loader.load(map_conf.src_dir + 'data/' + map_conf.map_id + '_' + building.building_id + '_' + i + '.glb', function (glb) {
                //添加建筑物到场景里
                let building = glb.scene;
                //设置可见性
                // if (i == 1) building.visible = true;
                // else building.visible = false;
                scene.add(building);
                // 设置物体参数
                building.name = building.building_id + '_' + i + "_" + building.name;
                setFloor(building, i);
                //修改已加载楼层数并判断是否加载完毕
                map.int_loadedLayerNums += 1;
                map.int_loadedLayerNums === map.int_totalLayerNums ? (function () {
                    //initStep2();
                    map.bool_isMapModelReady = true;
                })() : null;
            })
        }
    });
    /**
     * @description 设置楼层//并将场景元素添加进map.groundMeshes中
     * @param {*} obj 场景元素
     * @param {*} f 楼层
     */
    function setFloor(obj, f) {
        obj.floor = f;
        // if (obj.name.indexOf('Floor') !== -1 || obj.name.indexOf('ground') !== -1) {
        //     map.groundMeshes.push(obj);
        //     map.groundMeshes.push.apply(map.groundMeshes, obj.children);
        // }
        obj.children.forEach(function (child) {
            setFloor(child, f);
        })
    }
    // loadTargetText();
}
