import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { CategoryEntity } from './entities/category.entity';
import { MenuItemEntity } from './entities/menu-item.entity';

describe('MenuService', () => {
  let service: MenuService;
  let categoryRepo: any;
  let menuItemRepo: any;

  const mockCategory = { _id: '1', name: 'Vegetarian' };
  const mockMenuItem = { _id: '101', name: 'Masala Dosa', price: 10 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([mockCategory]),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MenuItemEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([mockMenuItem]),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    categoryRepo = module.get(getRepositoryToken(CategoryEntity));
    menuItemRepo = module.get(getRepositoryToken(MenuItemEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all categories', async () => {
    const result = await service.findAllCategories();
    expect(result).toEqual([mockCategory]);
    expect(categoryRepo.find).toHaveBeenCalled();
  });

  it('should return all menu items', async () => {
    const result = await service.findAllMenuItems();
    expect(result).toEqual([mockMenuItem]);
    expect(menuItemRepo.find).toHaveBeenCalled();
  });

  it('sets the required timestamps for new menu items', async () => {
    menuItemRepo.create.mockImplementation((value: unknown) => value);
    menuItemRepo.save.mockImplementation((value: unknown) => value);
    const saved = await service.createMenuItem({ name: 'Probe', price: 1 });
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(saved.updatedAt).toBeInstanceOf(Date);
  });
});
