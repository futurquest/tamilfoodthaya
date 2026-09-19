import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomBytes } from 'crypto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/create-menu-item.dto';
import { MenuItemEntity } from './entities/menu-item.entity';

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

const IMAGE_EXTENSIONS: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

const imageUploadOptions = {
    storage: diskStorage({
        destination: './uploads/menu',
        filename: (_req, file, cb) => {
            const randomName = randomBytes(16).toString('hex');
            cb(null, `${randomName}${IMAGE_EXTENSIONS[file.mimetype] || ''}`);
        },
    }),
    fileFilter: (_req: any, file: Express.Multer.File, cb: (error: Error | null, accept: boolean) => void) => {
        if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Only image files are allowed (JPEG, PNG, WebP)'), false);
        }
    },
    limits: { fileSize: MAX_IMAGE_SIZE },
};

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    @Get('categories')
    async getCategories() {
        return this.menuService.findAllCategories();
    }

    @Post('categories')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async createCategory(@Body() data: any) {
        return this.menuService.createCategory(data);
    }

    @Patch('categories/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateCategory(@Param('id') id: string, @Body() data: any) {
        return this.menuService.updateCategory(id, data);
    }

    @Delete('categories/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteCategory(@Param('id') id: string) {
        return this.menuService.deleteCategory(id);
    }

    @Get('items')
    async getMenuItems() {
        return this.menuService.findAllMenuItems();
    }

    @Get('items/category/:categoryId')
    async getByCategory(@Param('categoryId') categoryId: string) {
        return this.menuService.findByCategoryId(categoryId);
    }

    @Post('items')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('image', imageUploadOptions))
    async createItem(@Body() data: CreateMenuItemDto, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
        const itemData = { ...data };
        if (itemData.choices && typeof itemData.choices === 'string') {
            try { itemData.choices = JSON.parse(itemData.choices); } catch (e) { }
        }
        if (itemData.nameTranslations && typeof itemData.nameTranslations === 'string') {
            try { itemData.nameTranslations = JSON.parse(itemData.nameTranslations); } catch (e) { }
        }
        if (itemData.descriptionTranslations && typeof itemData.descriptionTranslations === 'string') {
            try { itemData.descriptionTranslations = JSON.parse(itemData.descriptionTranslations); } catch (e) { }
        }
        if (file) {
            // Construct the full URL
            const protocol = req.protocol;
            const host = req.get('host');
            itemData.image = `${protocol}://${host}/uploads/menu/${file.filename}`;
        }
        return this.menuService.createMenuItem(itemData as Partial<MenuItemEntity>);
    }

    @Patch('items/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('image', imageUploadOptions))
    async updateItem(@Param('id') id: string, @Body() data: UpdateMenuItemDto, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
        const itemData = { ...data };
        if (itemData.choices && typeof itemData.choices === 'string') {
            try { itemData.choices = JSON.parse(itemData.choices); } catch (e) { }
        }
        if (itemData.nameTranslations && typeof itemData.nameTranslations === 'string') {
            try { itemData.nameTranslations = JSON.parse(itemData.nameTranslations); } catch (e) { }
        }
        if (itemData.descriptionTranslations && typeof itemData.descriptionTranslations === 'string') {
            try { itemData.descriptionTranslations = JSON.parse(itemData.descriptionTranslations); } catch (e) { }
        }
        if (file) {
            const protocol = req.protocol;
            const host = req.get('host');
            itemData.image = `${protocol}://${host}/uploads/menu/${file.filename}`;
        }
        return this.menuService.updateMenuItem(id, itemData as Partial<MenuItemEntity>);
    }

    @Delete('items/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteItem(@Param('id') id: string) {
        return this.menuService.deleteMenuItem(id);
    }
}
