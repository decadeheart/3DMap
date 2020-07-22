//关于模型的各类操作

import { registerGLTFLoader } from "../util/gltf-loader"; //将GLTFLoader注入到THREE
import registerOrbit from "../util/orbit"; //手势操作
import * as TWEEN from "../util/tween.min"; //动画操作
import { loadModel } from "./loadModel"; //加载模型
import userControl from "./user"; //用户贴图
import * as ca from "./camera"; //相机操作

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
        camera.lookAt(new THREE.Vector3(-5, 0, 0));
        camera.position.set(0, 0, 1000);
        //调整相机主轴及放大倍数
        camera.up.set(0, 0, 1);
        camera.zoom = 3;
        camera.updateProjectionMatrix();
        // console.log(camera);
        //设置灯光，当前为白色环境光
        var light = new THREE.AmbientLight(0xffffff);
        scene.add(light);
        //添加方向光，可以使建筑物更有立体感
        light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(0, 0, 1);
        scene.add(light);

        //辅助坐标轴
        // var axesHelper = new THREE.AxesHelper(5000);
        // axesHelper.material.linewidth = 500;
        // scene.add(axesHelper);

        //加载模型
        loadModel(scene);

        //加载文字和图片
        //loadTargetText(scene);

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
            userControl.initUser();
            scene.add(app.me);
        });

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
        controls.update();
    }
    /**
     * @description 渲染循环
     */
    function animate() {
        canvas.requestAnimationFrame(animate);
        renderer.render(scene, camera);
        //TWEEN.update();
    }
}

var caCoord = {};
/**
 * @description 2D-3D视角切换
 * @export
 * @param {*} canvas 被渲染的canvas位置
 */
export function cameraExchange(index) {
    // console.log(camera.position, camera.rotation);

    if (controls.maxPolarAngle == 0 || index == 3) {
        // console.log("2D->3D");
        controls.setMaxPolarAngle(Math.PI / 2);
        camera.lookAt(0, 0, 0);
        camera.position.set(caCoord.x, caCoord.y, caCoord.z);
        // camera.po;
    } else {
        // console.log("3D->2D");
        camera.lookAt(camera.position.x, camera.position.y, 0);
        caCoord.x = camera.position.x;
        caCoord.y = camera.position.y;
        caCoord.z = camera.position.z;
        controls.setMaxPolarAngle(0);
        // camera.position.set(0, 0, cameraRelativeZ);
    }
    camera.updateProjectionMatrix();
    controls.update();
}

/**
 * @description 计算转二进制后天花板数（如：5=>101的天花板数为8=>1000）
 * @param {*} x 数字
 * @returns 见描述
 */
function maxnum_exp2(x) {
    let position,
        num = 1;
    if (x !== 0) {
        for (position = 0; x !== 0; ++position) {
            x >>= 1;
        }
    }
    num = 1 << position;
    return num;
}
/**
 * @description 获取文字长度
 * @param {*} val 文字信息
 * @returns 返回文字长度
 */
function getByteLen(val) {
    let len = 0;
    for (let i = 0; i < val.length; i++) {
        let a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/gi) != null) {
            len += 2;
        } else {
            len += 1;
        }
    }
    return len / 2;
}
/**
 * @description 创建文字和图片精灵
 * @param {*} message 文字信息
 * @param {*} imageURL 图片地址
 * @returns 返回创建完成的精灵
 */
