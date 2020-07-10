/**
 * @description 从服务器加载数据
 * @date 2020-07-10
 */
function initData(){
    var reqTask = wx.request({
        url: 'https://www.cleverguided.com/iLaN/3D-jxqzf/data/jxqzf.json',
        data: {},
        header: {'content-type':'application/json'},
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: (result)=>{
            console.log(result.data)
        },
        fail: ()=>{console.log('error')},
    });
    console.log(1)
}

module.exports = {
    initData: initData
  }