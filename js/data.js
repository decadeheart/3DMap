var nodeList;
var app = getApp();
/**
 * @description 从服务器加载数据
 * @date 2020-07-10
 */
const initData = new Promise((resolve, reject) => {
	let value = wx.getStorageSync('nodeData');
	value=false;
	if (value) {
		resolve(value);
	} 
	else {
		wx.request({
			url: 'https://www.cleverguided.com/iLaN/3D-jxqzf/data/jxqzf.json',
			data: {},
			header: {'content-type': 'application/json'},
			method: 'GET',
			dataType: 'json',
			responseType: 'text',
			success: res => {
				let data = dataPreProcess(res);
				resolve(data);
			},
			fail: err => {
				reject(err)
			}
		})
	}

})
export default initData;

// 建筑物名字列表
var buildingList = [];
// buildingData[i]表示其中某栋建筑物，buildingData[i][j]表示该建筑物第j层，每层有很多办公室的对象
var buildingData = [];
var buildingRoomGroup = [];

/**
 * @description 预处理、格式化数据方便检索和显示
 * @date 2020-07-10
 */
var dataPreProcess = (res) => {
	let data = res.data;
	nodeList = data.nodeList;

	let target = data.target;
	//蓝牙信息
	app.beaconCoordinate = data.beaconCoordinate;
	//节点信息
	app.nodeList = nodeList;
	app.target=target;

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

	buildingData.forEach(building => {
		let eachBuilding = [];
		building.forEach(floor => {
			let eachFloor = [];
			let group = {
				expend: "通用",
				rooms: []
			};
			floor.forEach(room => {
				if (!eachFloor.some(item => item.expend == room.expend)) {
					if (room.expend !== group.expend) {
						eachFloor.push({
							expend: room.expend,
							rooms: []
						});
					}
				}
				eachFloor.forEach(item => {
					if (item.expend == room.expend) {
						item.rooms.push(room);
					}
				})
				if (room.expend == group.expend) {
					group.rooms.push(room);
				}
			})

			eachFloor.push(group);
			//按照办公室号排序
			eachFloor.forEach(item => {
				item.rooms.sort((a, b) => parseInt(a.name) - parseInt(b.name));
			})
			eachBuilding.push(eachFloor);
		})
		buildingRoomGroup.push(eachBuilding);
	})
	return [buildingList, buildingData, buildingRoomGroup];
}