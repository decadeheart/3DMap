import userControl from "./user";
//存放三轴数据
let oriValues = [];
//当前传感器的值
let gravityNew = 0;

/**
 * @description 检测步数变化
 */
function accChange() {
    wx.onAccelerometerChange((res) => {
        oriValues[0] = res.x;
        oriValues[1] = res.y;
        oriValues[2] = res.z;
        gravityNew = Math.sqrt(oriValues[0] * oriValues[0] + oriValues[1] * oriValues[1] + oriValues[2] * oriValues[2]);
        detectorNewStep(gravityNew);
    });
}

//上次传感器的值
let gravityOld = 0;
//上次波峰的时间
let timeOfLastPeak = 0;
//此次波峰的时间
let timeOfThisPeak = 0;
//波峰时间差
let TimeInterval = 150;
//当前的时间
let timeOfNow = 0;
//波峰值
let peakOfWave = 0;
//初始阈值
let ThreadValue = 0.1;
//动态阈值需要动态的数据，这个值用于这些动态数据的阈值
let InitialValue = 0.2;
let timeOfLastStep;

/*
 * 检测步子，并开始计步
 * 1.传入sersor中的数据
 * 2.如果检测到了波峰，并且符合时间差以及阈值的条件，则判定为1步
 * 3.符合时间差条件，波峰波谷差值大于initialValue，则将该差值纳入阈值的计算中
 * */
function detectorNewStep(values) {
    if (gravityOld == 0) {
        gravityOld = values;
    } else {
        if (detectorPeak(values, gravityOld)) {
            timeOfNow = Date.now();
            if (timeOfNow - timeOfLastPeak >= TimeInterval && peakOfWave - valleyOfWave >= ThreadValue) {
                timeOfThisPeak = timeOfNow;
                /*
                 * 更新界面的处理，不涉及到算法
                 * 一般在通知更新界面之前，增加下面处理，为了处理无效运动：
                 * 1.连续记录10才开始计步
                 * 2.例如记录的9步用户停住超过3秒，则前面的记录失效，下次从头开始
                 * 3.连续记录了9步用户还在运动，之前的数据才有效
                 * */
                timeOfLastStep = timeOfNow;

                userControl.moveDetect();
            }

            if (timeOfNow - timeOfLastPeak >= TimeInterval && peakOfWave - valleyOfWave >= InitialValue) {
                timeOfThisPeak = timeOfNow;
            }

            timeOfLastPeak = timeOfThisPeak;
        }
    }
    gravityOld = values;
}

//上一点的状态，上升还是下降
let lastStatus = false;
//是否上升的标志位
let isDirectionUp = false;
//持续上升次数
let continueUpCount = 0;

//上一点的持续上升的次数，为了记录波峰的上升次数
let continueUpFormerCount = 0;
//波谷值
let valleyOfWave = 0;
/*
 * 检测波峰
 * 以下四个条件判断为波峰：
 * 1.目前点为下降的趋势：isDirectionUp为false
 * 2.之前的点为上升的趋势：lastStatus为true
 * 3.到波峰为止，持续上升大于等于2次
 * 4.波峰值大于20
 * 记录波谷值
 * 1.观察波形图，可以发现在出现步子的地方，波谷的下一个就是波峰，有比较明显的特征以及差值
 * 2.所以要记录每次的波谷值，为了和下次的波峰做对比
 *
 */
function detectorPeak(newValue, oldValue) {
    lastStatus = isDirectionUp;
    if (newValue >= oldValue) {
        isDirectionUp = true;
        //在上升，记录上升的次数
        continueUpCount++;
    } else {
        //结束上升时记录
        continueUpFormerCount = continueUpCount;
        continueUpCount = 0;
        isDirectionUp = false;
    }

    //判定为波峰的条件
    if (!isDirectionUp && lastStatus && (continueUpFormerCount >= 2 || oldValue >= 20)) {
        peakOfWave = oldValue;
        return true;
    } else if (!lastStatus && isDirectionUp) {
        //判定为波谷
        valleyOfWave = oldValue;
    } else {
        return false;
    }
}

export default accChange;
