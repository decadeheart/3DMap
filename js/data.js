var nodeList;
var app = getApp();
/**
 * @description 从服务器加载数据
 * @date 2020-07-10
 */
const initData = new Promise((resolve,reject)=> {
  wx.request({
    url: 'https://www.cleverguided.com/iLaN/3D-jxqzf/data/jxqzf.json',
    data: {},
    header: {
      'content-type': 'application/json'
    },
    method: 'GET',
    dataType: 'json',
    responseType: 'text',
    success: res => {
      resolve(dataPreProcess(res));
    },
    fail: err => {
      reject(err)
    },
  })
})
export default initData;

// 建筑物名字列表
var buildingList = [];
// buildingData[i]表示其中某栋建筑物，buildingData[i][j]表示该建筑物第j层，每层有很多办公室的对象
var buildingData = [];

/**
 * @description 预处理、格式化数据方便检索和显示
 * @date 2020-07-10
 */
var dataPreProcess = (res) => {
  let data = res.data;
  nodeList = data.nodeList;

  let target = data.target;
  app.beaconCoordinate = data.beaconCoordinate;

  app.nodeList = nodeList;

  for (let build in target) {
    for (let floor in target[build]) {
      target[build][floor].forEach(function (item) {
        item.z = (item.floor - 1) * app.map_conf.layerHeight;
        item.floor = parseInt(floor);
        item.building = build;
        app.POItarget.push(item);
      });
    }
  }
  app.nodeList.forEach(function (node) {
    node.z = (node.floor - 1) * app.map_conf.layerHeight;
  });
  app.beaconCoordinate.forEach(function (node) {
    node.z = (node.floor - 1) * app.map_conf.layerHeight;
  });

  var tmp = target;
  for (let building in tmp) {
    buildingList.push(building);
    let floor = [];
    for (let item in tmp[building]) {
      floor.push(tmp[building][item]);
    }
    buildingData.push(floor);
  }
  return [buildingList,buildingData];
}


const formatData = (res) => {
  var tmp = res.data.target;
  for (let building in tmp) {
    buildingList.push(building);
    let target = [];
    for (let item in tmp[building]) {
      target.push(tmp[building][item]);
    }
    buildingData.push(target);
  }
  // console.log(buildingData)
  // var totalFloor = [];
  // var floorRoom = [];
  // var rooms = [];
  // let cnt = 0;
  // let filterlist = {};
  // target.forEach(function (item) {
  //   console.log(item.building)
  //   if (item.building === building_name) {
  //     if (!!filterlist[item.floor.toString()]) {
  //       filterlist[item.floor.toString()].push(item);
  //     } else {
  //       filterlist[item.floor.toString()] = [item];
  //     }
  //   }
  // });
  // for (let key in filterlist) {
  //   totalFloor[cnt++] = key;
  //   floorRoom.push([]);
  //   let eachFloor = filterlist[key];
  //   let curTmp = [],
  //     usuaTmp = [];
  //   eachFloor.forEach(office => {
  //     if (office.expend == "通用") {
  //       //console.log(office.name)
  //       usuaTmp.push(office);
  //     } else curTmp.push(office);
  //   });
  //   curTmp.sort((o1,o2)=>o1.name<o2.name);
  //   curTmp.push(...usuaTmp);
  //   eachFloor = curTmp;
  //   eachFloor.forEach(office => {
  //     //console.log(office.name);
  //     let existing = false;
  //     let curIndex = [0, 0];
  //     let category = office["expend"];
  //     for (let j = 0; j < floorRoom[cnt - 1].length; j++) {
  //       if (floorRoom[cnt - 1][j][0] == category) {
  //         existing = true;
  //         curIndex = [cnt - 1, j];
  //         break;
  //       }
  //     }
  //     let tmp = office["name2"] + office["name"];
  //     if (existing) {
  //       if (floorRoom[curIndex[0]][curIndex[1]].indexOf(tmp) == -1) {
  //         floorRoom[curIndex[0]][curIndex[1]].push(tmp);
  //         existing = false;
  //       }
  //     } else {
  //       let t = [category, tmp];
  //       floorRoom[cnt - 1].push(t);
  //     }
  //     let roomTmp = {
  //       "value": tmp,
  //       "name": office.name,
  //       "name2": office.name2,
  //       "floor": office.floor
  //     };
  //     rooms.push(roomTmp);
  //   });
  // }
}