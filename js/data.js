var DATA;

/**
 * @description 从服务器加载数据
 * @date 2020-07-10
 */
export const initData = new Promise((resolve, reject) => {
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
      DATA = res;
      resolve(res);
      // formatData();
    },
    fail: err => {
      reject(err)
    },
  })
})
/**
 * @description 格式化数据方便检索和显示
 * @date 2020-07-10
 */
const formatData = () => {
  var tmp=DATA.data.target["行政楼"];
  var target=[];
  for(let item in tmp) {
    target.push(tmp[item])
  }
  console.log(target)
  var totalFloor = [];
  var floorRoom = [];
  var rooms = [];
  let cnt = 0;
  let filterlist = {};
  target.forEach(function (item) {
    console.log(item.building)
    if (item.building === building_name) {
      if (!!filterlist[item.floor.toString()]) {
        filterlist[item.floor.toString()].push(item);
      } else {
        filterlist[item.floor.toString()] = [item];
      }
    }
  });
  for (let key in filterlist) {
    totalFloor[cnt++] = key;
    floorRoom.push([]);
    let eachFloor = filterlist[key];
    let curTmp = [],
      usuaTmp = [];
    eachFloor.forEach(office => {
      if (office.expend == "通用") {
        //console.log(office.name)
        usuaTmp.push(office);
      } else curTmp.push(office);
    });
    curTmp.sort((o1,o2)=>o1.name<o2.name);
    curTmp.push(...usuaTmp);
    eachFloor = curTmp;
    eachFloor.forEach(office => {
      //console.log(office.name);
      let existing = false;
      let curIndex = [0, 0];
      let category = office["expend"];
      for (let j = 0; j < floorRoom[cnt - 1].length; j++) {
        if (floorRoom[cnt - 1][j][0] == category) {
          existing = true;
          curIndex = [cnt - 1, j];
          break;
        }
      }
      let tmp = office["name2"] + office["name"];
      if (existing) {
        if (floorRoom[curIndex[0]][curIndex[1]].indexOf(tmp) == -1) {
          floorRoom[curIndex[0]][curIndex[1]].push(tmp);
          existing = false;
        }
      } else {
        let t = [category, tmp];
        floorRoom[cnt - 1].push(t);
      }
      let roomTmp = {
        "value": tmp,
        "name": office.name,
        "name2": office.name2,
        "floor": office.floor
      };
      rooms.push(roomTmp);
    });
  }
}