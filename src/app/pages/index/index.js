// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

const api = require('../../api');

const app = getApp();

Page({
  data: {
    funds: [],
    fundList: [],
    showAdd: false,
  },

  onLoad() {
    const funds = wx.getStorageSync('funds') || [];
    const fundList = funds.map(fundItem => ({
      ...fundItem,
      name: '-',
      profit: '-',
      totalProfit: '-',
    }));

    const showAdd = funds.length === 0;

    this.setData({ funds, fundList, showAdd });

    this.fetchNames();
  },

  onShow() {
    console.log('ohShow', app.globalData);
  },

  fetchNames() {
    const { fundList: oriFundList } = this.data;
    const codes = [...(new Set(oriFundList.map(({ code }) => code)))];

    Promise.all(codes.map(code => api.info(code))).then((v) => {
      const maps = {};

      v.forEach(({ fd_name: name, fd_code: code }) => {
        maps[code] = name;
      });

      const fundList = oriFundList.map((item) => {
        const { code } = item;

        return {
          ...item,
          name: maps[code] || '-',
        };
      });

      this.setData({ fundList });
    });
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
