import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { CategoryEntity } from './entities/category.entity';
import { MenuItemEntity } from './entities/menu-item.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CategoryEntity, MenuItemEntity]),
    ],
    controllers: [MenuController],
    providers: [MenuService],
})
export class MenuModule { }
