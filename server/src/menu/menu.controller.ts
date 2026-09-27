import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { put, del } from '@vercel/blob';
import { ServiceUnavailableException } from '@nestjs/common';
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

export function hasImageSignature(mime: string, bytes: Buffer): boolean {
    if (mime === 'image/jpeg') return bytes.length >= 3 && bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    if (mime === 'image/png') return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (mime === 'image/webp') return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    return false;
}

export function imageStorageMode(env: NodeJS.ProcessEnv): 'local' | 'blob' {
    const mode = env.UPLOAD_STORAGE || (env.VERCEL === '1' ? 'blob' : 'local');
    if (mode !== 'local' && mode !== 'blob') throw new Error('UPLOAD_STORAGE must be local or blob');
    if (env.VERCEL === '1' && mode !== 'blob') throw new Error('Vercel requires persistent blob upload storage');
    return mode;
}

export async function uploadedImageUrl(file: Express.Multer.File, req: any): Promise<{ url: string; cleanup: () => Promise<void> }> {
    if (!hasImageSignature(file.mimetype, file.buffer)) throw new BadRequestException('Invalid image content');
    const filename = `${randomBytes(16).toString('hex')}${IMAGE_EXTENSIONS[file.mimetype]}`;
    if (imageStorageMode(process.env) === 'blob') {
        try {
            const blob = await put(`menu/${filename}`, file.buffer, {
                access: 'public', contentType: file.mimetype, addRandomSuffix: false,
            });
            return { url: blob.url, cleanup: () => del(blob.url) };
        } catch {
            throw new ServiceUnavailableException('Image storage is unavailable');
        }
    }
    const configured = process.env.PUBLIC_API_URL;
    if (process.env.NODE_ENV === 'production' && (!configured || !configured.startsWith('https://'))) {
        throw new BadRequestException('Image upload is not configured');
    }
    const base = configured || `${req.protocol}://${req.get('host')}`;
    const directory = join(process.cwd(), 'uploads', 'menu');
    await fs.mkdir(directory, { recursive: true });
    const path = join(directory, filename);
    await fs.writeFile(path, file.buffer, { flag: 'wx', mode: 0o600 });
    return { url: `${base.replace(/\/$/, '')}/uploads/menu/${filename}`, cleanup: () => fs.rm(path, { force: true }) };
}

const imageUploadOptions = {
    storage: memoryStorage(),
    fileFilter: (_req: any, file: Express.Multer.File, cb: (error: Error | null, accept: boolean) => void) => {
        if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Only image files are allowed (JPEG, PNG, WebP)'), false);
        }
    },
    limits: { fileSize: MAX_IMAGE_SIZE, files: 1, fields: 20, fieldSize: 64 * 1024, parts: 21 },
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
        const uploaded = file ? await uploadedImageUrl(file, req) : null;
        if (uploaded) itemData.image = uploaded.url;
        try {
            return await this.menuService.createMenuItem(itemData as Partial<MenuItemEntity>);
        } catch (error) {
            if (uploaded) await uploaded.cleanup().catch(() => undefined);
            throw error;
        }
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
        const uploaded = file ? await uploadedImageUrl(file, req) : null;
        if (uploaded) itemData.image = uploaded.url;
        try {
            return await this.menuService.updateMenuItem(id, itemData as Partial<MenuItemEntity>);
        } catch (error) {
            if (uploaded) await uploaded.cleanup().catch(() => undefined);
            throw error;
        }
    }

    @Delete('items/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteItem(@Param('id') id: string) {
        return this.menuService.deleteMenuItem(id);
    }
}