function makeSprite(message, imageURL) {
    //为全局变量改名
    // let THREE = app.THREE;
    let map_conf = app.map_conf;

    //字体类型、大小、颜色
    let fontface = "Arial";
    let fontsize = 60;
    let fontColor = "#000000";
    //创建画布并设置宽高
    let canvas = app.canvasFont;
    let messageLen = getByteLen(message);
    let width = messageLen * fontsize * 2;
    let height = fontsize * 1.3;
    canvas.width = width;
    canvas.height = height;
    //在画布上创建字体原型
    let context = canvas.getContext("2d");
    context.fillStyle = fontColor;
    context.font = fontsize + "px " + fontface;
    context.fillText(message, 0, fontsize);
    //获取文字的大小数据，高度取决于文字的大小
    let textWidth = context.measureText(message).width;
    //获取画布的图像信息，一个副本
    let textdata = context.getImageData(0, 0, textWidth, height);

    //重新设置画布的大小
    let width2 = maxnum_exp2(textWidth);
    let height2 = maxnum_exp2(height);
    canvas.width = width2;
    canvas.height = height2;
    context.putImageData(textdata, (width2 - textWidth) / 2, (height2 - height) / 2);

    //将canvas转换为图片，方便进行纹理贴图（canvas直接贴图会报没有相应转换函数的错误）
    let dataUrl = canvas.toDataURL("../img/word.png");
    //纹理贴图
    let texture = new THREE.TextureLoader().load(dataUrl);
    //创建精灵
    let spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: true,
    });
    let sprite = new THREE.Sprite(spriteMaterial);
    //这句为了防止warning
    sprite.material.map.minFilter = THREE.LinearFilter;
    //缩放比例
    sprite.scale.set(
        (map_conf.fontSpriteScale * width2) / height2,
        map_conf.fontSpriteScale,
        1
    );
    sprite.initScale = {
        x: (map_conf.fontSpriteScale * width2) / height2,
        y: map_conf.fontSpriteScale,
        z: 1,
    };
    //通过重设canvas大小清空内容（因为需要的内容已经传到sprite中）
    canvas.width = 0;
    texture.dispose();
    texture = null;
    spriteMaterial = null;
    // sprite = null;

    //绘制相应图标
    if (imageURL !== null) {
        //创建图像实例并设置相关参数
        let img = canvas.createImage();
        let imgsize = 64;
        img.src = imageURL;
        //加载图片
        img.onload = function () {
            //在画布上创建图片原型并绘制
            let canvas2 = app.canvasImg;
            let context2 = canvas2.getContext("2d");
            canvas2.width = imgsize;
            canvas2.height = imgsize;
            context2.drawImage(img, 0, 0, imgsize, imgsize);
            //获取画布的图像信息，一个副本
            let imagedata = context2.getImageData(0, 0, imgsize, imgsize);
            //重新设置画布的大小
            let width3 = maxnum_exp2(Math.max(textWidth, imgsize));
            let height3 = maxnum_exp2(height + imgsize);
            canvas.width = width3;
            canvas.height = height3;
            context.putImageData(imagedata, (width3 - imgsize) / 2, 0);
            context.putImageData(textdata, (width3 - textWidth) / 2, imgsize);
            //转为图片并作为纹理贴图
            let dataUrl = canvas2.toDataURL("../img/word.png");
            let texture2 = new THREE.TextureLoader().load(dataUrl);
            let spriteMaterial = new THREE.SpriteMaterial({
                map: texture2,
                depthTest: true,
            });
            sprite.material = spriteMaterial;
            sprite.material.needsUpdate = true;
            //这句为了防止warning
            sprite.material.map.minFilter = THREE.LinearFilter;
            //缩放比例
            sprite.scale.set(
                map_conf.imgSpriteScale * (height3 / height2) * (width3 / height3),
                map_conf.imgSpriteScale * (height3 / height2),
                1
            );
            sprite.initScale = {
                x: sprite.scale.x,
                y: sprite.scale.y,
                z: 1,
            };
            //通过重设canvas大小清空内容
            canvas.width = 0;
            canvas2.width = 0;
            texture2.dispose();

            texture2 = null;
            spriteMaterial = null;
            sprite = null;
        };
    }
    return sprite;
}
/**
 * @description 删除模型中的物体并清除缓存
 * @param myObjects 待删除的物体
 * @returns
 */
function deleteObj(group) {
    // 删除掉所有的模型组内的mesh
    group.traverse(function (item) {
        if (item instanceof THREE.Sprite) {
            item.geometry.dispose(); // 删除几何体
            item.material.dispose(); // 
            console.log("delete!");
        }
    });
    scene.remove(group);
}

function dispose(parent, child) {
    if (child.children.length) {
        let arr = child.children.filter(x => x);
        arr.forEach(a => {
            dispose(child, a)
        })
    }
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Sprite) {
        if (child.material.map) {
            child.material.map.dispose(); 
            // console.log("纹理清除！");
        }
        child.material.dispose();
        child.geometry.dispose();
        // renderer.deallocateObject(child);
    } else if (child.material) {
        child.material.dispose();
    }
    child.remove();
    child = null;
    parent.remove(child);
    // console.log("delete!");
}

