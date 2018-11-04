const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async () => {
  const { OPENID: openId } = cloud.getWXContext();
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
