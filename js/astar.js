import * as MODEL from "../js/model";
import * as util from "../util/util"
var app = getApp();
/**
 * @description 导航算法
 * @date 2020-07-10
 */
var beginLi; //开始节点
var endLi; //目的节点

//算法实现
/**
 * open队列： 收集可能会需要走的路线   要走的路线放在open队列中
 * close队列： 排除掉不能走的路线        不走的路线放在close队列中
 *
 */

//可能要走的路线
var openArr = [];
//已经关闭的路线
var closeArr = [];

//最终线路数组
var resultParent = [];

/**
 * @description 得到指定id节点
 * @date 2020-07-10
 * @param {*} id 指定id
 * @param {*} nodeList 节点组
 * @returns
 */
function getObj(id, nodeList) {
    for (var i = 0; i < nodeList.length; i++) {
        if (nodeList[i].id == id) {
            return nodeList[i];
        }
    }
    return null;
}

/**
 * @description 设置开始和目的节点
 * @date 2020-07-10
 * @param {*} begin 开始下标
 * @param {*} end 结束下标
 * @param {*} nodeList 节点组
 */
function setBeginAndEndNode(begin, end, nodeList) {
    beginLi = getObj(begin, nodeList);
    endLi = getObj(end, nodeList);
}

/**
 * @description 初始化
 * @date 2020-07-10
 */
function initnode(nodeList) {
    for (var i = 0; i < nodeList.length; i++) {
        nodeList[i].gn = 0;
        nodeList[i].num = 0;
        nodeList[i].parent = null;
    }
    openArr = [];
    closeArr = [];
    resultParent = [];
}


/**
 * @description 1.把open队列中的元素移到close队列中，表示起始节点已经走过了
 *              2.把起始位置周围的 8 个点都找出来 并且 计算出 估价函数值最低的那个元素  那么这个元素就是接下来要走的这步
 *              3.接下来走的这步确定了 那么就又该把这个位置的点移动到 close队列中，然后继续找周围的点 并且进行估价   以此类推
 * @date 2020-07-13
 * @returns
 */
function openFn(nodeList){
    /** nodeLi表示当前open队列中的元素，也就是说先去除第一个起始节点
     * shift把数组中第一个元素删除，并且返回这个被删除元素
     */
    var nodeLi = openArr.shift();
    if (nodeLi === null) alert("没有目标点");

    //如果nodeLi和endLi一样了，那么证明已经走到目标点了，这时候需要停止调用
    if(nodeLi === endLi) {
        return;
    }

    //把open队列中删除的元素 添加到close队列中
    closeFn(nodeLi);

    //接下来需要找到nodeLi周围的点
    findLi(nodeLi, nodeList);

    //经过上步 已经能够找到相邻的元素， 接下来要对这些元素的估值进行排序
    openArr.sort(function (li1, li2) {
        return li1.num - li2.num;
    })

    //进行递归操作 找到下一步需要走的节点 在这个过程中，也需要执行相同的步骤，那就是查找相邻的节点
    openFn(nodeList);

}

/**
 * @description open队列中删除的元素 被push到close队列中
 * @date 2020-07-13
 * @param {*} nodeLi
 */
function closeFn(nodeLi) {
    closeArr.push(nodeLi);
}

/**
 * @description 计算当前节点到目标点的实际代价
 * @date 2020-07-13
 * @param {*} nowLi
 * @returns
 */
function now2End(nowLi) {
    //勾股定理
    let a = nowLi.x - endLi.x;
    let b = nowLi.y - endLi.y;
    let c = nowLi.z - endLi.z;
    return Math.sqrt(a * a + b * b + c * c);    
}

/**
 * @description 股价函数
 * @date 2020-07-13
 * @param {*} nowLi
 * @param {*} fathernode
 * @returns
 */
function fn(nowLi, fathernode) {
    return fathernode.gn + util.CalculateNodeDis(nowLi, fathernode) + now2End(nowLi);
}

/**
 * @description 查找某个节点周围的节点
 * @date 2020-07-13
 * @param {*} nodeLi
 */
function findLi(nodeLi, nodeList) {
    for (var i = 0; i < nodeLi.path.length; i++){
        var curnode = getObj(nodeLi.path[i], nodeList);

        if(filter(curnode, nodeLi)) {
            curnode.num = fn(curnode, nodeLi);
            curnode.gn = nodeLi.gn + util.CalculateNodeDis(curnode, nodeLi);
            curnode.parent = nodeLi;
            openArr.push(curnode);
        }
    }
}

/**
 * @description 接收到一个node 判断是否已经处理 如果是 返回false 如果不是返回true
 * @date 2020-07-13
 * @param {*} nodeLi
 * @param {*} prenode
 * @returns
 */
function filter(nodeLi, prenode) {

    /** 循环close队列中的所有元素，与传过来的节点进行比对 如果比对成功返回false */
    for(var i = 0; i<closeArr.length; i++){
        if(nodeLi === closeArr[i]) {
            return false;
        }
    }

    /** 判断是否存在于开放队列，若存在比对GN值，更新当前代价 */
    for(var i = 0; i < openArr.length; i++){
        if(nodeLi === openArr[i]){
            if(prenode.gn + util.CalculateNodeDis(nodeLi,prenode) < nodeLi.gn){
                nodeLi.gn = prenode.gn + util.CalculateNodeDis(nodeLi, prenode);
                nodeLi.parent = prenode;
            }
            return false;
        }
    }

    return true;
}

/**
 * @description 找到上一次走过的节点
 * @date 2020-07-13
 * @param {*} li
 * @returns
 */
function findParent(li) {
    /** 在数组头部插入元素 */
    resultParent.unshift(li);
    if (li == beginLi) return;

    findParent(li.parent);
}

/**
 * @description 初始化导航函数
 * @date 2020-07-13
 * @returns
 */
function navigation(nodeList) {
    initnode(nodeList);

    if (beginLi.id === endLi.id){
        resultParent.push(endLi);
        return;
    }

    openArr.push(beginLi);

    openFn(nodeList);
    let lastLi = closeArr.pop();
    //查找弹出节点的父亲节点，加入结果数组
    findParent(lastLi);

    resultParent.push(endLi);

}
/**
 * @description 点击后开始导航
 * @date 2020-07-13
 * @param {*} nodeList
 */
function navigate(nodeList, start, end) {

    app.meBeforNav = app.me;
    console.log(app.meBeforNav);
    let startNode = util.findnearest2(start, nodeList);
    let endNode = util.findnearest2(end, nodeList);


    setBeginAndEndNode(startNode.id, endNode.id, nodeList);
    navigation(nodeList);
    console.log("结果: ", resultParent);
    app.resultParent = resultParent;

    MODEL.createPathTube(resultParent);

    let distance = (resultParent[resultParent.length - 1].gn * app.map_conf.float_mapProportion).toFixed(1);
    let distancetext = "全长" + distance + "米 大约" + (distance * 0.016).toFixed(1) + "分钟";
    
    return distancetext;
}


export default navigate;
