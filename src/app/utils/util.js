// https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html

const request = (url, data = {}, opts = {}) => new Promise((resolve, reject) => {
  const success = (response) => {
    const { data: { result_code: code, data: res } } = response;

    if (code === 0) {
      resolve(res);
    } else {
      reject(new Error(`wrong code: ${code}`));
    }
  };

  const fail = () => { reject(new Error('wx.request failde')); };

  wx.request({
    ...opts, url, data, success, fail,
  });
});

const isNumber = n => !Number.isNaN(+n);
const formatPrice = str => (str.includes('-') ? str : `+${str}`);

module.exports = {
  request,
  isNumber,
  formatPrice,
};
