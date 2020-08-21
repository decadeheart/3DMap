//关于模型的各类操作
import { registerGLTFLoader } from "../util/gltf-loader"; //将GLTFLoader注入到THREE
import registerOrbit from "../util/orbit"; //手势操作
import * as TWEEN from "../util/tween.min"; //动画操作
import * as SPRITE from "./sprite";
import { loadGround, loadModelByFloor } from "./loadModel"; //加载模型
import userControl from "./user"; //用户贴图
import * as util from "../util/util";

var app = getApp();

//全局变量，供各个函数调用
var camera, scene, renderer, controls;
var canvas, THREE;
var selectedPoint = {};

/**
 * @description 初始化模型并渲染到canvas中
 * @export void 导出到index.js以供调用
 * @param {*} canvasDom 要渲染到的canvas的位置
 * @param {*} Three threejs引擎，用于创建场景、相机等3D元素
 */
export function renderModel(canvasDom, Three) {
    THREE = Three;
    canvas = canvasDom;
    registerGLTFLoader(THREE);
    init();
    animate();
    /**
     * @description 初始化场景、相机等元素
     */
    function init() {
        //设置场景，背景默认为黑色，通过background设置背景色
        scene = new THREE.Scene();
        //将背景设为白色
        scene.background = new THREE.Color(0xffffff);

        //设置场景相机位置及注视点
        camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 5000);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        camera.position.set(0, -300, 500); //将x设为-5会产生相机旋转90度的效果（原理未知）
        //调整相机主轴及放大倍数
        camera.up.set(0, 0, 1);
        camera.zoom = 3;
        camera.updateProjectionMatrix();

        //设置灯光，当前为白色环境光
        var light = new THREE.AmbientLight(0xffffff);
        scene.add(light);
        //添加方向光，可以使建筑物更有立体感
        light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(0, 0, 1);
        scene.add(light);

        //添加辅助工具
        // addHelper();

        //加载模型
        loadGround(scene);

        //添加用户贴图
        addUser();

        //创建渲染器
        renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
        renderer.setSize(canvas.width, canvas.height);
        renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;

        //加载手势控制器，有MapControls和OrbitControls两种操作方式
        const { MapControls } = registerOrbit(THREE);
        controls = new MapControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.update();
    }

    function addHelper() {
        //辅助坐标轴
        var axesHelper = new THREE.AxesHelper(5000);
        axesHelper.material.linewidth = 500;
        scene.add(axesHelper);
        //正交投影照相机
        let camera2 = new THREE.OrthographicCamera(-10, 10, 10, -10, 5, 300);
        renderer = new THREE.WebGLRenderer({
            alpha: true,
        });
        camera2.position.set(0, 0, 200);
        camera2.lookAt(new THREE.Vector3(0, 0, 0));
        //照相机辅助线
        let cameraHelper = new THREE.CameraHelper(camera2);
        scene.add(cameraHelper);
    }
}

/**
 * @description 渲染循环
 */
export function animate() {
    canvas.requestAnimationFrame(animate);
    renderer.render(scene, camera);
    TWEEN.update();
}
//场景元素的get方法
export function getCanvas() {
    return canvas;
}
export function getScene() {
    return scene;
}
export function getCamera() {
    return camera;
}
export function getRenderer() {
    return renderer;
}
export function getControl() {
    return controls;
}

/**
 * @description 加载用户贴图
 * @export
 */
export function addUser() {
    //加载用户贴图
    let textureLoader = new THREE.TextureLoader();
    textureLoader.load("../img/me.png", function (texture) {
        let usergeometry = new THREE.PlaneGeometry(10, 10, 27);
        let material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: texture,
            transparent: true,
            opacity: 1,
            depthTest: true,
        });
        app.me = new THREE.Mesh(usergeometry, material);
        userControl.initUser(5, 0, 5);
        scene.add(app.me);
    });
}

var caCoord = {};
/**
 * @description 2D-3D视角切换
 * @export
 * @param {*} canvas 被渲染的canvas位置
 */
export function cameraExchange(index) {
    if (controls.maxPolarAngle == 0 || index == 3) {
        controls.setMaxPolarAngle(Math.PI / 2);
        camera.position.set(caCoord.x, caCoord.y, caCoord.z);
    } else {
        caCoord.x = camera.position.x;
        caCoord.y = camera.position.y;
        caCoord.z = camera.position.z;
        controls.setMaxPolarAngle(0);
    }
    camera.updateProjectionMatrix();
    controls.update();
}

/**
 * @description  根据不同类型的事件加载不同的贴图
 * @date 2020-08-14
 * @export
 * @param {*} sprite 精灵
 * @param {*} point 点
 * @param {*} type 类型
 */
