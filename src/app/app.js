// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/app.html

App({

  onLaunch() {
    wx.cloud.init({
      traceUser: true,
    });
  },

  globalData: {
    funds: [],
    names: {},
  },

  switchHome() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.redirectTo({ url: '/pages/index/index' });
    }
  },

  // TODO: cloud sync is optional, save local by default
  syncFunds(funds, actionName = '执行') {
    this.globalData.funds = funds;

    wx.showLoading({ title: `${actionName}中...`, mask: true });

    wx.cloud.callFunction({ name: 'sync', data: { funds } })
      .then((res) => {
        console.log(res.result.code);

        wx.hideLoading();

        wx.showToast({ title: `${actionName}成功` });

        this.switchHome();
      })
      .catch((err) => {
        console.error(err);

        wx.hideLoading();

        wx.showToast({ title: `${actionName}失败`, icon: 'none' });
      });
  },

});
