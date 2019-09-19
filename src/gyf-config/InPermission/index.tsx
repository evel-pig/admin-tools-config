import * as React from 'react';
import connect from '@epig/luna/lib/connect';
import { PermissionState } from '../permission';
import { inPermission } from '../menu';

export interface InPermissionOwnProps {
  permissionId: any;
}

export interface IInPermissionProps extends InPermissionOwnProps {
  permission: PermissionState;
}

class InPermission extends React.Component<IInPermissionProps, any> {
  public render() {
    if (!inPermission(this.props.permissionId)) {
      return null;
    }
    return this.props.children;
  }
}

export default connect<InPermissionOwnProps>({
  permission: require('../permission'),
})(InPermission);
