/**
 * @description 三维勾股定理
 * @param {*} nowLi 节点1
 * @param {*} nowLi2 节点2
 * @returns 
 */
export function dis3(nowLi, nowLi2) {
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
export function figureVectorAngle(v1, v2) {
    //v1,v2 must be Three.Vector2
    if (v1.length() === 0 || v2.length() === 0) { return 0; }
    let res = Math.acos(v1.dot(v2) / (v1.length() * v2.length()));
    //若结果为正，则向量v2在v1的逆时针方向 返回值为弧度
    return v1.cross(v2) > 0 ? res : -res;
}

/**
 * @description 复制一个对象到另一个对象
 * @date 2020-07-14
 * @param {*} oldObj
 * @returns
 */
export function cloneObj(oldObj) {
    if (typeof oldObj != "object") return oldObj;
    if (oldObj == null) return oldObj;
    var newObj = new Object();
    for (var i in oldObj) newObj[i] = cloneObj(oldObj[i]);
    return newObj;
}
/**
 * @description 扩展对象
 * @date 2020-07-14
 */
export function extendObj() {
    var args = arguments;
    if (args.length < 2) return;
    var temp = cloneObj(args[0]); //调用复制对象方法
    for (var n = 1; n < args.length; n++) {
        for (var i in args[n]) {
            temp[i] = args[n][i];
        }
    }
    return temp;
}

/**
 * @description 找到距离我的当前位置最近的节点
 * @date 2020-07-28
 * @param {*} vector3
 * @param {*} nodeList 节点组
 * @returns
 */
export function findnearest2(vector3, nodeList) {
    if (nodeList.length == 0) {
        return;
    }
    nodeList.sort(function (a, b) {
        return CalculateNodeDis(a, vector3) - CalculateNodeDis(b, vector3);
    });
    let nearnode = nodeList[0];
    return nearnode;
}

/**
 * @description 计算代价
 * @date 2020-07-28
 * @param {*} node1 两个节点
 * @param {*} node2
 * @returns
 */
export function CalculateNodeDis(node1, node2) {
    //勾股定理
    let a = node1.x - node2.x;
    let b = node1.y - node2.y;
    let c = node1.z - node2.z;
    let d = Math.sqrt(a * a + b * b + c * c);
    return d;
}

/**
 * @description 函数节流
 * @param {*} fn 需要节流的函数
 * @param {*} interval 等待时间
 * @returns
 */
var cnt = 0;
export function throttle(fn, interval) {
    var enterTime = 0;//触发的时间
    var gapTime = interval || 300;//间隔时间，如果interval不传，则默认300ms

    return function (...args) {
        cnt++;
        // console.log(cnt);
        if (cnt > 4) {
            wx.showToast({
                title: "慢一点嘛，人家反应不过来啦o(╥﹏╥)o",
                icon: "none",
                image: "",
                duration: 1500,
                mask: true,
            });
        }
        var context = this;
        var backTime = new Date();//第一次函数return即触发的时间
        if (backTime - enterTime > gapTime) {
            fn.call(context, ...args);
            enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
            cnt = 0;
        }
    };
}