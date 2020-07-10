
/**
 * @description 导航算法
 * @date 2020-07-10
 */
var beginLi; //开始节点
var endLi;   //目的节点

//算法实现
/**
 * open队列： 收集可能会需要走的路线   要走的路线放在open队列中
 * close队列： 排除掉不能走的路线        不走的路线放在close队列中
 *
 */

 //当前定位节点  路径为空
var yournode;
//可能要走的路线
var openArr = []
//已经关闭的路线
var closeArr = []

//最终线路数组
var resultParent = [];

/**
 * @description 得到指定iid节点
 * @date 2020-07-10
 * @param {*} id 指定id
 * @param {*} nodeList 节点组
 * @returns
 */
function getObj (id, nodeList){
    for(var i=0; i < nodeList.length; i++){
        if (nodeList[i].id == id){
            return nodeList[i]
        } 
    }
    alert("null" + ":" + id)
    return null
}


/**
 * @description 设置开始和目的节点
 * @date 2020-07-10
 * @param {*} begin 开始下标
 * @param {*} end 结束下标
 * @param {*} nodeList 节点组
 */
function setBeginAndEndNode (begin, end, nodeList) {
    beginLi = getObj(begin, nodeList);
    endLi = getObj(end, nodeList);

}


/**
 * @description 在三维空间中用勾股定理计算两个节点之间的距离
 * @date 2020-07-10
 * @param {*} node1 节点一
 * @param {*} node2 节点二
 * @returns
 */
function CalculateNodeDis (node1, node2){
    let a = node1.x - node2.x
    let b = node1.y - node2.y
    let c = node1.z - node2.z
    let d = Math.sqrt(a * a + b * b + c * c);
    return d;
}


/**
 * @description 根据距离排序，算出离当前节点最近的节点
 * @date 2020-07-10
 * @param {*} vector3 当前节点
 * @param {*} nodeList 节点组
 * @returns
 */
function findnearest2 (vector3, nodeList) {

    if(nodeList.length == 0){
        alert(" no node ");
        return;
    }

    nodeList.sort(function (a,b){
        return CalculateNodeDis(a, vector3) - (b, vector3)
    })

    let nearnode = nodeList[0];
    return nearnode;
}
/**
 * @description 初始化
 * @date 2020-07-10
 */
function initnode() {
    openArr = [];
    closeArr = [];
    resultParent = [];
}

function navigation() {

    initnode();

}


module.exports = {
    setBeginAndEndNode: setBeginAndEndNode
}
