// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

const app = getApp();

Page({
  data: {
    funds: [],

    showAdd: false,
  },

  onLoad() {
    const funds = wx.getStorageSync('funds') || [];

    this.setData({
      funds,
      showAdd: funds.length === 0,
    });
  },

  onShow() {
    console.log('ohShow', app.globalData);
  },

  handleAdd(e) {
    const { funds } = this.data;
    const {
      code, amount, price, from,
    } = e.detail.value;

    // TODO: check input

    const newFunds = [...funds, {
      code, amount, price, from, add: Date.now(),
    }];

    this.setData({ funds: newFunds, showAdd: false });

    wx.setStorageSync('funds', newFunds);
  },

  toggleShowAdd() {
    const { showAdd } = this.data;

    this.setData({
      showAdd: !showAdd,
    });
  },

});
