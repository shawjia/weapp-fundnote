// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

const app = getApp();
const CODE_REX = /^\d+$/;

Page({
  data: {
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

  switchHome() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.redirectTo({ url: '/pages/index/index' });
    }
  },

  handleAdd(e) {
    let {
      code, amount, price, from,
    } = e.detail.value;

    code = code.trim();
    amount = amount.trim();
    price = price.trim();
    from = from.trim() || '未知';

    if (code === '' || !CODE_REX.test(code)) {
      wx.showToast({ title: '无效代码', icon: 'none' });
      return;
    }


    if (amount === '' || Number.isNaN(amount)) {
      wx.showToast({ title: '无效份额', icon: 'none' });
      return;
    }

    if (price === '' || Number.isNaN(price)) {
      wx.showToast({ title: '无效均价', icon: 'none' });
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
