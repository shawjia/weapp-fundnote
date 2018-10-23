// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/app.html

App({

  onLaunch() {
    wx.cloud.init({
      traceUser: true,
    });
  },

  globalData: {
    funds: [],
  },

});
