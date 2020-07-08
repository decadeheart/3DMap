const { createScopedThreejs } = require('../util/three')
const { renderModel } = require('../js/model')

const app = getApp()

Page({
  data: {},
  onLoad: function () {
    wx.createSelectorQuery()
      .select('#webgl')
      .node()
      .exec((res) => {
        const canvas = res[0].node
        this.canvas = canvas
        const THREE = createScopedThreejs(canvas)
        renderModel(canvas, THREE)
      })
  },
  touchStart(e) {
    this.canvas.dispatchTouchEvent({...e, type:'touchstart'})
  },
  touchMove(e) {
    this.canvas.dispatchTouchEvent({...e, type:'touchmove'})
  },
  touchEnd(e) {
    this.canvas.dispatchTouchEvent({...e, type:'touchend'})
  }
})
