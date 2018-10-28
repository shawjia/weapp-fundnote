// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

import { isNumber } from '../../utils/util';

const app = getApp();
const CODE_REX = /^\d{6}$/;

Page({
  data: {
    code: '',
    amount: '',
    price: '',
    from: '',
    hasCodeErr: false,
    hasAmountErr: false,
    hasPriceErr: false,
    canSumit: false,

    text: '',
    hasTextErr: false,
  },

  onChange(e) {
    const name = e.target.id;
    const input = e.detail.trim();
    const isEmpty = input === '';
    const newData = {};
    let {
      code, amount, price, hasCodeErr, hasAmountErr, hasPriceErr,
    } = this.data;

    newData[name] = input;

    switch (name) {
      case 'code':
        code = input;
        hasCodeErr = isEmpty || !CODE_REX.test(input);
        newData.hasCodeErr = hasCodeErr;
        break;

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

    newData.canSumit = code !== '' && amount !== '' && price !== ''
      && !hasCodeErr && !hasAmountErr && !hasPriceErr;

    this.setData(newData);
  },

  onChangeText(e) {
    const text = e.detail.trim();

    this.setData({ text, hasTextErr: text !== '' });
  },

  switchHome() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.redirectTo({ url: '/pages/index/index' });
    }
  },

  handleBatch() {
    const { text } = this.data;
    const lines = text.split(/\n|\r/)
      .filter(line => line.includes(',') || line.includes('，') || /\t/.test(line))
      .map(line => line.split(/,|，|\t/).map(v => v.trim()))
      .filter((fund) => {
        const [code, price, amount] = fund;

        return CODE_REX.test(code)
          && isNumber(price)
          && isNumber(amount);
      });

    const total = lines.length;

    if (total === 0) {
      wx.showToast({ title: '输入内容无效', icon: 'none' });
      return;
    }

    const now = Date.now();
    const newFunds = lines.map((fund, index) => {
      const [code, price, amount, from] = fund;
      return {
        code,
        price,
        amount,
        from: from || '未知',
        add: now - index,
      };
    });

    const funds = [...app.globalData.funds, ...newFunds];

    this.syncFunds(funds);
  },

  handleAdd() {
    const {
      code, amount, price, from, canSumit,
    } = this.data;

    if (!canSumit) {
      return;
    }

    const funds = [...app.globalData.funds, {
      code, amount, price, from: from || '未知', add: Date.now(),
    }];

    this.syncFunds(funds);
  },

  // TODO: cloud sync is optional, save local by default

  syncFunds(funds) {
    app.globalData.funds = funds;

    wx.showLoading({ title: '添加中...', mask: true });

    wx.cloud.callFunction({ name: 'sync', data: { funds } })
      .then((res) => {
        console.log(res.result.code);

        wx.hideLoading();

        wx.showToast({ title: '添加成功' });

        this.switchHome();
      })
      .catch((err) => {
        console.error(err);

        wx.hideLoading();

        wx.showToast({ title: '添加失败', icon: 'none' });
      });
  },

});
