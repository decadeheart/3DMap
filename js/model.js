import { registerGLTFLoader } from "../util/gltf-loader"; //加载模型
import registerOrbit from "../util/orbit"; //手势操作
import * as TWEEN from "../util/tween.min"; //动画操作

//全局变量，供各个函数调用
var camera, scene, renderer, model, controls;
var app = getApp();

/**
 * @description 初始化模型并渲染到canvas中
 * @export void 导出到index.js以供调用
 * @param {*} canvas 要渲染到的canvas的位置
 * @param {*} THREE threejs引擎，用于创建场景、相机等3D元素
 */
export function renderModel() {
    let THREE = app.THREE;
    let canvas = app.canvas;
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

        //设置相机位置及注视点
        camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.5, 2000);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        camera.position.set(0, 200, 300);

        //设置灯光，当前为白色环境光
        var light = new THREE.AmbientLight(0xffffff);
        scene.add(light);

        //加载模型
        var loader = new THREE.GLTFLoader(); //根据模型类型选择相应加载器
        loader.load(
            "https://www.cleverguided.com/iLaN/3D-jxqzf/data/jxqzf_1_1.glb",
            function (gltf) {
                model = gltf.scene;
                //微调位置
                model.rotation.x += -Math.PI / 2;
                model.position.x += -60;
                model.position.y += -20;
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

        //加载手势控制器
        const { OrbitControls } = registerOrbit(THREE);
        controls = new OrbitControls(camera, renderer.domElement);
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
    let THREE = app.THREE;
    let canvas = app.canvas;
    initTween();
    animate();
    /**
     * @description 视角移动动画
     */
    function initTween() {
        new TWEEN.Tween(camera.position)
            .to({ x: 0, y: 400, z: 0 }, 1200).repeat(0).start();
    }
    /**
     * @description 渲染循环
     */
    function animate() {
        canvas.requestAnimationFrame(animate);
        renderer.render(scene, camera);
        TWEEN.update(); //更新动画，配合initTween使用
        camera.lookAt(new THREE.Vector3(0, 0, 0)); //保持注视位置不变
    }
}

function maxnum_exp2(x) {
    let position, num = 1;
    if (x !== 0) {
        for (position = 0; x !== 0; ++position) {
            x >>= 1;
        }
    }
    num = 1 << (position);

    return num;
}

function getByteLen(val) {
    let len = 0;
    for (let i = 0; i < val.length; i++) {
        let a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null) {
            len += 2;
        }
        else {
            len += 1;
        }
    }
    return len / 2;
}

function makeSprite(message, imageURL) {
    let THREE = app.THREE;
    let map_conf = app.map_conf;
    //字体类型、大小、颜色
    let fontface = "Arial"
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
    let context = canvas.getContext('2d');
    context.fillStyle = fontColor;
    context.font = fontsize + "px " + fontface;
    context.fillText(message, 0, fontsize);
    //获取文字的大小数据，高度取决于文字的大小
    let textWidth = context.measureText(message).width;
    //console.log(textWidth, height);
    //获取画布的图像信息,一个副本
    let textdata = context.getImageData(0, 0, textWidth, height);
    context.clearRect(0, 0, canvas.width, canvas.height);

    //重新设置画布的大小
    let width2 = maxnum_exp2(textWidth);
    let height2 = maxnum_exp2(height);
    canvas.width = width2;
    canvas.height = height2;
    //canvas.setAttribute("width", width2);
    //canvas.setAttribute("height", height2);
    context.putImageData(textdata, (width2 - textWidth) / 2, (height2 - height) / 2);
    //画布内容用于纹理贴图
    // let texture = new THREE.Texture(canvas);
    // texture.needsUpdate = true;
    var texture = THREE.ImageUtils.loadTexture("../style/black.jpg",null,function(t)
        {
        });
    //texture.setCrossOrigin( 'Anonymous');
    let spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: true });
    let sprite = new THREE.Sprite(spriteMaterial);
    //sprite.material.map.minFilter = THREE.LinearFilter;

    //缩放比例
    sprite.scale.set(map_conf.TargetSpriteScale * width2 / height2, map_conf.TargetSpriteScale, 1);
    sprite.initScale = { x: map_conf.TargetSpriteScale * width2 / height2, y: map_conf.TargetSpriteScale, z: 1 };
    //绘制相应图标
    // if (imageURL !== null) {
    //     let img = canvas.createImage();
    //     let imgsize = 128;
    //     img.src = imageURL;
    //     img.onload = function () {
    //         let canvas2 = app.canvasImg;
    //         let context2 = canvas2.getContext('2d');
    //         canvas2.setAttribute("width", imgsize);
    //         canvas2.setAttribute("height", imgsize);
    //         context2.drawImage(img, 0, 0, imgsize, imgsize);
    //         let imagedata = context2.getImageData(0, 0, imgsize, imgsize);
    //         let width3 = maxnum_exp2(Math.max(textWidth, imgsize));
    //         let height3 = maxnum_exp2(height + imgsize);

    //         canvas.setAttribute("width", width3);
    //         canvas.setAttribute("height", height3);
    //         context.putImageData(imagedata, (width3 - imgsize) / 2, 0);
    //         context.putImageData(textdata, (width3 - textWidth) / 2, imgsize);
    //         let texture2 = new THREE.Texture(canvas);
    //         texture2.needsUpdate = true;
    //         let spriteMaterial = new THREE.SpriteMaterial({ map: texture2, depthTest: true });
    //         sprite.material = spriteMaterial;
    //         sprite.scale.set(map_conf.TargetSpriteScale * (height3 / height2) * (width3 / height3), map_conf.TargetSpriteScale * (height3 / height2), 1);
    //         sprite.initScale = {
    //             x: sprite.scale.x,
    //             y: sprite.scale.y,
    //             z: 1
    //         };
    //     }
    // }
    return sprite;
}

export function loadTargetText() {
    let POItarget = app.POItarget;
    let THREE = app.THREE;
    let spriteGroup = new THREE.Group();
    let sprite;
    POItarget.forEach(function (item) {
        if (item.img) {
            sprite = makeSprite(item.name, app.map_conf.img_dir + item.img)
        }
        else {
            sprite = makeSprite(item.name, null);
        }
        sprite.level = item.level;
        sprite.position.set(item.x, item.y, item.z + 15);
        sprite.floor = item.floor;
        sprite.center = new THREE.Vector2(0.5, 0.5);
        spriteGroup.add(sprite);

    });
    spriteGroup.name = "text";
    scene.add(spriteGroup);
    //spriteControl.targetSprites.push(spriteGroup);
    console.log(spriteGroup)
}