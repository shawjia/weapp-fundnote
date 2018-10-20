
import { request } from './utils/util';

const DANJUAN_API = 'https://danjuanapp.com/djapi/fund/';

const links = {
  info: `${DANJUAN_API}derived/`,
  prices: `${DANJUAN_API}nav/history/`, // 100032?page=1&size=2
};

const api = {

  // https://danjuanapp.com/djapi/fund/derived/100032 fd_name
  info: code => request(links.info + code),

  // https://danjuanapp.com/djapi/fund/nav/history/100032?page=1&size=2
  // data.items[0] { date: '2018-10-19', percentage: '2.46', value: '0.9580' }
  prices: code => request(links.prices + code, { page: 1, size: 2 }),

};

module.exports = api;
