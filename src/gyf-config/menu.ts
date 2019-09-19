import { MenuDecorator } from '@epig/admin-tools/lib/commonModels/menu';

export const BACIS_PERMISSION_ID = -1;

export const SPECIAL_PERMISSIONS = {
};

export let MENUS: MenuDecorator[] = [];

export function setMenus(menus) {
  MENUS = menus;
}

/**
 * 开发环境默认不检测权限
 */
export let NO_CHECK_PERMISSION = process.env.NODE_ENV === 'development';

export function setNoCheckPermission(check: boolean) {
  NO_CHECK_PERMISSION = check;
}

export function inPermission(permissionId: number, permissions?: number[]) {
  if (NO_CHECK_PERMISSION) {
    return true;
  }
  const _permissions = permissions || window['store'].getState().permission.permissions;
  return _permissions.indexOf(permissionId) >= 0
    || BACIS_PERMISSION_ID === permissionId;
}

export function getMenus(permissions: number[]) {
  let newMenus = [];
  MENUS.forEach(sub => {
    let subMenus: MenuDecorator = null;
    if (inPermission(sub.permissionId, permissions)) {
      subMenus = {
        ...sub,
        items: [],
      };
    }
    (sub.items || []).forEach(item => {
      if (inPermission(item.permissionId, permissions)) {
        if (!subMenus) {
          subMenus = {
            ...sub,
            items: [],
          };
        }
        subMenus.items.push({
          ...item,
        });
      }
    });
    if (subMenus) {
      newMenus.push(subMenus);
    }
  });

  return newMenus;
}