export function showSprite(sprite, point, type) {
    let routeClass = app.routeClass;
    //当精灵不为空时，只需要改变位置
    if (sprite != null) {
        //判断终点和起点并设置,用于计算，位置在前
        if (type == "start") {
            routeClass.startPoint = point;
        } else if (type == "end") {
            routeClass.endPoint = point;
        }
        //当管状路径不为空时，需要清除路径
        if (!!app.pathControl.pathGroup) {
            scene.remove(app.pathControl.pathGroup);
        }        
        sprite.position.set(point.x, point.y, point.z + 5);
        sprite.visible = true;

    } else {
        //当精灵为时，需要创建精灵贴图
        let map_conf = app.map_conf;
        let textureLoader = new THREE.TextureLoader();
        
        //判断终点和起点并设置,用于计算，位置在前
        if (type == "start") {
            routeClass.startPoint = point;
        } else if (type == "end") {
            routeClass.endPoint = point;
        }


        textureLoader.load("../img/" + type + ".png", function (texture) {
            let material = new THREE.SpriteMaterial({
                map: texture,
                depthTest: false,
            });
            sprite = new THREE.Sprite(material);
            sprite.scale.set(map_conf.imgSpriteScale, map_conf.imgSpriteScale, 1);
            sprite.initScale = {
                x: map_conf.imgSpriteScale,
                y: map_conf.imgSpriteScale,
                z: 1,
            };
            sprite.name = type + "Sprite";

            sprite.center = new THREE.Vector2(0.5, 0.5);
            sprite.position.set(point.x, point.y, point.z + 5);
            sprite.floor = point.floor;
            scene.add(sprite);
            //这里只是为了存储精灵对象
            if (type == "cur") {
                app.spriteControl.curSprite = sprite;
            } else if (type == "start") {
                app.spriteControl.startSprite = sprite;
            } else if (type == "end") {
                app.spriteControl.endSprite = sprite;
            }
        });
    }
}

/**
 * @description 获取最近POI名称
 * @param {*} obj 被选中的物体
 * @returns
 */
function getNearPOIName(obj) {
    let k = 0;
    let list = app.POItarget;
    for (let i = 0; i < list.length; i++) {
        if (list[i].floor === obj.floor) {
            if (util.dis3(list[i], obj) < util.dis3(list[k], obj)) {
                k = i;
            }
        }
    }
    //超过最大距离时则认定为室外
    if (util.dis3(list[k], obj) > 100) return "室外"; //参数100为测试得到，不同模型参数需要重新测试
    return list[k].name;
}

/**
 * @description 根据屏幕坐标在场景中显示当前位置的图片精灵
 * @export
 * @param {*} index 屏幕坐标
 */
export function selectObj(index) {
    //创建射线类，用于获取选中物体
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    //获取全局变量并改名
    let me = app.me;
    //定义一个极小的位移量，用于调整坐标点位置
    let tinyPos = 0;
    //获取鼠标点击位置
    mouse.x = (index.pageX / canvas._width) * 2 - 1;
    mouse.y = -((index.pageY - tinyPos) / canvas._height) * 2 + 1;
    //转换为视点坐标系
    raycaster.setFromCamera(mouse, camera);
    //获取选中物体
    let intersects = raycaster.intersectObjects(scene.children, true);
    //被选中物体不为空时
    if (intersects.length > 0) {
        //获取坐标点
        let point = intersects[0].point;
        //获取被选中物体
        let obj = intersects[0].object;
        if (me != null) {
            //在点击位置显示贴图精灵并返回最近POI地点名称
            selectedPoint = util.extendObj(selectedPoint, point);
            selectedPoint.floor = obj.floor;
            selectedPoint.nearTAGname = getNearPOIName(selectedPoint);
            showSprite(app.spriteControl.curSprite, selectedPoint, "cur");
            return selectedPoint.nearTAGname;
        }
    }
}
/**
 * @description 显示所有楼层
 * @export
 */
export function displayAllFloor() {
    let floorArray = app.map.isFloorLoaded;
    for (let i = 1; i <= floorArray.length; i++) {
        if (!floorArray[i]) {
            loadModelByFloor(scene, i);
        }
    }
    scene.children.forEach(function (obj, i) {
        if (!!obj.name) {
            setVisible(obj);
        }
    });
    /**
     * @description 设置物体是否可见
     * @param {*} obj 物体
     * @returns
     */
    function setVisible(obj) {
        obj.visible = true;
        obj.children.forEach(function (child) {
            setVisible(child);
        });
    }
}
/**
 * @description 显示指定楼层
 * @export
 * @param {*} floor 楼层
 */
