const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  const { openId } = event.userInfo;
  const funds = await db.collection('funds')
    .where({ _openid: openId })
    .limit(1)
    .get();

  return {
    funds: funds.data.length === 0
      ? []
      : funds.data[0].funds,
  };
};
