import { createModel } from '@epig/admin-tools/lib/model';
import loginModel from '@epig/admin-tools/lib/commonModels/login';
import menuModel from '@epig/admin-tools/lib/commonModels/menu';
import { take, put } from 'redux-saga/effects';
import { adminNormalActions, history } from '@epig/admin-tools/lib/util/util';
import { getMenus } from './menu';
import { setRequestHeaders } from '@epig/luna/model';

export interface PermissionState {
  permissions: any[];
}

const model = createModel({
  modelName: 'permission',
  action: {
    simple: {
      setPermissions: 'setPermissions',
    },
    api: {
    },
  },
  reducer: ({ simpleActionNames, createReducer }) => {
    return createReducer<PermissionState, any>({
      [simpleActionNames.setPermissions](state, action) {
        const permissions = action.payload.permissions as any[];
        return {
          ...state,
          permissions: permissions,
        };
      },
    }, {
        permissions: [],
      });
  },
  sagas: m => {
    function* loginSuccess() {
      while (true) {
        const res = yield take(loginModel.actionNames.api.login.success);
        setRequestHeaders(() => {
          return {
            token: res.payload.res.token,
          };
        });
        yield put(menuModel.actions.simple.setName({
          name: res.payload.req.account,
        }));
        const permissions = res.payload.res.permissions.map(item => item.id);
        yield put(menuModel.actions.simple.setMenus({
          menus: getMenus(permissions),
        }));
        yield put(m.actions.simple.setPermissions({
          permissions: permissions,
        }));
      }
    }
    function* logoutSuccess() {
      while (true) {
        yield take(loginModel.actionNames.api.logout.success);
        setRequestHeaders(() => {
          return {
            token: '',
          };
        });
      }
    }
    function* logoutError() {
      while (true) {
        yield take(loginModel.actionNames.api.logout.error);
        setRequestHeaders(() => {
          return {
            token: '',
          };
        });
        yield put(adminNormalActions.loginTimeout({}));
        history.push({
          pathname: '/user/login',
        });
      }
    }
    return [
      loginSuccess,
      logoutSuccess,
      logoutError,
    ];
  },
});

export default model;
