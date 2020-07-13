/**
 * @description 从服务器加载数据
 * @date 2020-07-10
 */
const initData = new Promise((resolve,reject)=>{
  wx.request({
      url: 'https://www.cleverguided.com/iLaN/3D-jxqzf/data/jxqzf.json',
      data: {},
      header: {'content-type':'application/json'},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: res=>{
        resolve(res)
      },
      fail: err=>{
        reject(err)
      },
  })
})


module.exports = {
  initData: initData
}