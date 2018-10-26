// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

const app = getApp();
const CODE_REX = /^\d+$/;

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
  },

  onLoad() {
    wx.cloud.callFunction({ name: 'funds' })
      .then((res) => {
        app.globalData.funds = res.result.funds || [];
      })
      .catch((err) => {
        console.error(err);
        throw (err);
      });
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
        hasAmountErr = isEmpty || Number.isNaN(input);
        newData.hasAmountErr = hasAmountErr;
        break;

      case 'price':
        price = input;
        hasPriceErr = isEmpty || Number.isNaN(input);
        newData.hasPriceErr = hasPriceErr;
        break;

      default:
        break;
    }

    newData.canSumit = code !== '' && amount !== '' && price !== ''
      && !hasCodeErr && !hasAmountErr && !hasPriceErr;

    this.setData(newData);
  },

  switchHome() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.redirectTo({ url: '/pages/index/index' });
    }
  },

  handleAdd() {
    const {
      code, amount, price, from, canSumit,
    } = this.data;

    if (!canSumit) {
      return;
    }

    const funds = [...app.globalData.funds, {
      code, amount, price, from, add: Date.now(),
    }];

    app.globalData.funds = funds;

    wx.showLoading({ title: '添加中...' });

    this.syncFunds(funds);
  },

  // TODO: cloud sync is optional, save local by default

  syncFunds(funds) {
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
