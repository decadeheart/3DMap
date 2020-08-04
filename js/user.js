import * as TWEEN from "../util/tween.min"; //动画操作
import * as util from "../util/util"
import * as MODEL from "../js/model";

var app = getApp();

const userControl = {
    isInitUser: false,
    userToCamera: 0,
    userDefaultPosition: { x: -5, y: 0, z: 0 },
    moveDetect: function () {
        let map = app.map
        let me = app.me
        map.stepCount += 1;
        if (map.stepCount - map.preStep > 0) {
            let distance = app.map_conf.float_mapProportion * (map.stepCount - map.preStep) * 5;
            let x = me.position.x + Math.cos(map.mapOrientation * Math.PI / 180) * distance;
            let y = me.position.y + Math.sin(map.mapOrientation * Math.PI / 180) * distance;
            if (! (app.systemControl.state === "navigating" && !app.systemControl.realMode) ) {
                userControl.changePosition(x, y, null, "direction");
                console.log('x,y',x,y);
                
            }
            map.preStep = map.stepCount;
        }
    },
    /**
     * 初始化用户
     */
    initUser: function (x, y, z) {
        let me = app.me
        userControl.isInitUser = true;

        userControl.changePosition(x, y, z, 'direction');

        me.floor = app.map.curFloor;

        userControl.changeRotation(null, null, 0);
    },
    /**
     * 改变缩放倍数
     * @param {*} scale  倍数
     */
    changeScale: function (scale) {
        if (this.isInitUser === false || map.bool_isMapModelReady === false) {
            return;
        }
        me.scale.set(scale, scale, me.scale.z);
    },
    /**
     * 用户改变旋转方向
     * @param {*} x 
     * @param {*} y 
     * @param {*} z 
     * @param {*} mode   
     */
    changeRotation: function (x, y, z, mode) {
        let me = app.me;
        if (userControl.isInitUser) {
            x = (x === null) ? me.rotation.x : x;
            y = (y === null) ? me.rotation.y : y;
            z = (z === null) ? me.rotation.z : z;
            if (mode === "animation") {
                //tweenjs类库主要用来调整和动画html5和js
                new TWEEN.Tween(me.rotation).to({ x: x, y: y, z: z }, util.dis3(me.rotation, {
                    x: x,
                    y: y,
                    z: z
                } * 100)).start();
            } else {
                me.rotation.x = x;
                me.rotation.y = y;
                me.rotation.z = z;
            }

        }
    },
    /**
     * 改变用户位置
     * @param {*} x 
     * @param {*} y 
     * @param {*} z 
     * @param {*} mode 
     * @param {*} Group 
     */
    changePosition: function (x, y, z, mode, Group) {
        let me = app.me

        if (this.isInitUser === false) {
            return;
        }
        if (typeof mode === "undefined" || mode === null) {
            mode = "direction";
        }
        let nextpoint = {
            x: (x === null) ? me.position.x : x,
            y: (y === null) ? me.position.y : y,
            z: (z === null) ? me.position.z : z
        };

        switch (mode) {
            case "direction":
                me.position.set(nextpoint.x, nextpoint.y, nextpoint.z);
                break;
            case "animation":
                let meTween = new TWEEN.Tween(me.position).to(nextpoint, util.dis3(me.position, nextpoint) * 100);
                meTween.start();
                meTween.onUpdate(function(){
                    console.log("往前走");
                })
                MODEL.animate()
                MODEL.getControl().update();
                break;
        }

    }
}

export default userControl