import { TTAdminAppOptions, isRequestErrorAction } from '@epig/admin-tools';
import { setGetToken } from '@epig/admin-tools/lib/commonModels/token';
import { setLoginApiPath } from '@epig/admin-tools/lib/commonModels/login';
import { setHandleRequestSuccess } from '@epig/admin-tools/lib/model/listReducers';
import { message } from 'antd';
import { adminNormalActions, history } from '@epig/admin-tools/lib/util/util';
import { getMenus, setMenus } from './menu';
import { UniTable } from '@epig/admin-tools/lib/components/UniTable';
import { setRequestHeaders } from '@epig/luna/model';
import permissionModel from './permission';
import { MenuDecorator } from '@epig/admin-tools/lib/commonModels/menu';
export { setNoCheckPermission, inPermission, BACIS_PERMISSION_ID } from './menu';
export { default as InPermission } from './InPermission';
export { default as permission, PermissionState } from './permission';

setLoginApiPath({
  login: '/users/login',
  logout: '/users/logout',
});

UniTable.pageNoKeyName = 'pageNum';
UniTable.pageSizeKeyName = 'pageSize';
UniTable.globalTableProps = {
  bordered: true,
};

setGetToken((res) => {
  let token: any = {};
  token.token = res.token;

  return token;
});

setHandleRequestSuccess((state, action) => {
  const { res, req } = action.payload;
  return {
    ...state,
    loading: false,
    infos: res.items || [],
    pagination: {
      ...state.pagination,
      current: req['page-no'] || req.pageNum || 1,
      pageSize: req['page-size'] || req.pageSize || 10,
      total: res.totalSize,
    },
  };
});

function defaultAdminRequestErrorHandle(res) {
  if (res.payload.error || res.payload.res.code !== 200) {
    let error = res.payload.error;
    if (!error) {
      error = {
        code: res.payload.res.code,
        des: res.payload.res.msg,
      };
    }

    return error;
  }

  return null;
}

const needReLoginCodes = [501, 508, 509];

const requestErrorMiddleware = store => next => action => {
  let result = next(action);
  if (isRequestErrorAction(action)) {
    const error = action.payload.error;
    message.error(error.des);

    if (needReLoginCodes.indexOf(error.code) >= 0) {
      next(adminNormalActions.loginTimeout({}));
      history.push({
        pathname: '/user/login',
      });
    }
  }

  return result;
};

const middlewares = [
  requestErrorMiddleware,
];

const customMenus = state =>  {
  if (state.token.token) {
    setRequestHeaders(() => {
      return {
        token: state.token.token,
      };
    });
  }
  return getMenus(state.permission.permissions);
};

const processResponse = res => res.data;

export interface CreateGyfConfigOptions {
  /**
   * 项目名称
   */
  appName: string;
  /**
   * 持久化key
   */
  persistKey: any;
  /**
   * 菜单
   */
  menus: MenuDecorator[];
  /**
   * 公共models，一般是import * as models from './models';
   */
  syncModels: {
    reducers: any;
    sagas: any;
  };
}

export function createConfig({ appName, persistKey, menus, syncModels }: CreateGyfConfigOptions) {
  setMenus(menus);
  const config = {
    app: {
      model: {
        syncModels: {
          reducers: {
            ...syncModels.reducers,
            [permissionModel.modelName]: permissionModel.reducer,
          },
          sagas: {
            ...syncModels.sagas,
            [permissionModel.modelName]: permissionModel.sagas,
          },
        },
        basePath: '/api',
        message: message,
      },
      persistConfig: {
        key: persistKey,
        whiteList: ['token', 'menu', 'permission', 'common'],
      },
      appName: appName,
      noRequestMenu: true,
      customMenus: customMenus,
      store: {
        noAddToken: true,
        noHandleRequestError: true,
        middlewares: middlewares,
      },
      adminRequestErrorHandle: defaultAdminRequestErrorHandle,
      processResponse: processResponse,
    } as TTAdminAppOptions,
    root: 'root',
  };

  return config;
}
