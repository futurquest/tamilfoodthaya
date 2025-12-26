import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MenuService } from './menu.service';
import { Category } from './schemas/category.schema';
import { MenuItem } from './schemas/menu-item.schema';

describe('MenuService', () => {
  let service: MenuService;
  let categoryModel: any;
  let menuItemModel: any;

  const mockCategory = { _id: '1', name: 'Vegetarian' };
  const mockMenuItem = { _id: '101', name: 'Masala Dosa', price: 10 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getModelToken(Category.name),
          useValue: {
            find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockCategory]) }),
            new: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn(),
          },
        },
        {
          provide: getModelToken(MenuItem.name),
          useValue: {
            find: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([mockMenuItem]) }),
          },
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    categoryModel = module.get(getModelToken(Category.name));
    menuItemModel = module.get(getModelToken(MenuItem.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all categories', async () => {
    const findMock = {
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockCategory]),
    };
    categoryModel.find.mockReturnValue(findMock);

    const result = await service.findAllCategories();
    expect(result).toEqual([mockCategory]);
    expect(categoryModel.find).toHaveBeenCalled();
    expect(findMock.sort).toHaveBeenCalledWith({ order: 1 });
  });

  it('should return all menu items', async () => {
    const findMock = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockMenuItem]),
    };
    menuItemModel.find.mockReturnValue(findMock);

    const result = await service.findAllMenuItems();
    expect(result).toEqual([mockMenuItem]);
    expect(menuItemModel.find).toHaveBeenCalled();
    expect(findMock.populate).toHaveBeenCalledWith('categoryId');
  });
});
