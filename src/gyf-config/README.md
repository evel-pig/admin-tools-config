# gyf

## createConfig

创建入口配置

```typescript
import './app.less';
import { createConfig } from '@epig/admin-tools-config/gyf';
import { MENUS } from 'admin-util/menu';
import * as models from './models';

const config = createConfig({
  appName: '管理后台',
  persistKey: 'admin',
  menus: MENUS,
  syncModels: models,
});

export default config;
```

## InPermission

权限组件

```typescript
<InPermission permissionId={-1}>
  ...
</InPermission>
```

## permission, PermissionState

权限model

## setNoCheckPermission

设置不检查权限，用于开发环境

## inPermission

检查权限

```typescript
inPermission(-1)
```

## BACIS_PERMISSION_ID

基础权限id, 用于测试
