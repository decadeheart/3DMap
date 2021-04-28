import * as SPRITE from "./sprite";
// import { registerDRACOLoader  } from "../util/DRACOLoader";
//加载模型到场景中

var app = getApp();

/**
 * @description 根据楼层加载模型
 * @export
 * @param {*} scene 楼层放置的场景
 * @param {*} floor 楼层
 */
// export function loadModelByFloor(scene, floor) { }
export function loadModelByFloor(scene, floor) {
    //获取必须的全局变量并改名
    let map = app.map;
    let building = app.building;
    let THREE = app.THREE;
    let loader = new THREE.GLTFLoader();
    building.forEach(function (building) {
        app.map.isFloorLoaded[floor] = true;
        if (floor <= building.layer_nums) {
            const before = Date.now();
            loader.load(
                map.src_dir + "data/" + map.map_id + "_" + building.building_id + "_" + floor + ".glb",
                function (glb) {
                    //添加建筑物到场景里
                    let building = glb.scene;
                    scene.add(building);
                    const after = Date.now();
                    console.log('time-cost:', after - before);
                    // 设置物体参数
                    building.name = building.building_id + "_" + floor + "_" + building.name;
                    setFloor(building, floor);
                }
            );
            // const before = Date.now();
            // loader.load(
            //     map.src_dir + "data/jxsm_1_1.glb",
            //     function (glb) {
            //         //添加建筑物到场景里
            //         // console.log('glb',glb)
            //         const after = Date.now();
            //         console.log('time-cost:',after - before);
            //         let building = glb.scene;
            //         scene.add(building);
            //         // 设置物体参数
            //         building.name = building.building_id + "_" + floor + "_" + building.name;
            //         setFloor(building, floor);
            //     }
            // );
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
    // registerDRACOLoader(THREE);
    // var dracoLoader =  new THREE.DRACOLoader();

    // dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
    // // dracoLoader.preload()
    // console.log("dracoLoader",dracoLoader);
    // loader.setDRACOLoader(dracoLoader);
    // console.log("开始加载");
    const before = Date.now();
    loader.load(
        //资源链接
        // map.src_dir + "data/oldmodels/jxsm_1_1.glb",
        map.src_dir + "data/jxsm.glb",
        function (glb) {
            let building = glb.scene;
            scene.add(building);
            console.log("加载成功！");
            const after = Date.now();
            console.log('time-cost:', after - before);
            console.log("scene", scene);
            scene.children.forEach(function (obj) {
                console.log(obj.name);
                setVisible(obj);
                // if (!!obj.name || obj.type === "Group") {

                // }
            });
            console.log("scene", scene);
        },
        //onProgress,
        //onError
    )

    /**
     * @description 设置物体是否可见
     * @param {*} obj 物体
     * @returns
     */
    function setVisible(obj) {
        if (obj.name.indexOf("mesh_0_1") !== -1) {
            console.log(obj.name);
            obj.visible = false;
        }
        if (obj.name.indexOf("mesh_0_0") !== -1) {
            console.log(obj.name);
            obj.visible = false;
        }
        if (obj.name.indexOf("mesh_0_2") !== -1) {
            console.log(obj.name);
            obj.visible = false;
        }
        if (obj.name.indexOf("mesh_0_3") !== -1) {
            console.log(obj.name);
            obj.visible = false;
        }
        if (obj.name.indexOf("mesh_0_4") !== -1) {
            console.log(obj.name);
            obj.visible = false;
        }
        if (obj.name.indexOf("mesh_0_5") !== -1) {
            console.log(obj.name);
            obj.visible = false;
        }
        if (obj.name.indexOf("mesh_0_6") !== -1) {
            console.log(obj.name);
            obj.visible = false;
        }
        if (obj.name.indexOf("mesh_0_7") !== -1) {
            console.log(obj.name);
            obj.visible = false;
        }
        // if (obj.name.indexOf("mesh_0_8") !== -1) {
        //     console.log(obj.name);
        //     obj.visible = false;
        // }
        // if (obj.name.indexOf("mesh_0_9") !== -1) {
        //     console.log(obj.name);
        //     obj.visible = false;
        // }

        // if (obj.name == "mesh_0_13" || obj.name == "mesh_0_14") {
        //     console.log(obj.name);
        //     obj.visible = false;
        // }
        obj.children.forEach(function (child) {
            console.log(child.name);
            setVisible(child);
        });
    }
    // loader.load(map.src_dir + "data/" + map.map_id + ".glb", function (glb) {
    //     //添加地面到场景里
    //     let ground = glb.scene;
    //     scene.add(ground);
    //     //设置物体参数
    //     ground.name = map.map_id + "_" + "outside";
    //     setFloor(ground, 0);
    // });
}

