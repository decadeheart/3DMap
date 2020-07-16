import { registerGLTFLoader } from "../util/gltf-loader"; //加载模型
import registerOrbit from "../util/orbit"; //手势操作
import * as TWEEN from "../util/tween.min"; //动画操作

//全局变量，供各个函数调用
var canvas, THREE;
var camera, scene, renderer, model, controls;
var app = getApp();

/**
 * @description 初始化模型并渲染到canvas中
 * @export void 导出到index.js以供调用
 * @param {*} canvas 要渲染到的canvas的位置
 * @param {*} THREE threejs引擎，用于创建场景、相机等3D元素
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
        scene.rotation.z -= (Math.PI / 2);
        //设置场景相机位置及注视点
        camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.5, 10000);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        camera.position.set(0, -400, 400);
        // camera.rotation.x+=Math.PI /2;
        // camera.rotation.z+=Math.PI/2;
        camera.up.set(0,0,1)
        camera.zoom = 3;
        camera.updateProjectionMatrix();

        //设置灯光，当前为白色环境光
        var light = new THREE.AmbientLight(0xffffff);
        scene.add(light);

        light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(0, 0, 1);
        scene.add(light);

        // light = new THREE.PointLight(0x00FF00, 1, 400, 1);
        // light.position.set(0, 0, 25);
        // scene.add(light);

        // 辅助坐标轴
        var axesHelper = new THREE.AxesHelper( 5000 );
        axesHelper.material.linewidth=500;
        scene.add( axesHelper );

        // 加载模型
        var loader = new THREE.GLTFLoader(); //根据模型类型选择相应加载器
        loader.load(
            "https://www.cleverguided.com/iLaN/3D-jxqzf/data/jxqzf_1_1.glb",
            function (gltf) {
                model = gltf.scene;
                //微调位置
                // model.rotation.x = Math.PI /4;
                // model.rotation.y = Math.PI/4;
                // model.rotation.z = -Math.PI/2;

                // model.position.x += -60;
                model.position.x += -50;
                scene.add(model);
            },
            undefined,
            function (e) {
                console.error(e);
            }
        );

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
        TWEEN.update();
    }
}
/**
 * @description 2D-3D视角切换
 * @export
 * @param {*} canvas 被渲染的canvas位置
 */
export function cameraExchange() {
    // let THREE = app.THREE;
    // let canvas = app.canvas;
    // initTween();
    // animate();
    // console.log(controls,controls.maxPolarAngle)
    console.log("当前：",camera)
    let camZ=camera.position.z;
    let camX=camera.position.x>0?Math.abs(camZ):-Math.abs(camZ);
    let camY=camera.position.y>0?Math.abs(camZ):-Math.abs(camZ);;

    if(controls.maxPolarAngle == 0){
        console.log("2D->3D")
        controls.setMaxPolarAngle(Math.PI/2)
        camera.lookAt(0,0,0);
        camera.position.set(camX, camY, camZ);

        // console.log(camera.position)
    }
    else{
        console.log("3D->2D")
        console.log(camera.position)
        camera.lookAt(0,0,0);
        controls.setMaxPolarAngle(0)
        camera.position.set(0, 0, camZ);
        
        
    }
    controls.update();
    // animate();

    /**
     * @description 视角移动动画
     */
    function initTween() {
        new TWEEN.Tween(camera.position).to({ x: 0, y: 0, z: 400 }, 1200).repeat(0).start();
    }
    /**
     * @description 渲染循环
     */
    function animate() {
        // camera.position.set(0, 0, 400);
        canvas.requestAnimationFrame(animate);
        renderer.render(scene, camera);

        // camera.lookAt(new THREE.Vector3(0, 0, 0)); //保持注视位置不变
        // scene.rotation.z = (Math.PI / 2) * 3;
        // TWEEN.update(); //更新动画，配合initTween使用
    }
}
/**
 * @description 计算一个数字转为二进制后同位数最大值+1（如：5=>101的同位最大值为111，加一后为1000）
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
    var dataUrl = canvas.toDataURL("../style/word.png");
    //纹理贴图
    var texture = new THREE.TextureLoader().load(dataUrl);
    //创建精灵
    let spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: true });
    let sprite = new THREE.Sprite(spriteMaterial);
    //这句为了防止warning
    sprite.material.map.minFilter = THREE.LinearFilter;
    //缩放比例
    sprite.scale.set(
        (map_conf.TargetSpriteScale * width2) / height2,
        map_conf.TargetSpriteScale,
        1
    );
    sprite.initScale = {
        x: (map_conf.TargetSpriteScale * width2) / height2,
        y: map_conf.TargetSpriteScale,
        z: 1,
    };
    //通过重设canvas大小清空内容（因为需要的内容已经传到sprite中）
    canvas.width = 0;

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
            var dataUrl = canvas2.toDataURL("../style/word.png");
            var texture2 = new THREE.TextureLoader().load(dataUrl);
            let spriteMaterial = new THREE.SpriteMaterial({ map: texture2, depthTest: true });
            sprite.material = spriteMaterial;
            //这句为了防止warning
            sprite.material.map.minFilter = THREE.LinearFilter;
            //缩放比例
            sprite.scale.set(
                map_conf.TargetSpriteScale * (height3 / height2) * (width3 / height3),
                map_conf.TargetSpriteScale * (height3 / height2),
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
        };
    }
    return sprite;
}
/**
 * @description 加载所有精灵并显示在scene中
 * @export
 */
export function loadTargetText() {
    //为全局变量改名
    let POItarget = app.POItarget;
    // let THREE = app.THREE;
    //创建精灵组
    let spriteGroup = new THREE.Group();
    let sprite;
    //添加精灵到精灵组
    POItarget.forEach(function (item) {
        if (item.floor == 1) {
            //暂时只显示第一层
            if (item.img) {
                sprite = makeSprite(item.name, app.map_conf.img_dir + item.img);
            } else {
                sprite = makeSprite(item.name, null);
            }
            sprite.level = item.level;
            sprite.position.set(item.x, item.y, item.z + 15);
            //微调位置
            sprite.position.x += -50;
            // sprite.position.y += -20;
            sprite.floor = item.floor;
            sprite.center = new THREE.Vector2(0.5, 0.5);
            spriteGroup.add(sprite);
        }
    });
    spriteGroup.name = "text";
    scene.add(spriteGroup);
    //spriteControl.targetSprites.push(spriteGroup);
    // console.log(spriteGroup);
}
