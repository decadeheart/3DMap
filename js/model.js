//关于模型的各类操作
import { registerGLTFLoader } from "../util/gltf-loader"; //将GLTFLoader注入到THREE
import registerOrbit from "../util/orbit"; //手势操作
import * as TWEEN from "../util/tween.min"; //动画操作
import { loadModel } from "./loadModel"; //加载模型
import userControl from "./user"; //用户贴图
import * as ca from "./camera"; //相机操作
import { showOrientationText } from "./directionNotify";
import tts from "./tts";
import gps from "./gps";

//全局变量，供各个函数调用
var canvas, THREE;
var camera, scene, renderer, controls;
var app = getApp();
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
        camera.position.set(-5, 0, 1000);//将x设为-5会产生相机旋转90度的效果（原理未知）
        //调整相机主轴及放大倍数
        camera.up.set(0, 0, 1);
        camera.zoom = 3;
        camera.updateProjectionMatrix();
        console.log(camera);

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
        loadModel(scene);

        //加载文字和图片
        // loadTargetText(scene);

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
        renderer = new THREE.WebGLRenderer({ alpha: true });
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
function animate() {
    canvas.requestAnimationFrame(animate);
    renderer.render(scene, camera);
    TWEEN.update();
}
//添加场景元素的get方法
export function getScene() {
    return scene;
}
export function getCamera() {
    return camera;
}
export function getCanvas() {
    return canvas;
}
export function getRender() {
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
            depthTest: false,
        });
        app.me = new THREE.Mesh(usergeometry, material);
        //获取当期位置的GPS坐标并初始化
        gps.getLocation().then(res=>{
            userControl.initUser(res[0],res[1],0);
        })
        scene.add(app.me);
    });
}
//改变的当前地图上的位置
export function changePosition(x,y,z) {
    userControl.changePosition(x,y,z,"animation");
}
//改变旋转角度
export function rotate(x,y,z) {
    userControl.changeRotation(x,y,z,"animation");
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
        // console.log("3D->2D");
        caCoord.x = camera.position.x;
        caCoord.y = camera.position.y;
        caCoord.z = camera.position.z;
        controls.setMaxPolarAngle(0);
    }
    camera.updateProjectionMatrix();
    controls.update();
}
/**
 * @description 显示精灵
 * @export
 * @param {*} point 位置
 * @param {*} type 类型
 */
export function showSprite(sprite, point, type) {
    let routeClass = app.routeClass;
    if (sprite != null) {
        sprite.position.set(point.x, point.y, point.z + 5);
        if (type == "start") {
            routeClass.startPoint = point;
        } else if (type == "end") {
            routeClass.endPoint = point;
        }
        if (!!app.pathControl.pathGroup) {
            scene.remove(app.pathControl.pathGroup);
        }
    } else {
        let map_conf = app.map_conf;
        let textureLoader = new THREE.TextureLoader();
        // textureLoader.load(map_conf.src_dir + "image/" + type + ".png", function (texture) {
        textureLoader.load("../img/" + type + ".png", function (texture) {
            let material = new THREE.SpriteMaterial({
                map: texture,
                depthTest: false
            });
            sprite = new THREE.Sprite(material);
            sprite.scale.set(map_conf.noTargetSpriteScale, map_conf.noTargetSpriteScale, 1);
            sprite.initScale = {
                x: map_conf.noTargetSpriteScale,
                y: map_conf.noTargetSpriteScale,
                z: 1,
            };
            sprite.name = type + "Sprite";
            app.scaleInvariableGroup.push(sprite);
            sprite.center = new THREE.Vector2(0.5, 0.5);
            sprite.position.set(point.x, point.y, point.z + 5);
            sprite.floor = point.floor;
            scene.add(sprite);
            if (type == "cur") {
                app.spriteControl.curSprite = sprite;
            } else if (type == "start") {
                app.spriteControl.startSprite = sprite;
                routeClass.startPoint = point;
            } else if (type == "end") {
                app.spriteControl.endSprite = sprite;
                routeClass.endPoint = point;
            }
        });
    }
}
/**
 * @description 三维勾股定理
 * @param {*} nowLi 节点1
 * @param {*} nowLi2 节点2
 * @returns 
 */
