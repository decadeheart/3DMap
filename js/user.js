import * as TWEEN from "../util/tween.min"; //动画操作
var app = getApp();

/**
 * @description 勾股定理计算距离
 * @date 2020-07-16
 * @param {*} nowLi 当前角度
 * @param {*} nowLi2 目标角度
 * @returns
 */
function dis3(nowLi, nowLi2) {
    //勾股定理
    let a = nowLi.x - nowLi2.x;
    let b = nowLi.y - nowLi2.y;
    let c = nowLi.z - nowLi2.z;
    return Math.sqrt(a * a + b * b + c * c);
}

const userControl = {
    isInitUser: false,
    userToCamera: 0,
    userDefaultPosition: { x: -5, y: 0, z: 0 },
    moveDetect: function () {
        let map = app.map
        let me = app.me
        map.stepCount += 1;
        if (map.stepCount - map.preStep > 0) {
            let distance = app.map_conf.float_mapProportion * (map.stepCount - map.preStep) * 0.5;
            let x = me.position.x + Math.sin(map.mapOrientation * Math.PI / 180) * distance;
            let y = me.position.y + Math.cos(map.mapOrientation * Math.PI / 180) * distance;
            // if (! app.systemControl.isStimulation() ) {
            //     userControl.changePosition(x, y, null, "animation");
            // }
            userControl.changePosition(x, y, null, "animation");
            map.preStep = map.stepCount;
        }
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
        let me = app.me
        if (userControl.isInitUser) {
            x = (x === null) ? me.rotation.x : x;
            y = (y === null) ? me.rotation.y : y;
            z = (z === null) ? me.rotation.z : z;
            if (mode === "animation") {
                //tweenjs类库主要用来调整和动画html5和js
                console.log(123);
                new TWEEN.Tween(me.rotation).to({ x: x, y: y, z: z }, dis3(me.rotation, {
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
                console.log(me.position);
                break;
            case "animation":
                let meTween = new TWEEN.Tween(me.position).to(nextpoint, dis3(me.position, nextpoint) * 100);
                meTween.start();
                //meTween.update();
                break;
        }

    },
    /**
     * 初始化用户
     */
    initUser: function () {
        let me = app.me
        userControl.isInitUser = true;
        userControl.changePosition(userControl.userDefaultPosition.x, userControl.userDefaultPosition.y, (app.map.curFloor - app.map.curFloor) * app.map_conf.layerHeight + app.map_conf.int_userHeight, 'direction');
        me.name = 'user';
        me.floor = app.map.curFloor;
        //userControl.changeRotation(null, null, Math.PI * 2 - (Math.PI / 180) * (app.map.mapOrientation));
        userControl.changeRotation(null, null, Math.PI / 2);
    }
}

export default userControl