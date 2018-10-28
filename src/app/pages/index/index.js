// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

const api = require('../../api');

const app = getApp();
let prices = {};

Page({
  data: {
    fundList: [],
  },

  onPullDownRefresh() {
    prices = {};
    this.fetchPrices();
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {
    return {
      title: '广积粮 缓称王',
      path: '/pages/index/index',
      imageUrl: '/smile.jpg',
    };
  },

  onShow() {
    wx.cloud.callFunction({ name: 'funds' })
      .then((res) => {
        app.globalData.funds = res.result.funds || [];

        this.fetchNames();
      })
      .catch((err) => {
        console.error(err);
        throw (err);
      });
  },

  fetchNames() {
    const { names, funds } = app.globalData;
    const codes = [...(new Set(funds.map(({ code }) => code)))]
      .filter(code => !(code in names));

    Promise.all(codes.map(code => api.info(code)))
      .then((v) => {
        v.forEach(({ fd_name: name, fd_code: code }) => {
          names[code] = name;
        });
      })
      .then(this.fetchPrices);
  },

  fetchPrices() {
    const { funds } = app.globalData;
    const codes = [...(new Set(funds.map(({ code }) => code)))]
      .filter(code => !(code in prices));

    Promise.all(codes.map(code => api.prices(code)))
      .then((v) => {
        v.forEach(({ items }, index) => {
          const code = codes[index];
          prices[code] = items;
        });
      })
      .then(this.setFundList);
  },

  setFundList() {
    const { names, funds } = app.globalData;

    const fundList = funds.map((fund) => {
      const { code } = fund;

      const item = this.calProfit(fund);
      item.name = names[code] || '-';

      return item;
    });

    this.setData({ fundList });
  },

  calProfit(item) {
    const { code, amount, price } = item;
    const start = amount * price;
    let current = start;
    let profit = '=';
    let totalProfit = '-';
    let date = '';
    let percent = '';

    // {date: "2018-10-19", nav: "1.3164", percentage: "3.67", value: "1.3164"}
    // {date: "2018-10-18", nav: "1.2698", percentage: "-2.60", value: "1.2698"}
    if (prices[code] && prices[code].length === 2) {
      const yesterday = amount * prices[code][1].value;
      const { date: lastDate, percentage } = prices[code][0];

      // 2018-10-18 -> 10-18
      date = lastDate.split('-').slice(1).join('-');
      percent = +percentage;
      current = (amount * prices[code][0].value).toFixed(2);
      profit = (current - yesterday).toFixed(2);
      totalProfit = (current - start).toFixed(2);
    }

    return {
      ...item,
      current,
      percent,
      date,
      profit,
      totalProfit,
      color: profit.includes('-') ? 'lose' : 'win',
      totalColor: totalProfit.includes('-') ? 'lose' : 'win',
    };
  },

  switchAdd() {
    wx.navigateTo({ url: '/pages/add/add' });
  },

  goEdit(e) {
    const { id } = e.currentTarget.dataset;

    wx.navigateTo({ url: `/pages/edit/edit?id=${id}` });
  },

});
