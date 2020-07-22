import * as TWEEN from "../util/tween.min"; //动画操作
var THREE, camera, canvas;
export var cameraControl = {
    preX: 0,
    preY: 0,
    preAngle: 0,
    preScale: 1,
    preZoom: 1,
    cameraZoom: 2.5,
    dragSpeed: 0.1,
    relativeCoordinate: { x: 0, y: 0, z: 1000 },
    focusPoint: { x: 0, y: 0, z: 0 },
    disToFocus: 0,
    trackPoint: { x: null, y: null, z: null },
    type: 0,
    viewH: 0,
    viewW: 0,
    isExchanging: false,
    setPosition: function (x, y, z, mode) {
        x = x === null ? camera.position.x : x;
        y = y === null ? camera.position.y : y;
        z = z === null ? camera.position.z : z;
        if (mode === "animation") {
            TweenControl.cameraTween = new TWEEN.Tween(camera.position)
                .to(
                    {
                        x: x,
                        y: y,
                        z: z,
                    },
                    500
                )
                .start();
        } else {
            camera.position.set(x, y, z);
        }
    },
    getPosition: function () {
        let x = camera.position.x !== null ? camera.position.x : 0;
        let y = camera.position.y !== null ? camera.position.y : 0;
        let z = camera.position.z !== null ? camera.position.z : 1000;
        return { x: x, y: y, z: z };
    },
    setFocus: function (x, y, z) {
        this.focusPoint.x = x === null ? this.focusPoint.x : x;
        this.focusPoint.y = y === null ? this.focusPoint.y : y;
        this.focusPoint.z = z === null ? this.focusPoint.z : z;
    },
    setUp: function (x, y, z) {
        camera.up.x = x === null ? camera.up.x : x;
        camera.up.y = y === null ? camera.up.y : y;
        camera.up.z = z === null ? camera.up.z : z;
    },
    lookFocus: function () {
        camera.lookAt(new THREE.Vector3(this.focusPoint.x, this.focusPoint.y, this.focusPoint.z));
    },
};

export var initCamera = (three, CANVAS) => {
    THREE = three;
    canvas = CANVAS;
    return initPerspectiveCamera();
    // return  initOrthographicCamera()
}

function initPerspectiveCamera() {
    if (camera instanceof THREE.OrthographicCamera) {
        let zoom = camera.zoom;
        cameraControl.relativeCoordinate.z =
            cameraControl.relativeCoordinate.z / (zoom / cameraControl.cameraZoom);
    }
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 5000);
    camera.zoom = 2.5;
    cameraControl.setPosition(
        cameraControl.focusPoint.x + cameraControl.relativeCoordinate.x,
        cameraControl.focusPoint.y + cameraControl.relativeCoordinate.y,
        cameraControl.focusPoint.z + cameraControl.relativeCoordinate.z
    );
    cameraControl.setUp(0, 0, 1);
    cameraControl.lookFocus();
    camera.updateProjectionMatrix();
    return camera;
}

function initOrthographicCamera() {
    let position = cameraControl.getPosition();
    let x = position.x;
    let y = position.y;
    let z = position.z;
    let h = Math.tan(((camera.fov / 2) * Math.PI) / 180) * (position.z - cameraControl.focusPoint.z);
    let w = h * camera.aspect;
    camera = new THREE.OrthographicCamera(
        -cameraControl.viewW,
        cameraControl.viewW,
        cameraControl.viewH,
        -cameraControl.viewH,
        1,
        5000
    );
    // camera.zoom = cameraControl.viewH / h;
    cameraControl.cameraZoom = camera.zoom;
    camera.view = { width: 2 * w, height: 2 * h };
    cameraControl.setPosition(x, y, z);
    cameraControl.setUp(0, 0, 1);
    cameraControl.lookFocus();
    camera.updateProjectionMatrix();
    return camera;
}

