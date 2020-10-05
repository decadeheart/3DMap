//关于精灵的各类操作

let app = getApp();

/**
 * @description 创建文字精灵
 * @param {*} message 文字信息
 * @returns 返回创建完成的精灵
 */
function makeFontSprite(message) {
    //为全局变量改名
    let map = app.map;
    let THREE = app.THREE;
    //获取canvas上下文
    let canvas = app.canvasSprite;
    console.log("canvas0", canvas);
    
    let context = canvas.getContext("2d");
    //字体类型、大小、颜色
    let fontface = "Arial";
    let fontsize = 60;
    let fontColor = "#000000";
    //文字高度（只考虑一行）
    let height = 144;
    //获取文字长度作为宽度
    let width = context.measureText(message).width;
    //设置canvas宽高（调整大小后canvas内容被清除）
    canvas.width = width;
    canvas.height = height;
    //添加白色背景
    // context.fillStyle = "#FFFFFF";
    // context.fillRect(0, 0, canvas.width, canvas.height);
    //在画布上创建字体原型
    context.fillStyle = fontColor;
    context.font = fontsize + "px " + fontface;
    context.fillText(message, 0, fontsize);
    //将canvas转换为图片，方便进行纹理贴图（canvas直接贴图会报没有相应转换函数的错误）
    let dataUrl = canvas.toDataURL("../img/word.png");
    //加载纹理并创建材质
    let texture = new THREE.TextureLoader().load(dataUrl);
    let spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: true,
    });
    //创建精灵
    let sprite = new THREE.Sprite(spriteMaterial);
    //这句为了防止warning
    sprite.material.map.minFilter = THREE.LinearFilter;
    //缩放比例
    sprite.scale.set((map.fontSpriteScale * width) / height , map.fontSpriteScale, 1);
    sprite.initScale = {
        x: (map.fontSpriteScale * width) / height ,
        y: map.fontSpriteScale,
        z: 1,
    };
    //通过重设canvas大小清空内容
    canvas.width = 0;
    //销毁threejs元素
    texture.dispose();
    texture = null;
    spriteMaterial.dispose();
    spriteMaterial = null;
    return sprite;
}
/**
 * @description 创建图片精灵
 * @param {*} imageURL 图片地址
 * @returns 返回创建完成的精灵
 */
function makeImgSprite(imageURL) {
    //为全局变量改名
    let map = app.map;
    let THREE = app.THREE;
    let texture = new THREE.TextureLoader().load(imageURL);
    let material = new THREE.SpriteMaterial({ map: texture, depthTest: true });
    let sprite = new THREE.Sprite(material);
    sprite.scale.set(map.imgSpriteScale / 2, map.imgSpriteScale / 2, 1);
    sprite.initScale = {
        x: map.imgSpriteScale / 2,
        y: map.imgSpriteScale / 2,
        z: 1,
    };
    sprite.img = true;
    return sprite;
}
/**
 * @description 加载指定层名称及图标精灵并显示在scene中
 * @export
 * @param {*} scene 场景
 * @param {*} floor 楼层
 */
export function loadTargetTextByFloor(scene, floor) {
    //为全局变量改名
    let POItarget = app.POItarget;
    let THREE = app.THREE;
    //创建精灵组
    let spriteGroup = new THREE.Group();
    let sprite;
    //添加精灵到精灵组
    POItarget.forEach(function (item) {
        if (item.floor == floor) {
            if (item.img) {
                sprite = makeImgSprite(app.map.img_dir + item.img);
            } else {
                sprite = makeFontSprite(item.name);
            }
            //设置参数
            sprite.level = item.level;
            sprite.position.set(item.x, item.y, item.z + 5);
            sprite.floor = item.floor;
            sprite.center = new THREE.Vector2(0.5, 0.5);
            spriteGroup.add(sprite);
        }
    });
    spriteGroup.name = "sprite" + floor;
    scene.add(spriteGroup);
    app.spriteControl.targetSprites.push(spriteGroup);
    spriteGroup = null;
}
//为了提高加载性能，暂不使用该函数
/**
 * @description 加载所有地点名称及图标精灵并显示在scene中
 * @export
 * @param {*} scene 场景
 * @param {*} floor 楼层
 */
export function loadAllTargetText(scene) {
    //为全局变量改名
    let POItarget = app.POItarget;
    let THREE = app.THREE;
    //创建精灵组
    let spriteGroup = new THREE.Group();
    let sprite;
    //添加精灵到精灵组
    POItarget.forEach(function (item) {
        if (item.img) {
            sprite = makeImgSprite(app.map.img_dir + item.img);
        } else {
            sprite = makeFontSprite(item.name);
        }
        //设置参数
        sprite.level = item.level;
        sprite.position.set(item.x, item.y, item.z + 5);
        sprite.floor = item.floor;
        sprite.center = new THREE.Vector2(0.5, 0.5);
        spriteGroup.add(sprite);
    });
    spriteGroup.name = "displayAllFloor";
    scene.add(spriteGroup);
    spriteGroup = null;
}
//暂时未用到下面的函数
/**
 * @description 清除threejs中的元素，释放缓存
 * @param {*} parent 被清除的元素所在的父元素
 * @param {*} child 要被清除的元素
 */
function disposeObj(parent, child) {
    let THREE = app.THREE;
    if (child.children.length) {
        let arr = child.children.filter((x) => x);
        arr.forEach((a) => {
            disposeObj(child, a);
        });
    }
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Sprite) {
        if (child.material.map) {
            child.material.map.dispose();
        }
        child.material.dispose();
        child.geometry.dispose();
    } else if (child.material) {
        child.material.dispose();
    }
    child.remove();
    parent.remove(child);
    child = null;
}
