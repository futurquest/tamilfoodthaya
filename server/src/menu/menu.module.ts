import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { Category, CategorySchema } from './schemas/category.schema';
import { MenuItem, MenuItemSchema } from './schemas/menu-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  controllers: [MenuController],
  providers: [MenuService]
})
export class MenuModule { }