/**
 * @description 加载所有地点名称及图标精灵并显示在scene中
 * @export
 */
export function loadTargetTextByFloor(floor) {
    // console.log(app.curSpriteGroup);
    // if(!!app.curSpriteGroup) deleteObj(app.curSpriteGroup);
    if (!!app.curSpriteGroup) dispose(scene, app.curSpriteGroup);
    scene.remove(app.curSpriteGroup);
    // console.log(app.curSpriteGroup);
    // console.log(renderer.info);
    // renderer.deallocateTexture(texture);
    // console.log(renderer.info);
    //为全局变量改名
    let POItarget = app.POItarget;
    // let THREE = app.THREE;
    //创建精灵组

    app.curSpriteGroup = new THREE.Group();
    let spriteGroup = app.curSpriteGroup;
    let sprite;
    //添加精灵到精灵组
    POItarget.forEach(function (item) {
        if (item.floor == floor) {
            
            if (item.img) {
                sprite = makeSprite(item.name, app.map_conf.img_dir + item.img);
            } else {
                sprite = makeSprite(item.name, null);
            }
            sprite.level = item.level;
            sprite.position.set(item.x, item.y, item.z + 5);
            //设置参数
            sprite.floor = item.floor;
            sprite.center = new THREE.Vector2(0.5, 0.5);
            spriteGroup.add(sprite);
        }
    });
    spriteGroup.name = "text";

    scene.add(spriteGroup);
    spriteGroup = null;
    // spriteControl.targetSprites.push(spriteGroup);
    // console.log(scene);
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
            let material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
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
            // console.log(sprite);
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
    console.log(list[k]);
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
    }
    map.curFloor = floor;
    // cameraControl.focusPoint.z = (map.curFloor - 1) * map_conf.layerHeight;
    // camera.position.z = cameraControl.focusPoint.z + cameraControl.relativeCoordinate.z;
    // camera.lookAt(new THREE.Vector3(cameraControl.focusPoint.x, cameraControl.focusPoint.y, cameraControl.focusPoint.z));
    // console.log(scene);
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
            let material = new THREE.MeshBasicMaterial({ map: tex });
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

export function setStartClick() {
    scene.remove(app.spriteControl.curSprite);
    app.spriteControl.curSprite = null;
    showSprite(app.spriteControl.startSprite, selectedPoint, "start");
}

export function setEndClick() {
    scene.remove(app.spriteControl.curSprite);
    app.spriteControl.curSprite = null;
    showSprite(app.spriteControl.endSprite, selectedPoint, "end");
}

export function backToMe() {
    let me = app.me;
    displayPoi(me.floor, me.position);
}

export function camerafix() {
    let cameraControl = ca.cameraControl;
    let map = app.map;
    let map_conf = app.map_conf;

    cameraControl.relativeCoordinate.x = camera.position.x - cameraControl.focusPoint.x;
    cameraControl.relativeCoordinate.y = camera.position.y - cameraControl.focusPoint.y;
    cameraControl.relativeCoordinate.z = camera.position.z - cameraControl.focusPoint.z;

    cameraControl.focusPoint.x = -5;
    cameraControl.focusPoint.y = 0;


    cameraControl.focusPoint.z = (map.curFloor - 1) * map_conf.layerHeight;

    camera.position.x = -5 + cameraControl.relativeCoordinate.x;
    camera.position.y = 0 + cameraControl.relativeCoordinate.y;

    camera.lookAt(new THREE.Vector3(cameraControl.focusPoint.x, cameraControl.focusPoint.y, cameraControl.focusPoint.z));
    // console.log(camera);
    controls.update();
}

function displayPoi(floor, poi) {
    let cameraControl = ca.cameraControl;
    let map = app.map;
    let map_conf = app.map_conf;
    console.log(floor);
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
    camera.lookAt(new THREE.Vector3(cameraControl.focusPoint.x, cameraControl.focusPoint.y, cameraControl.focusPoint.z));
    controls.update();
}
