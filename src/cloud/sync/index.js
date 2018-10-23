const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  const { funds } = event;
  const { openId } = event.userInfo;
  const oldFunds = await db.collection('funds')
    .where({ _openid: openId })
    .limit(1)
    .get();

  let code = 0;

  try {
    if (oldFunds.data.length) {
      // update
      const { _id: id } = oldFunds.data[0];

      await db.collection('funds').doc(id).update({ data: { funds } });
    } else {
      // add
      await db.collection('funds').add({ data: { funds, _openid: openId } });
    }
  } catch (error) {
    console.error(error);
    code = 101;
  }

  return {
    code,
  };
};
