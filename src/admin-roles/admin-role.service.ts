import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminRole } from './schema/admin-role.schema';
import { CreateRoleDto, UpdateRoleDto } from './dto/admin-role.dto';
import { Permission } from './schema/permission.schema';

@Injectable()
export class AdminRolesService {
  constructor(
    @InjectModel(AdminRole.name) private readonly roleModel: Model<AdminRole>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<AdminRole> {
    const { name, permissions } = createRoleDto;

    // Create a new set of permissions for this role
    const permissionDocs = await Promise.all(
      permissions.map(async (perm: any) => {
        return await new this.permissionModel({
          name: perm.name,
          isAllowed: perm.isAllowed,
        }).save();
      }),
    );

    // Create new role
    const newRole = new this.roleModel({ name, permissions: permissionDocs });
    return await newRole.save();
  }

  async getAllRoles(): Promise<AdminRole[]> {
    return await this.roleModel.find().populate({ path: 'permissions' }).exec();
  }

  async getRoleById(id: string): Promise<AdminRole> {
    const role = await this.roleModel
      .findById(id)
      .populate({ path: 'permissions', model: 'Permission' })
      .exec();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<AdminRole> {
    const { name, permissions } = updateRoleDto;

    // Find the role to get old permissions
    const existingRole = await this.roleModel.findById(id).exec();
    if (!existingRole) throw new NotFoundException('Role not found');

    // Delete old permissions (to avoid orphaned data)
    await this.permissionModel.deleteMany({
      _id: { $in: existingRole.permissions },
    });

    // Create new permissions
    const permissionDocs = await Promise.all(
      permissions.map(async (perm: any) => {
        return await new this.permissionModel({
          name: perm.name,
          isAllowed: perm.isAllowed,
        }).save();
      }),
    );

    // Update role with new permissions
    const updatedRole = await this.roleModel
      .findByIdAndUpdate(
        id,
        { name, permissions: permissionDocs },
        { new: true },
      )
      .populate('permissions')
      .exec();

    return updatedRole;
  }

  async deleteRole(id: string): Promise<AdminRole> {
    const deletedRole = await this.roleModel.findByIdAndDelete(id).exec();
    if (!deletedRole) throw new NotFoundException('Role not found');

    // Delete all associated permissions for this role
    await this.permissionModel
      .deleteMany({ _id: { $in: deletedRole.permissions } })
      .exec();

    return deletedRole;
  }
}
