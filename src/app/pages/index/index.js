// https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html

const app = getApp();

Page({

  onShow() {
    console.log('ohShow', app.globalData);
  },

  data: {
  },

});
