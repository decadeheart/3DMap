import * as TWEEN from "../util/tween.min"; //动画操作
var app = getApp();

const userControl = {
    isInitUser: false,
    userToCamera: 0,
    userDefaultPosition: {x: -5, y: 0, z: 0},
    moveDetect: function () {
        map.stepCount += 1;
        if (map.stepCount - map.preStep > 0) {
            let distance = map_conf.float_mapProportion * (map.stepCount - map.preStep) * 0.5;
            let x = me.position.x + Math.sin(map.mapOrientation * Math.PI / 180) * distance;
            let y = me.position.y + Math.cos(map.mapOrientation * Math.PI / 180) * distance;
            if (!systemControl.isStimulation()) {
                userControl.changePosition(x, y, null, "direction");
            }
            map.preStep = map.stepCount;
        }
    },
    changeScale: function (scale) {
        if (this.isInitUser === false || map.bool_isMapModelReady === false) {
            return;
        }
        me.scale.set(scale, scale, me.scale.z);
    },
    changeRotation: function (x, y, z, mode) {
        if (userControl.isInitUser) {
            x = (x === null) ? me.rotation.x : x;
            y = (y === null) ? me.rotation.y : y;
            z = (z === null) ? me.rotation.z : z;
            if (mode === "animation") {
                //tweenjs类库主要用来调整和动画html5和js
                new TWEEN.Tween(me.rotation).to({x: x, y: y, z: z}, dis3(me.rotation, {
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
                let meTween;
                meTween = new TWEEN.Tween(me.position).to(nextpoint, dis3(me.position, nextpoint) * 100);
                meTween.start();
                return meTween;
                // if (TweenControl.preLocationTween != null) {
                //     TweenControl.preLocationTween.chain(meTween);
                // }else {
                //     meTween.start();
                // }

                break;
        }

    }
}

export default userControl