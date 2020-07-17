var app = getApp();

let me = app.me;
let map = app.map;
let arrow = app.arrow;
let scaleInvariableGroup = app.scaleInvariableGroup;
let spriteControl = app.spriteControl;
let map_conf = app.map_conf;
let building_conf = app.building_conf;

export function loadModel(scene) {

    let THREE = app.THREE;
    let loader = new THREE.GLTFLoader();
    // loader.load('../style/jxqzf.gltf', function (glb) { //后期可以考虑使用gltf格式文件代替glb文件
    loader.load(map_conf.src_dir + 'data/' + map_conf.map_id + '.glb', function (glb) {
        //添加地面到场景里
        let ground = glb.scene;
        scene.add(ground);
        //设置物体参数
        ground.name = map_conf.map_id + "_" + "outside";
        setFloor(ground, 0);
        map.int_loadedLayerNums += 1;
        map.int_loadedLayerNums === map.int_totalLayerNums ? (function () {
            //initStep2();
            map.bool_isMapModelReady = true;
        })() : null;


    });
    building_conf.forEach(function (building) {
        for (let i = 1; i <= building.layer_nums; i++) {
        // for (let i = 1; i <= 1; i++) {
            loader.load(map_conf.src_dir + 'data/' + map_conf.map_id + '_' + building.building_id + '_' + i + '.glb', function (glb) {
                //添加建筑物到场景里
                let building = glb.scene;
                scene.add(building);
                //设置物体参数
                building.name = building.building_id + '_' + i + "_" + building.name;
                setFloor(building, i);
                map.int_loadedLayerNums += 1;
                map.int_loadedLayerNums === map.int_totalLayerNums ? (function () {
                    //initStep2();
                    map.bool_isMapModelReady = true;
                })() : null;
            })
        }
    });
    function setVisible(obj, visible) {
        console.log(obj.name);
        obj.visible = visible;
        obj.children.forEach(function (child) {
            setVisible(child, visible);
        })
    }

    function setFloor(obj, f) {
        obj.floor = f;
        if (obj.name.indexOf('Floor') !== -1 || obj.name.indexOf('ground') !== -1) {
            map.groundMeshes.push(obj);
            map.groundMeshes.push.apply(map.groundMeshes, obj.children);

        }
        obj.children.forEach(function (child) {
            setFloor(child, f);
        })
    }

    loader.load(map_conf.src_dir + 'data/arrow.gltf', function (obj) {

        arrow = obj.scene.children[0];
    });

    let textureLoader = new THREE.TextureLoader();
    textureLoader.load(map_conf.src_dir + 'image/me.png', function (texture) {
        let usergeometry = new THREE.PlaneGeometry(15, 15, 32);
        let material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: texture,
            transparent: true,
            opacity: 1,
            depthTest: false
        });
        me = new THREE.Mesh(usergeometry, material);
        // initUser();
    });
    textureLoader.load(map_conf.src_dir + 'image/end.png', function (texture) {
        let material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        spriteControl.endSprite = new THREE.Sprite(material);
        spriteControl.endSprite.scale.set(map_conf.noTargetSpriteScale, map_conf.noTargetSpriteScale, 1);
        spriteControl.endSprite.initScale = { x: map_conf.noTargetSpriteScale, y: map_conf.noTargetSpriteScale, z: 1 };
        spriteControl.endSprite.name = "endSprite";
        scaleInvariableGroup.push(spriteControl.endSprite);
        spriteControl.endSprite.center = new THREE.Vector2(0.5, 0.5);
        // initNavPoint();
    });
    textureLoader.load(map_conf.src_dir + 'image/start.png', function (texture) {
        let material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        spriteControl.startSprite = new THREE.Sprite(material);
        spriteControl.startSprite.scale.set(map_conf.noTargetSpriteScale, map_conf.noTargetSpriteScale, 1);
        spriteControl.startSprite.initScale = { x: map_conf.noTargetSpriteScale, y: map_conf.noTargetSpriteScale, z: 1 };
        spriteControl.startSprite.name = "startSprite";
        scaleInvariableGroup.push(spriteControl.startSprite);
        spriteControl.startSprite.center = new THREE.Vector2(0.5, 0.5);
        // initNavPoint();
    });
    textureLoader.load(map_conf.src_dir + 'image/cur.png', function (texture) {
        let material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        spriteControl.curSprite = new THREE.Sprite(material);
        spriteControl.curSprite.scale.set(map_conf.noTargetSpriteScale, map_conf.noTargetSpriteScale, 1);
        spriteControl.curSprite.initScale = { x: map_conf.noTargetSpriteScale, y: map_conf.noTargetSpriteScale, z: 1 };
        spriteControl.curSprite.name = "curSprite";
        scaleInvariableGroup.push(spriteControl.curSprite);
        spriteControl.curSprite.center = new THREE.Vector2(0.5, 0.5);
        // initNavPoint();
    });
    // loadTargetText();
}


