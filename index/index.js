const {
  createScopedThreejs
} = require('../util/three')
const {
  renderModel
} = require('../js/model')

const app = getApp()

Page({
  data: {
    baseUrl: "https://www.cleverguided.com/iLaN/3D-jxqzf/",
    dimensionImgUrl: [],
    dimension: 3,
    allFloorImgUrl: '',
    floorImgUrl: []
  },
  onLoad: function () {
    wx.createSelectorQuery()
      .select('#map')
      .node()
      .exec((res) => {
        const canvas = res[0].node
        this.canvas = canvas
        // var gl = canvas.getContext('webgl', {
        //   alpha: true
        // });
        const THREE = createScopedThreejs(canvas)
        renderModel(canvas, THREE)
      })

    //初始化图片url
    this.setData({
      dimensionImgUrl: [
        this.data.baseUrl + "ui_img/2D.png",
        this.data.baseUrl + "ui_img/3D.png",
      ],
      allFloorImgUrl: this.data.baseUrl + "ui_img/more.png",
      floorImgUrl: [
        this.data.baseUrl + "ui_img/1F.png",
        this.data.baseUrl + "ui_img/2F.png",
        this.data.baseUrl + "ui_img/3F.png",
        this.data.baseUrl + "ui_img/4F.png",
        this.data.baseUrl + "ui_img/5F.png",
        this.data.baseUrl + "ui_img/6F.png"
      ]
    })

  },
  changeDimension() {
    let index = this.data.dimension == 2 ? 3 : 2;
    this.setData({
      dimension: index
    })
  },
  selectFloor(e){
    let floor = e.currentTarget.dataset.floor
    console.log(floor)
  },
  goSearch() {
    wx.navigateTo({
      url: '../search/search',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function (data) {
          console.log(data)
        },
        someEvent: function (data) {
          console.log(data)
        }
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          data: 'test'
        })
      }
    })
  },
  touchStart(e) {
    this.canvas.dispatchTouchEvent({
      ...e,
      type: 'touchstart'
    })
  },
  touchMove(e) {
    this.canvas.dispatchTouchEvent({
      ...e,
      type: 'touchmove'
    })
  },
  touchEnd(e) {
    this.canvas.dispatchTouchEvent({
      ...e,
      type: 'touchend'
    })
  }
})