export function displayOneFloor(floor) {
    let map = app.map;
    if (typeof floor !== "number") {
        floor = parseInt(floor);
    }
    if (floor == app.map.curFloor) return;
    if (!app.map.isFloorLoaded[floor]) {
        loadModelByFloor(scene, floor);
    }
    scene.children.forEach(function (obj) {
        if (!!obj.name) {
            setVisible(obj);
        }
    });
    /**
     * @description 设置物体是否可见
     * @param {*} obj 物体
     * @returns
     */
    function setVisible(obj) {
        parseInt(obj.floor) === floor ? (obj.visible = true) : (obj.visible = false);
        obj.name === "path" || obj.name === "text" ? (obj.visible = true) : null;
        if (obj.name.indexOf("outside") !== -1) {
            obj.visible = true;
            return;
        } else {
            obj.children.forEach(function (child) {
                setVisible(child);
            });
        }
        if (obj.name === "user" || obj.name === "sprite" + floor) {
            obj.visible = true;
        }
    }
    map.curFloor = floor;
}
/**
 * @description 显示指定的两个楼层
 * @export
 * @param {*} floor1 楼层1
 * @param {*} floor2 楼层2
 */
export function displayTwoFloor(floor1, floor2) {
    // let map = app.map;
    // if (floor == map.curFloor) return;
    if (typeof floor1 !== "number") {
        floor1 = parseInt(floor1);
        floor2 = parseInt(floor2);
    }
    if (!app.map.isFloorLoaded[floor1]) {
        loadModelByFloor(scene, floor1);
    }
    if (!app.map.isFloorLoaded[floor2]) {
        loadModelByFloor(scene, floor2);
    }
    scene.children.forEach(function (obj, i) {
        if (!!obj.name) {
            setVisible(obj);
        }
    });
    /**
     * @description 设置物体是否可见
     * @param {*} obj 物体
     * @returns
     */
    function setVisible(obj) {
        parseInt(obj.floor) === floor1 || parseInt(obj.floor) === floor2 ? (obj.visible = true) : (obj.visible = false);
        obj.name === "path" || obj.name === "text" ? (obj.visible = true) : null;
        if (obj.name.indexOf("outside") !== -1) {
            obj.visible = true;
            return;
        } else {
            obj.children.forEach(function (child) {
                setVisible(child);
            });
        }
        if (obj.name === "user" || obj.name === "sprite" + floor1 || obj.name === "sprite" + floor2) {
            obj.visible = true;
        }
    }
    // map.curFloor = floor;
}

/**
 * @description 初始化贴图模型
 * @date 2020-07-20
 * @export
 */
export function initPath() {
    let pathControl = app.pathControl;
    pathControl.texture = new THREE.TextureLoader().load("../img/arrow.png");
    pathControl.texture.mapping = THREE.UVMapping;
    pathControl.texture.wrapS = THREE.RepeatWrapping;
    pathControl.texture.wrapT = THREE.RepeatWrapping;
}
/**
 * @description 制造管状路径，和初始化一定是异步执行的，否则会报undefined
 * @date 2020-07-20
 * @export
 * @param {*} path 所有该路径上的nodelist
 * @returns
 */
export function createPathTube(path) {
    let pointlist = [];
    let floorlist = [];
    let map_conf = app.map_conf;
    let pathControl = app.pathControl;
    scene.remove(pathControl.pathGroup);

    pathControl.pathGroup = new THREE.Group();

    if (path.length < 2) {
        return;
    }
    pointlist.push([new THREE.Vector3(path[0].x, path[0].y, path[0].z + map_conf.lineHeight)]);
    floorlist.push(path[0].floor);
    for (let i = 1; i < path.length; i++) {
        if (path[i].floor !== path[i - 1].floor) {
            pointlist.push([
                new THREE.Vector3(path[i - 1].x, path[i - 1].y, path[i - 1].z + map_conf.lineHeight),
                new THREE.Vector3(path[i].x, path[i].y, path[i].z + map_conf.lineHeight),
            ]);
            floorlist.push(path[i - 1].floor);
            let line = [];
            line.push(new THREE.Vector3(path[i].x, path[i].y, path[i].z + map_conf.lineHeight));
            pointlist.push(line);
            floorlist.push(path[i].floor);
        } else {
            pointlist[pointlist.length - 1].push(new THREE.Vector3(path[i].x, path[i].y, path[i].z + map_conf.lineHeight));
        }
    }
    pointlist.forEach(function (line, i) {
        if (line.length > 1) {
            let curve = new THREE.CatmullRomCurve3(line, false, "catmullrom", 0.01);
            let tubegeo = new THREE.TubeGeometry(curve, 100, 1, 20, false);
            let tex = pathControl.texture.clone();
            pathControl.textures.push(tex);
            let material = new THREE.MeshBasicMaterial({
                map: tex,
            });
            material.map.repeat.x = curve.getLength() * 0.2;
            material.map.needsUpdate = true;
            let tube = new THREE.Mesh(tubegeo, material);
            tube.floor = floorlist[i];
            pathControl.pathGroup.add(tube);
        }
    });

    pathControl.pathGroup.name = "path";
    scene.add(pathControl.pathGroup);
}
/**
 * @description 显示当前选择的地方，并在图上标出
 * @date 2020-07-22
 * @export
 */
