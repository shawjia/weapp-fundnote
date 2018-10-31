// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

import { formatPrice } from '../../utils/util';

const api = require('../../api');

const app = getApp();
const DEFAULT_TAG = '全部';
let prices = {};

Page({
  data: {
    fundList: [],
    currentTag: DEFAULT_TAG,
    showDel: false,
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
    let latestProfit = 0;
    let allProfit = 0;

    const froms = [...new Set(funds.map(({ from }) => from))];
    const fundList = froms.map(from => ({
      from,
      list: [],
      latestProfitColor: 'win',
      allProfitColor: 'win',
      latestProfit: 0,
      allProfit: 0,
    }));

    const all = funds.map((fund, fundIndex) => {
      const { code, from } = fund;

      const item = this.calProfit(fund);

      item.name = names[code] || '-';
      item.fundIndex = fundIndex;

      latestProfit += item.oriProfit;
      allProfit += item.oriTotalProfit;

      const match = fundList.find(v => v.from === from);

      match.latestProfit += item.oriProfit;
      match.allProfit += item.oriTotalProfit;

      delete item.oriProfit;
      delete item.oriTotalProfit;

      match.list.push(item);

      return item;
    });

    fundList.forEach((v) => {
      const o = v;

      o.latestProfit = formatPrice(v.latestProfit.toFixed(2));
      o.allProfit = formatPrice(v.allProfit.toFixed(2));
      o.latestProfitColor = o.latestProfit.includes('-') ? 'lose' : 'win';
      o.allProfitColor = o.allProfit.includes('-') ? 'lose' : 'win';
    });

    latestProfit = formatPrice(latestProfit.toFixed(2));
    allProfit = formatPrice(allProfit.toFixed(2));

    const latestProfitColor = latestProfit.includes('-') ? 'lose' : 'win';
    const allProfitColor = allProfit.includes('-') ? 'lose' : 'win';

    if (fundList.length) {
      fundList.unshift({
        from: '全部',
        list: all,
        latestProfitColor,
        allProfitColor,
        latestProfit,
        allProfit,
      });
    }

    this.setData({ fundList });
  },

  calProfit(item) {
    const { code, amount, price } = item;
    const start = amount * price;
    let current = start;
    let profit = '-';
    let totalProfit = '-';
    let date = '';
    let percent = '';
    let oriProfit = 0;
    let oriTotalProfit = 0;

    // {date: "2018-10-19", nav: "1.3164", percentage: "3.67", value: "1.3164"}
    // {date: "2018-10-18", nav: "1.2698", percentage: "-2.60", value: "1.2698"}
    if (prices[code] && prices[code].length === 2) {
      const yesterday = amount * prices[code][1].value;
      const { date: lastDate, percentage } = prices[code][0];

      // 2018-10-18 -> 10-18
      date = lastDate.split('-').slice(1).join('-');

      percent = +percentage;
      current = amount * prices[code][0].value;
      oriProfit = current - yesterday;
      oriTotalProfit = current - start;

      profit = formatPrice(oriProfit.toFixed(2));
      totalProfit = formatPrice(oriTotalProfit.toFixed(2));
      current = formatPrice(current.toFixed(2));
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
      oriProfit,
      oriTotalProfit,
    };
  },

  switchAdd() {
    wx.navigateTo({ url: '/pages/add/add' });
  },

  goEdit(e) {
    const { id } = e.currentTarget.dataset;

    wx.navigateTo({ url: `/pages/edit/edit?id=${id}` });
  },

  onSwitchTab(e) {
    const currentTag = e.detail.title;
    const showDel = currentTag !== DEFAULT_TAG;

    this.setData({ currentTag, showDel });
  },

  delFunds() {
    const { funds } = app.globalData;
    const { currentTag } = this.data;

    wx.showActionSheet({
      itemList: [`删除所有 ${currentTag} 基金`],
      itemColor: '#f44',
      success: () => {
        app.globalData.funds = funds.filter(({ from }) => from !== currentTag);

        app.syncFunds(app.globalData.funds, '删除');
      },
    });
  },

});
