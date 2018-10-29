// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

import { isNumber } from '../../utils/util';

const app = getApp();

Page({
  data: {
    id: null,
    code: '',
    amount: '',
    price: '',
    from: '',

    hasAmountErr: false,
    hasPriceErr: false,
    canSumit: false,
  },

  onLoad(query) {
    const id = +query.id;
    const fund = app.globalData.funds[id];

    if (!fund) {
      this.switchHome();
    }

    const {
      code, price, amount, from,
    } = fund;

    this.setData({
      id, code, price, amount, from,
    });
  },

  onChange(e) {
    const name = e.target.id;
    const input = e.detail.trim();
    const isEmpty = input === '';
    const newData = {};
    let {
      amount, price, hasAmountErr, hasPriceErr,
    } = this.data;

    newData[name] = input;

    switch (name) {
      case 'amount':
        amount = input;
        hasAmountErr = isEmpty || !isNumber(input);
        newData.hasAmountErr = hasAmountErr;
        break;

      case 'price':
        price = input;
        hasPriceErr = isEmpty || !isNumber(input);
        newData.hasPriceErr = hasPriceErr;
        break;

      default:
        break;
    }

    newData.canSumit = amount !== '' && price !== '' && !hasAmountErr && !hasPriceErr;

    this.setData(newData);
  },

  switchHome() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.redirectTo({ url: '/pages/index/index' });
    }
  },

  handleEdit() {
    const {
      amount, price, from, canSumit, id,
    } = this.data;

    if (!canSumit) {
      return;
    }

    const { funds } = app.globalData;
    const fund = app.globalData.funds[id];

    fund.amount = amount;
    fund.price = price;
    fund.from = from || '未知';
    fund.edit = Date.now();

    this.syncFunds(funds);
  },

  handleDel() {
    wx.showActionSheet({
      itemList: ['删除'],
      itemColor: 'red',
      success: () => {
        const { funds } = app.globalData;

        funds.splice(this.data.id, 1);
        this.syncFunds(funds);
      },
    });
  },

  // TODO: cloud sync is optional, save local by default

  syncFunds(funds) {
    wx.showLoading({ title: '执行中...', mask: true });

    wx.cloud.callFunction({ name: 'sync', data: { funds } })
      .then((res) => {
        console.log(res.result.code);

        wx.hideLoading();

        wx.showToast({ title: '执行成功' });

        this.switchHome();
      })
      .catch((err) => {
        console.error(err);

        wx.hideLoading();

        wx.showToast({ title: '执行失败', icon: 'none' });
      });
  },

});
