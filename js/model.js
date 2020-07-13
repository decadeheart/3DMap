import { registerGLTFLoader } from "../util/gltf-loader"; //加载模型
import registerOrbit from "../util/orbit"; //手势操作
import * as TWEEN from "../util/tween.min"; //动画操作

//全局变量，供各个函数调用
var camera, scene, renderer, model, controls;

/**
 * @description 初始化模型并渲染到canvas中
 * @export void 导出到index.js以供调用
 * @param {*} canvas 要渲染到的canvas的位置
 * @param {*} THREE threejs引擎，用于创建场景、相机等3D元素
 */
export function renderModel(canvas, THREE) {
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
export function cameraExchange(canvas, THREE) {
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
