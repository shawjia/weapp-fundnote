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

    if (oriFundList.length === 0) {
      return;
    }

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

      this.setData({ fundList }, this.calProfits);
    });
  },

  calProfits() {
    const { fundList: oriFundList } = this.data;

    if (oriFundList.length === 0) {
      return;
    }

    const codes = [...(new Set(oriFundList.map(({ code }) => code)))];

    Promise.all(codes.map(code => api.prices(code))).then((v) => {
      const maps = {};

      v.forEach(({ items }, index) => {
        const code = codes[index];
        maps[code] = items;
      });

      // {date: "2018-10-19", nav: "1.3164", percentage: "3.67", value: "1.3164"}
      // {date: "2018-10-18", nav: "1.2698", percentage: "-2.60", value: "1.2698"}

      const fundList = oriFundList.map((item) => {
        const { code, amount, price } = item;
        let profit = '=';
        let totalProfit = '-';

        if (maps[code] && maps[code].length === 2) {
          const start = amount * price;
          const current = amount * maps[code][0].value;
          const yesterday = amount * maps[code][1].value;

          profit = (current - yesterday).toFixed(2);
          totalProfit = (current - start).toFixed(2);
        }

        return {
          ...item,
          profit,
          totalProfit,
        };
      });

      this.setData({ fundList });
    });
  },

  handleAdd(e) {
    const { funds: oriFunds } = this.data;
    const {
      code, amount, price, from,
    } = e.detail.value;

    // TODO: check input

    const funds = [...oriFunds, {
      code, amount, price, from, add: Date.now(),
    }];

    const fundList = funds.map(fundItem => ({
      ...fundItem,
      name: '-',
      profit: '-',
      totalProfit: '-',
    }));

    this.setData({ funds, fundList, showAdd: false }, this.fetchNames);

    wx.setStorageSync('funds', funds);
  },

  toggleShowAdd() {
    const { showAdd } = this.data;

    this.setData({
      showAdd: !showAdd,
    });
  },

});