function dis3(nowLi, nowLi2) {
    //勾股定理
    let a = nowLi.x - nowLi2.x;
    let b = nowLi.y - nowLi2.y;
    let c = nowLi.z - nowLi2.z;
    return Math.sqrt(a * a + b * b + c * c);
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
            if (dis3(list[i], obj) < dis3(list[k], obj)) {
                k = i;
            }
        }
    }
    // console.log(list[k]);
    return list[k].name;
}
/**
 * @description 复制一个对象到另一个对象
 * @date 2020-07-14
 * @param {*} oldObj
 * @returns
 */
function cloneObj(oldObj) {
    if (typeof oldObj != "object") return oldObj;
    if (oldObj == null) return oldObj;
    var newObj = new Object();
    for (var i in oldObj) newObj[i] = cloneObj(oldObj[i]);
    return newObj;
}
/**
 * @description 扩展对象
 * @date 2020-07-14
 */
function extendObj() {
    var args = arguments;
    if (args.length < 2) return;
    var temp = cloneObj(args[0]); //调用复制对象方法
    for (var n = 1; n < args.length; n++) {
        for (var i in args[n]) {
            temp[i] = args[n][i];
        }
    }
    return temp;
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
    let map = app.map;
    let me = app.me;
    //定义一个极小的位移量，用于调整坐标点位置
    let tinyPos = 1.5;
    //获取鼠标点击位置
    mouse.x = (index.pageX / canvas._width) * 2 - 1;
    mouse.y = -((index.pageY - tinyPos) / canvas._height) * 2 + 1;
    //转换为视点坐标系
    raycaster.setFromCamera(mouse, camera);
    //获取选中物体
    // let intersects = raycaster.intersectObjects(map.groundMeshes);
    let intersects = raycaster.intersectObjects(scene.children, true);
    //被选中物体不为空时
    if (intersects.length > 0) {
        //获取坐标点
        let point = intersects[0].point;
        //获取被选中物体
        let obj = intersects[0].object;
        if (me != null) {
            //在点击位置显示贴图精灵并返回最近POI地点名称
            selectedPoint = extendObj(selectedPoint, point);
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
        obj.name === "path" || obj.name === "text" ? (obj.visible = true) : null;
        if (obj.name.indexOf("outside") !== -1) {
            obj.visible = true;
            return;
        } else {
            obj.children.forEach(function (child) {
                setVisible(child);
            });
        }
    }
}
/**
 * @description 显示指定楼层
 * @export
 * @param {*} floor 楼层
 */
export function onlyDisplayFloor(floor) {
    // if (pathControl.pathGroup !== null) {
    //     // console.log(pathControl.pathGroup.children)
    // }
    let map = app.map;
    if (typeof floor !== "number") {
        floor = parseInt(floor);
    }
    // cameraControl.relativeCoordinate.z = camera.position.z - cameraControl.focusPoint.z;
    scene.children.forEach(function (obj, i) {
        if (!!obj.name) {
            setVisible(obj);
        }
    });
    // console.log(scene.children);
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
        if (obj.name === 'user') {
            obj.visible = true;
        }
    }
    map.curFloor = floor;
    // cameraControl.focusPoint.z = (map.curFloor - 1) * map_conf.layerHeight;
    // camera.position.z = cameraControl.focusPoint.z + cameraControl.relativeCoordinate.z;
    // camera.lookAt(new THREE.Vector3(cameraControl.focusPoint.x, cameraControl.focusPoint.y, cameraControl.focusPoint.z));
    // console.log(scene);
    // scene.remove(app.me);
    // addUser();
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
    //scene.remove(arrowList);
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
                new THREE.Vector3(
                    path[i - 1].x,
                    path[i - 1].y,
                    path[i - 1].z + map_conf.lineHeight
                ),
                new THREE.Vector3(path[i].x, path[i].y, path[i].z + map_conf.lineHeight),
            ]);
            floorlist.push(path[i - 1].floor);
            let line = [];
            line.push(new THREE.Vector3(path[i].x, path[i].y, path[i].z + map_conf.lineHeight));
            pointlist.push(line);
            floorlist.push(path[i].floor);
        } else {
            pointlist[pointlist.length - 1].push(
                new THREE.Vector3(path[i].x, path[i].y, path[i].z + map_conf.lineHeight)
            );
        }
    }
    pointlist.forEach(function (line, i) {
        if (line.length > 1) {
            console.log(line.length);
            let curve = new THREE.CatmullRomCurve3(line, false, "catmullrom", 0.01);
            let tubegeo = new THREE.TubeGeometry(curve, 100, 1, 20, false);
            let tex = pathControl.texture.clone();
            pathControl.textures.push(tex);
            console.log("tex", tex);
            let material = new THREE.MeshBasicMaterial({
                map: tex
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
        showSprite(app.spriteControl.startSprite, point, "cur");
        console.log(point)
    }
}
/**
 * @description 点击设定起点响应事件
 * @date 2020-07-22
 * @export
 */
export function setStartClick(point) {
    if(!point){
        scene.remove(app.spriteControl.curSprite);
        app.spriteControl.curSprite = null;
        showSprite(app.spriteControl.startSprite, selectedPoint, "start");
    }else {
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
    if(!point) {
        scene.remove(app.spriteControl.curSprite);
        app.spriteControl.curSprite = null;
        showSprite(app.spriteControl.endSprite, selectedPoint, "end");
    }else {
        scene.remove(app.spriteControl.endSprite);
        app.spriteControl.endSprite = null;
        showSprite(app.spriteControl.endSprite, point, "end");        
    }

}

export function setStartMe() {
    scene.remove(app.spriteControl.startSprite);
    app.spriteControl.startSprite = null;
    console.log('me',app.me.position)
    showSprite(app.spriteControl.startSprite, app.me.position, "start");

}

/**
 * @description
 * @export
 */
export function backToMe() {
    let me = app.me;
    // changeMe(6, [0, 500, 300])
    // console.log(me);
    gps.getLocation().then(res=>{
        // userControl.changePosition(res[0],res[1],0,"direction");
        displayPoi(me.floor, me.position);
    })
    
}
/**
 * @description
 * @param {*} floor
 * @param {*} poi
 */
function displayPoi(floor, poi) {
    let cameraControl = ca.cameraControl;
    let map = app.map;
    let map_conf = app.map_conf;
    if (typeof floor != 'number') {
        floor = parseInt(floor);
    }
    cameraControl.relativeCoordinate.x = camera.position.x - cameraControl.focusPoint.x;
    cameraControl.relativeCoordinate.y = camera.position.y - cameraControl.focusPoint.y;
    cameraControl.relativeCoordinate.z = camera.position.z - cameraControl.focusPoint.z;
    if (poi != null) {
        cameraControl.focusPoint.x = poi.x;
        cameraControl.focusPoint.y = poi.y;
    }
    //设置物体可见性
    scene.children.forEach(function (obj, i) {
        if (typeof obj.floor != 'undefined') {
            let floorOfObj = obj.floor;
            if (parseInt(floorOfObj) == floor || parseInt(floorOfObj) == 0) {
                obj.visible = true;
            } else {
                obj.visible = false;
            }
        }
        if (obj.name == 'path') {
            if (obj.type == 'Group') {
                obj.children.forEach(function (o) {
                    parseInt(o.floor) == floor ? o.visible = true : o.visible = false;
                });
            }
        }
    });
    map.curFloor = floor;
    cameraControl.focusPoint.z = (map.curFloor - 1) * map_conf.layerHeight;

    camera.position.x = poi.x + cameraControl.relativeCoordinate.x;
    camera.position.y = poi.y + cameraControl.relativeCoordinate.y;    

    let newP = { x: 400, y: 0, z: 1000 };
    
    animateCamera(camera.position, controls.target, newP, poi);

}
/**
 * @description
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
        z2: target1.z
    };
    //关闭控制器
    controls.enabled = false;
    var tween = new TWEEN.Tween(positionVar);
    tween.to({
        x1: current2.x,
        y1: current2.y,
        z1: current2.z,
        x2: target2.x,
        y2: target2.y,
        z2: target2.z
    }, 1000);

    tween.onUpdate(function () {
        camera.position.x = positionVar.x1;
        camera.position.y = positionVar.y1;
        camera.position.z = positionVar.z1;
        controls.target.x = positionVar.x2;
        controls.target.y = positionVar.y2;
        controls.target.z = positionVar.z2;
        controls.update();
    })

    tween.onComplete(function () {
        ///开启控制器
        controls.enabled = true;
    })

    tween.easing(TWEEN.Easing.Cubic.InOut);
    tween.start();
}