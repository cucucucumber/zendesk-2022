import { MockRequest } from '@delon/mock';

const list: any[] = [];
const total = 50;

function genData(params: any): { total: number; list: any[] } {
  let ret = [...list];
  const pi = +params.pi;
  const ps = +params.ps;
  const start = (pi - 1) * ps;

  if (params.no) {
    ret = ret.filter(data => data.no.indexOf(params.no) > -1);
  }

  return { total: ret.length, list: ret.slice(start, ps * pi) };
}

function saveData(id: number, value: any): { msg: string } {
  const item = list.find(w => w.id === id);
  if (!item) {
    return { msg: '无效用户信息' };
  }
  Object.assign(item, value);
  return { msg: 'ok' };
}

export const USERS = {
  '/user': (req: MockRequest) => genData(req.queryString),
  '/user/:id': (req: MockRequest) => list.find(w => w.id === +req.params.id),
  'POST /user/:id': (req: MockRequest) => saveData(+req.params.id, req.body),
  '/user/current': {
    name: 'Admin',
    avatar: '',
    userid: '00000001',
    email: 'demo@zendesk.com',
    signature: '',
    title: '',
    group: '',
    tags: [
      {
        key: '0',
        label: 'admin'
      }
    ],
    notifyCount: 12,
    country: 'China',
    geographic: {
      province: {
        label: 'Shanghai',
        key: '330000'
      },
      city: {
        label: 'downtown',
        key: '330100'
      }
    },
    address: 'xxxx-xxxx-xxx',
    phone: 'xxx-xxxx-xxx'
  },
  'POST /user/avatar': 'ok',
  'POST /login/account': (req: MockRequest) => {
    const data = req.body;
    if (!(data.userName === 'admin') || data.password !== 'password') {
      return { msg: `Invalid username or password（admin/password）` };
    }
    return {
      msg: 'ok',
      user: {
        token: '123456789',
        name: data.userName,
        email: `${data.userName}@zendesk.com`,
        id: 10000,
        time: +new Date()
      }
    };
  },
  'POST /register': {
    msg: 'ok'
  }
};
