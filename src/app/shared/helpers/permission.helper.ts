import { RCPWorkplace } from '@olokup/cutter-common';

export interface UserPermission {
    workplaceQueryPermission: boolean;
    workplaceModifyPermission: boolean;
    departmentQueryPermission: boolean;
    departmentModifyPermission: boolean;
}

export function getUserPermissions(
    workplace: RCPWorkplace,
    permissionString: string
): UserPermission {
    console.log(workplace);
    if (workplace) {
        const workplaceId = workplace.id;
        const deparmentId = workplace.departmentId;
        const permissions = permissionString.split(';');

        const workplaceQueryPermission =
            'UPS' + workplaceId.toString().padStart(5, '0');
        const workplaceModifyPermission =
            'UMS' + workplaceId.toString().padStart(5, '0');
        const departmentQueryPermission =
            'UPW' + deparmentId.toString().padStart(5, '0');
        const departmentModifyPermission =
            'UMW' + deparmentId.toString().padStart(5, '0');
        console.log(workplaceQueryPermission);

        return {
            departmentModifyPermission: permissions.includes(
                departmentModifyPermission
            ),
            departmentQueryPermission: permissions.includes(
                departmentQueryPermission
            ),
            workplaceModifyPermission: permissions.includes(
                workplaceModifyPermission
            ),
            workplaceQueryPermission: permissions.includes(
                workplaceQueryPermission
            ),
        };
    }
    return {
        departmentModifyPermission: false,
        departmentQueryPermission: false,
        workplaceModifyPermission: false,
        workplaceQueryPermission: false,
    };
}
