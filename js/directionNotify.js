import {figureVectorAngle} from "./simNavigate"
import tts from "./tts";


let OrientationNotification = ["直行", "右前方直行", "右拐", "右后方直行", "后方直行", "左后方直行", "左拐", "左前方直行"];
let app = getApp();



function getDirectionText(index) {
    let text;
    let resultParent = app.resultParent;
    let THREE = app.THREE
    if (!!resultParent[index - 1]) {
        if(!!resultParent[index + 1]) {
            if(resultParent[index + 1].floor - resultParent[index].floor === 0&&resultParent[index].floor === resultParent[index - 1].floor) {
                let curtmpIndex = angleToDirection(figureVectorAngle(new THREE.Vector2(resultParent[index + 1].x - resultParent[index].x, resultParent[index + 1].y - resultParent[index].y),
                new THREE.Vector2(resultParent[index].x - resultParent[index - 1].x, resultParent[index].y - resultParent[index - 1].y)));
                text = OrientationNotification[curtmpIndex];

            } else if (resultParent[index + 1].floor - resultParent[index].floor < 0) {
                let i = index;
                while (i+1 < resultParent.length && resultParent[i+1].floor !== resultParent[i].floor) {
                    i= i+1;
                }
                text =  '从电梯下至' + resultParent[i].floor + '楼';
            } else if (resultParent[index + 1].floor - resultParent[index].floor > 0) {
                let i = index;
                while (i+1<resultParent.length&&resultParent[i+1].floor!==resultParent[i].floor){
                    i = i+1;
                }
                text = '从电梯上至' + resultParent[i].floor + '楼';                
            } else {
                text = "直行"; //刚上来
            } 
        } else {
            text = '已到达';
        }
    }  else if(!!resultParent[index + 1]){
        //如果index 为初始点，则index-1 为空，且index + 1不空，即至少两个点
        let i = index;
        while (i+1 < resultParent.length && resultParent[i+1].floor !== resultParent[i].floor){
            i = i+1;
        }
        if(resultParent[i].floor>resultParent[index].floor){
            text = '从电梯上至' + resultParent[i].floor + '楼';
        }else if(resultParent[i].floor<resultParent[index].floor) {
            text = '从电梯上至' + resultParent[i].floor + '楼';
        }else {text = "直行";}
    }else {text = "已到达";}
    return text;
}

/**
 * @description 根据角度算出方向
 * @date 2020-07-28
 * @param {*} angle 由两个向量算出的角度大小
 * @returns
 */
function angleToDirection(angle) {
    // console.log(angle)
    angle = parseFloat(angle)/Math.PI*180;

    if(angle>-30&&angle<30){return 0;}
    else if(angle>30&&angle<60){return 1;}
    else if(angle>60&&angle<120){return 2;}
    else if(angle>120&&angle<150){return 3;}
    else if(angle>150||angle<-150){return 4;}
    else if(angle>-150&&angle<-120){return 5;}
    else if(angle>-120&&angle<-60){return 6;}
    else {return 7;}
}


let preNearestNode;
let preText = '';

export function showOrientationText() {
    let nearestNode = findnearest2(app.me.position, app.nodeList);
    if(preNearestNode === nearestNode) {
        return;
    }

    preNearestNode = nearestNode;
    let index;
    let currtext;
    let nexttext;
    let resultParent = app.resultParent
    for(let i = 0; i < resultParent.length; i++) {
        if(resultParent[i].id === nearestNode.id) {
            index = i;
            currtext = getDirectionText(index);
            nexttext = getDirectionText(index + 1);

            let text;
            
            if(currtext === '已到达') {
                text = currtext;
            } else if(nexttext === '已到达') {
                text = currtext + '前方已到达';
            } else {
                text = currtext;
            }


            if(preText != text)
            {   
                if(!text) {
                    text = '直行'
                }
                tts(text);
                preText = text;
            }
            if(!text) {
                text = '直行'
            }
            return text;
        }
    }
}

/**
 * @description 找到距离我的当前位置最近的节点
 * @date 2020-07-28
 * @param {*} vector3
 * @param {*} nodeList 节点组
 * @returns
 */
function findnearest2(vector3, nodeList) {
    if (nodeList.length == 0) {
        alert(" no node ");
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
function CalculateNodeDis(node1, node2) {
    //勾股定理
    let a = node1.x - node2.x;
    let b = node1.y - node2.y;
    let c = node1.z - node2.z;
    let d = Math.sqrt(a * a + b * b + c * c);
    return d;
}