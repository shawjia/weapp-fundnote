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
      app.switchHome();
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
    fund.from = from || '其他';
    fund.edit = Date.now();

    app.syncFunds(funds, '编辑');
  },

  handleDel() {
    wx.showActionSheet({
      itemList: ['删除'],
      itemColor: '#f44',
      success: () => {
        const { funds } = app.globalData;

        funds.splice(this.data.id, 1);
        app.syncFunds(funds, '删除');
      },
    });
  },

});