export function cameraExchange(index) {
    // onlyDisplayFloor(map.curFloor);
    if (cameraControl.isExchanging === true) {
        return;
    }
    cameraControl.relativeCoordinate.x = camera.position.x - cameraControl.focusPoint.x;
    cameraControl.relativeCoordinate.y = camera.position.y - cameraControl.focusPoint.y;
    cameraControl.relativeCoordinate.z = camera.position.z - cameraControl.focusPoint.z;

    // let sys = systemControl.state;
    if (index == 2) {
        cameraControl.isExchanging = true;
        // initOrthographicCamera(camera.position);
        let distance = dis3(cameraControl.relativeCoordinate, { x: 0, y: 0, z: 0 });
        let v = new THREE.Vector2(
            cameraControl.relativeCoordinate.x,
            cameraControl.relativeCoordinate.y
        ).normalize();
        let tween = new TWEEN.Tween(camera.position)
            .to(
                {
                    x: cameraControl.focusPoint.x + v.x,
                    y: cameraControl.focusPoint.y + v.y,
                    z: distance + cameraControl.focusPoint.z,
                },
                ((distance - cameraControl.relativeCoordinate.z) / distance) * 3000
            )
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onStart(function () { })
            .onComplete(function () {
                camera = initOrthographicCamera(camera.position);
                cameraControl.isExchanging = false;
            })
            .start();
    }
    if (index == 3) {
        camera = initPerspectiveCamera();
        let distance = dis3(cameraControl.relativeCoordinate, { x: 0, y: 0, z: 0 });

        let v = new THREE.Vector2(
            cameraControl.relativeCoordinate.x,
            cameraControl.relativeCoordinate.y
        ).normalize();
        let tween = new TWEEN.Tween(camera.position)
            .to({
                x: cameraControl.focusPoint.x + (v.x * distance) / Math.sqrt(2),
                y: cameraControl.focusPoint.y + (v.y * distance) / Math.sqrt(2),
                z: distance / Math.sqrt(2) + cameraControl.focusPoint.z,
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onStart(function () {
                cameraControl.isExchanging = true;
            })
            .onComplete(function () {
                cameraControl.isExchanging = false;
            })
            .start();
    }
    return camera;

}

var dis3 = (d1, d2) => {
    let x = (d1.x - d2.x) ** 2;
    let y = (d1.y - d2.y) ** 2;
    let z = (d1.z - d2.z) ** 2;
    return Math.sqrt(x + y + z);
}

function dragCamera(ev) {
    let dx =
        (ev.x - cameraControl.preX) *
        cameraControl.dragSpeed *
        ((camera.position.z - (map.curFloor - 1) * map_conf.layerHeight) / 100); //that means drag distance*cameraControl.dragspeed
    let dy =
        (ev.y - cameraControl.preY) *
        cameraControl.dragSpeed *
        ((camera.position.z - (map.curFloor - 1) * map_conf.layerHeight) / 100); //that means drag distance*cameraControl.dragspeed
    let v3 = new THREE.Vector3();
    v3 = camera.getWorldDirection(); // direct vector of camera`s eyes
    let v2 = new THREE.Vector2(v3.x, v3.y).normalize();
    if (v2.x === 0 && v2.y === 0) {
        v2 = new THREE.Vector2(
            -cameraControl.relativeCoordinate.x,
            -cameraControl.relativeCoordinate.y
        ).normalize();
    }
    let ax = v2.x.toFixed(4); //the camera view direction
    let ay = v2.y.toFixed(4);
    if (camera instanceof THREE.PerspectiveCamera) {
    }

    let x0 = camera.position.x;
    let y0 = camera.position.y;
    let bx; //vector b is vertical to a
    let by;
    let result = { x: 0, y: 0 }; //result we need
    if (ax == 0) {
        //can not use ===
        if (ay < 0) {
            bx = -1;
            by = 0;
        } else {
            bx = 1;
            by = 0;
        }
    } else if (ay == 0) {
        //can not use ===
        if (ax < 0) {
            bx = 0;
            by = 1;
        } else {
            bx = 0;
            by = -1;
        }
    } else {
        bx = 1 / Math.sqrt(1 + (ax * ax) / (ay * ay));
        by = (-ax / ay) * bx;
        if (ax > 0 && ay > 0) {
            //limit b is on right of a`s positive direction
            bx = Math.abs(bx);
            by = -Math.abs(by);
        } else if (ax > 0 && ay < 0) {
            bx = -Math.abs(bx);
            by = -Math.abs(by);
        } else if (ax < 0 && ay < 0) {
            bx = -Math.abs(bx);
            by = Math.abs(by);
        } else {
            bx = Math.abs(bx);
            by = Math.abs(by);
        }
    }
    result.x = bx * -dx + ax * dy + x0; //coordinate transformation
    result.y = by * -dx + ay * dy + y0;
    if (isNaN(result.y)) {
        console.log(by, dx, ay, dy, y0);
        alert("c");
    }
    camera.position.x = result.x;
    camera.position.y = result.y;
    cameraControl.setPosition(result.x, result.y, null, "direction");
    cameraControl.setUp(0, 0, 1);
    cameraControl.focusPoint.x += result.x - x0;
    cameraControl.focusPoint.y += result.y - y0;
    cameraControl.preX = ev.x;
    cameraControl.preY = ev.y;
}