export function setCurClick(point) {
    if (point != null) {
        scene.remove(app.spriteControl.curSprite);
        app.spriteControl.curSprite = null;
        selectedPoint = point;
        showSprite(app.spriteControl.curSprite, point, "cur");
    }
}
/**
 * @description 点击设定起点响应事件
 * @date 2020-07-22
 * @export
 */
export function setStartClick(point) {
    if (!point) {
        scene.remove(app.spriteControl.curSprite);
        app.spriteControl.curSprite = null;
        showSprite(app.spriteControl.startSprite, selectedPoint, "start");
    } else {
        scene.remove(app.spriteControl.startSprite);
        app.spriteControl.startSprite = null;
        showSprite(app.spriteControl.startSprite, point, "start");
    }
}
/**
 * @description 点击设定终点响应事件
 * @date 2020-07-22
 * @export
 */
export function setEndClick(point) {
    if (!point) {
        scene.remove(app.spriteControl.curSprite);
        app.spriteControl.curSprite = null;
        showSprite(app.spriteControl.endSprite, selectedPoint, "end");
    } else {
        scene.remove(app.spriteControl.endSprite);
        app.spriteControl.endSprite = null;
        showSprite(app.spriteControl.endSprite, point, "end");
    }
}
/**
 * @description 点击去这里响应事件
 * @export
 */
export function setStartMe() {
    scene.remove(app.spriteControl.startSprite);
    app.spriteControl.startSprite = null;

    showSprite(app.spriteControl.startSprite, app.localization.nowBluePosition, "start");
}

/**
 * @description 回到当前位置
 * @export
 */
export function backToMe() {
    let point = app.localization.nowBluePosition;
    userControl.changePosition(point.x, point.y, point.z, "animation");
    let floor = point.floor;
    let poi = {
        x: point.x,
        y: point.y,
        z: point.z,
    };
    let L = 200; //相机与用户（me）之间的距离
    let me = app.me;

    let map = app.map;
    if (typeof floor != "number") {
        floor = parseInt(floor);
    }
    //设置物体可见性
    displayOneFloor(floor);

    map.curFloor = floor;

    camera.fov = 30;
    camera.updateProjectionMatrix();

    let newP = {
        x: poi.x - L * Math.sin(me.radian),
        y: poi.y - L * Math.cos(me.radian),
        z: 300,
    };
    animateCamera(camera.position, controls.target, newP, poi);
}
/**
 * @description 移动相机位置和注视点到新的位置
 * @param {*} current1 相机当前的位置
 * @param {*} target1 相机的controls的target
 * @param {*} current2 新相机的目标位置
 * @param {*} target2 新的controls的target
 */
export function animateCamera(current1, target1, current2, target2) {
    let positionVar = {
        x1: current1.x,
        y1: current1.y,
        z1: current1.z,
        x2: target1.x,
        y2: target1.y,
        z2: target1.z,
    };
    //关闭控制器
    controls.enabled = false;
    var tween = new TWEEN.Tween(positionVar);
    tween.to(
        {
            x1: current2.x,
            y1: current2.y,
            z1: current2.z,
            x2: target2.x,
            y2: target2.y,
            z2: target2.z,
        },
        1000
    );

    tween.onUpdate(function () {
        camera.position.x = positionVar.x1;
        camera.position.y = positionVar.y1;
        camera.position.z = positionVar.z1;
        controls.target.x = positionVar.x2;
        controls.target.y = positionVar.y2;
        controls.target.z = positionVar.z2;
        controls.update();
    });

    tween.onComplete(function () {
        ///开启控制器
        controls.enabled = true;
    });

    tween.easing(TWEEN.Easing.Cubic.InOut);
    tween.start();
}
/**
 * @description 结束导航
 * @export
 */
export function stopNav() {
    scene.remove(app.pathControl.pathGroup);
    scene.remove(app.spriteControl.endSprite);
    scene.remove(app.spriteControl.startSprite);

    app.spriteControl.endSprite = null;
    app.spriteControl.startSprite = null;
    app.spriteControl.curSprite = null;
    app.routeClass.startPoint = {};
    app.routeClass.endPoint = {};

    let point = app.localization.nowBluePosition;
    userControl.changePosition(point.x, point.y, point.z, "animation");
}
