import * as TWEEN from "../util/tween.min"; //动画操作
import * as MODEL from "../js/model";
import userControl from "./user"; //用户贴图


var app = getApp();


/**
 * @description 模拟导航当中的自己转弯和向前移动
 * @date 2020-07-24
 * @export
 * @param {*} path
 * @returns
 */
export function autoMoving(path) {
    /** 如果路径当中只有两点和一点的情况 */
    if (path.length < 1) {
        return;
    }else if (path.length < 2) {
        userControl.changePosition(path[0].x, path[0].y, null, "direction");
        return;
    }
    MODEL.addUser();
    let me =app.me
    let THREE = app.THREE
    /** 首先从我的当前位置移动到导航路径的起点 */

    new TWEEN.Tween(me.position).to({
        x: path[0].x,
        y: path[0].y,
        z: me.position.z
    },
    dis3(me.position, path[0]) * 100
    ).onStop(rotate(0)).start();

    //userControl.changePosition(path[0].x,path[0].y, me.position.z, "animation");
    MODEL.animate()

    /**
     * @description 在导航路径上图标向前移动
     * @date 2020-07-24
     * @param {*} i
     * @returns
     */
    function move(i) {
        if( i===path.length) {return;}

        new TWEEN.Tween(me.position).to({
            x: path[i].x,
            y: path[i].y,
            z: path[i].z + app.map_conf.int_userheight
        }, dis3(path[i - 1], path[i]) * 200)
            .onStart(function () {

            }).onComplete(function () {
                //结束时朝向和路的方向一致
                rotate(i);
            }).start()
    }

    /**
     * @description 旋转当前方向
     * @date 2020-07-24
     * @param {*} i
     * @returns
     */
    function rotate(i) {

        if(i===path.length-1){return;}

        let angle = figureVectorAngle(new THREE.Vector2(0, 1), new THREE.Vector2(path[i+1].x - path[i].x,
            path[i+1].y - path[i].y));
        console.log('角度',angle)
        if (angle < 0) {
            angle += Math.PI * 2;
        }

        let A = null;
        if(angle - me.rotation.z>Math.PI){
            // alert("ccs")
            A = new TWEEN.Tween(me.rotation).to({
                    x: me.rotation.x,
                    y: me.rotation.y,
                    z: 0
                },
                Math.abs(me.rotation.z - 0) / Math.PI * 1000
            ).onStart(function () {

            }).onComplete(function () {

                me.rotation.z = Math.PI*2;

                rotate(i)
            })
        }else if(angle - me.rotation.z<-Math.PI){

            A = new TWEEN.Tween(me.rotation).to({
                    x: me.rotation.x,
                    y: me.rotation.y,
                    z: Math.PI*2
                },
                Math.abs(me.rotation.z - Math.PI*2) / Math.PI * 1000
            ).onComplete(function () {
                me.rotation.z = 0;
                rotate(i);
            }).onStart(function () {

            })
        }else{
            A = new TWEEN.Tween(me.rotation).to({
                    x: me.rotation.x,
                    y: me.rotation.y,
                    z: angle
                },
                Math.abs(me.rotation.z - angle) / Math.PI * 1000
            ).onComplete(function () {



                move(i+1);
            }).onStart(function () {

                if(Math.abs(me.rotation.z - angle)===0){

                }
            });
        }
        if(A!==null){
            A.start();

        }else {
            // B.start();

        }
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
 * @description 计算两个向量之间的夹角，确定旋转的角度
 * @date 2020-07-24
 * @param {*} v1
 * @param {*} v2
 * @returns
 */
function figureVectorAngle(v1, v2) {
    //v1,v2 must be Three.Vector2
    if(v1.length() === 0 || v2.length() === 0) {return 0;}
    let res = Math.acos(v1.dot(v2) / (v1.length() * v2.length()));
    //若结果为正，则向量v2在v1的逆时针方向 返回值为弧度
    return v1.cross(v2) > 0 ? res : -res;
}