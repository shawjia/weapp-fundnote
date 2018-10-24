// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

const api = require('../../api');

const app = getApp();

Page({
  data: {
    fundList: [],
  },

  onShow() {
    wx.cloud.callFunction({ name: 'funds' })
      .then((res) => {
        const funds = res.result.funds || [];
        const fundList = funds.map(fundItem => ({
          ...fundItem,
          name: '-',
          date: '-',
          current: 0,
          percent: 0,
          profit: '-',
          totalProfit: '-',
          color: '',
          totalColor: '',
        }));

        app.globalData.funds = funds;

        this.setData({ fundList }, this.fetchNames);
      })
      .catch((err) => {
        console.error(err);
        throw (err);
      });
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
        const start = amount * price;
        let current = start;
        let profit = '=';
        let totalProfit = '-';
        let date = '';
        let percent = '';

        if (maps[code] && maps[code].length === 2) {
          const yesterday = amount * maps[code][1].value;
          const { date: lastDate, percentage } = maps[code][0];

          // 2018-10-18 -> 10-18
          date = lastDate.split('-').slice(1).join('-');
          percent = +percentage;
          current = (amount * maps[code][0].value).toFixed(2);
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
      });

      this.setData({ fundList });
    });
  },


  switchAdd() {
    wx.navigateTo({ url: '/pages/add/add' });
  },


});
