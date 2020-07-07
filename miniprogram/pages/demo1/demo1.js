//Page Object
Page({
    data: {
        num: 0,
    },
    handle: function (e) {
        // console.log(e.detail.value)
        this.setData({
            num: e.detail.value,
        });
    },
    click: function (e) {
        const operation = e.currentTarget.dataset.operation;
        this.setData({ num: this.data.num + operation });
    },
});
