var app=getApp();
import {getSearchData} from "../js/data";
Page({
	data: {
        searchResult: [],
        buildingList: [],
        buildingIndex: 0,
        buildingData: [],
        buildingData1D: [],
        buildingRoomGroup: [],
        searchHidden: true,
        floorIndex: 0,
		searchTitle: app.map_conf.map_name,
	},
	onLoad: function () {
		// console.log(this.data)
		let buildingDataTmp=getSearchData();
		// 将其变成一维数组，方便遍历
		let eachFloor = [].concat(...buildingDataTmp[1]);
		eachFloor = [].concat(...eachFloor);
		this.setData({
			buildingList: buildingDataTmp[0],
			buildingData: buildingDataTmp[1],
			buildingRoomGroup: buildingDataTmp[2],
			searchResult: eachFloor,
			buildingData1D: eachFloor,
			modalSearch: this.modalSearch.bind(this),
		});
	},
	onShow:function(){

	},
	 /**
     * @description 搜索
     */
    modalSearch(e) {
        let searchInput = e.detail.value;
        searchInput = searchInput.replace(/\s+/g, "");
        if (searchInput.length != 0) {
            let tmp = this.data.buildingData1D.filter((item) => {
                var reg = new RegExp(searchInput);
                return reg.test(item.name) || reg.test(item.name2);
            });
            this.setData({
                searchResult: tmp,
                searchHidden: false,
            });
        }
        return new Promise(() => {});
	},
	    /**
     * @description 搜索提示框隐藏和显示
     */
    switchHidden() {
        this.setData({
            searchHidden: !this.data.searchHidden,
        });
    },
    /**
     * @description 选中搜索结果后触发
     */
    selectResult: function (e) {
        // console.log(e.currentTarget.dataset.selected,e.target.dataset.selected)
        var target = e.currentTarget.dataset.selected || e.target.dataset.selected;
        if(!target) return;
		// 向index页面传递数据，并返回至index页面
		const eventChannel = this.getOpenerEventChannel()
		eventChannel.emit('selectedPoint', {data: target});
		wx.navigateBack({
			delta: 0,
		})
    },
    /**
     * @description 搜索栏切换tab
     * @param {*} e 事件
     */
    switchTap(e) {
        let index = e.target.dataset.tapindex;
        this.setData({
            buildingIndex: index,
		});
		
    },
    /**
     * @description 显示该楼层的具体房间，如果重复选择该层，则隐藏
     * @param {*} e 事件
     */
    showFloor(e) {
        let index = e.currentTarget.dataset.floorindex;
        index = index == this.data.floorIndex ? -1 : index;
        this.setData({
            floorIndex: index,
        });
    }
})