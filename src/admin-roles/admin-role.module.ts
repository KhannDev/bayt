import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminRolesController } from './admin-role.controller';
import { AdminRolesService } from './admin-role.service';
import { AdminRole, AdminRoleSchema } from './schema/admin-role.schema';
import { Permission, PermissionSchema } from './schema/permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminRole.name, schema: AdminRoleSchema },
    ]),
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [AdminRolesController],
  providers: [AdminRolesService],
  exports: [AdminRolesService],
})
export class AdminRolesModule {}
