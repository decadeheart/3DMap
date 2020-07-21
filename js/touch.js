touchpoint = { startx1: 0, starty1: 0, startx2: 0, starty2: 0 };

//根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
function getDrag(startx, starty, endx, endy) {
    var angx = endx - startx;
    var angy = endy - starty;
    var result = 0;

    //如果滑动距离太短
    if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
        return result;
    }

    var angle = (Math.atan2(angy, angx) * 180) / Math.PI;
    if (angle >= -135 && angle <= -45) {
        result = 1;
    } else if (angle > 45 && angle < 135) {
        result = 2;
    } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
        result = 3;
    } else if (angle >= -45 && angle <= 45) {
        result = 4;
    }

    return result;
}
//手指接触屏幕
function firstTouch(e) {
    if (e.touches.length > 1) {
        touchpoint.startx1 = e.touches[0].pageX;
        touchpoint.starty1 = e.touches[0].pageY;
        touchpoint.startx2 = e.touches[1].pageX;
        touchpoint.starty2 = e.touches[1].pageY;
    }
}

//手指离开屏幕

function twodrag(e) {
    if (camera instanceof THREE.OrthographicCamera) {
        return;
    }
    if (e.touches.length > 1) {
        var endx1, endy1, endx2, endy2;
        endx1 = e.changedTouches[0].pageX;
        endy1 = e.changedTouches[0].pageY;
        endx2 = e.changedTouches[1].pageX;
        endy2 = e.changedTouches[1].pageY;

        var direction1 = getDrag(touchpoint.startx1, touchpoint.starty1, endx1, endy1);
        var direction2 = getDrag(touchpoint.startx2, touchpoint.starty2, endx2, endy2);

        if (direction1 == direction2) {
            switch (direction1) {
                case 0:
                    break;
                case 1:
                    twofiguresdragCamera(-0.03);
                    break;
                case 2:
                    twofiguresdragCamera(0.03);
                    break;

                default:
            }
        }
        touchpoint.startx1 = e.changedTouches[0].pageX;
        touchpoint.starty1 = e.changedTouches[0].pageY;
        touchpoint.startx2 = e.changedTouches[1].pageX;
        touchpoint.starty2 = e.changedTouches[1].pageY;
    }
}
function twofiguresdragCamera(delta) {
    let distance = dis3(camera.position, cameraControl.focusPoint);
    let vec = new THREE.Vector2(
        camera.position.x - cameraControl.focusPoint.x,
        camera.position.y - cameraControl.focusPoint.y
    ).normalize();
    let hei = camera.position.z - cameraControl.focusPoint.z;
    let ang = Math.asin(hei / distance);
    if ((ang < Math.PI / 2 - 0.1 && delta > 0) || (ang > 0.1 && delta < 0)) {
        ang += delta;

        camera.position.z = cameraControl.focusPoint.z + Math.sin(ang) * distance;
        camera.position.x = cameraControl.focusPoint.x + Math.cos(ang) * distance * vec.x;
        camera.position.y = cameraControl.focusPoint.y + Math.cos(ang) * distance * vec.y;
        camera.lookAt(
            new THREE.Vector3(
                cameraControl.focusPoint.x,
                cameraControl.focusPoint.y,
                cameraControl.focusPoint.z
            )
        );
    }
}
// scope.domElement.addEventListener('touchstart', onTouchStart, false);
// scope.domElement.addEventListener('touchend', onTouchEnd, false);
// scope.domElement.addEventListener('touchmove', onTouchMove, false);