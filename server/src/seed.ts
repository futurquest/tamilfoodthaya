import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity, CategoryType } from './menu/entities/category.entity';
import { MenuItemEntity } from './menu/entities/menu-item.entity';
import { CateringPackageEntity } from './catering/entities/catering-package.entity';

const now = () => new Date();

function newObjectId(): string {
    const { randomBytes } = require('crypto');
    return randomBytes(12).toString('hex');
}

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const categoryRepo = app.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
    const menuItemRepo = app.get<Repository<MenuItemEntity>>(getRepositoryToken(MenuItemEntity));
    const packageRepo = app.get<Repository<CateringPackageEntity>>(getRepositoryToken(CateringPackageEntity));

    console.log('Clearing existing Catering & Menu data...');
    await packageRepo.delete({});
    await menuItemRepo.delete({});
    await categoryRepo.delete({});

    console.log('Inserting Categories...');
    const catHoofdgerechten = await categoryRepo.save(categoryRepo.create({ _id: newObjectId(), name: 'Hoofdgerechten', type: CategoryType.FOOD, order: 1 }));
    const catCurrysVeg = await categoryRepo.save(categoryRepo.create({ _id: newObjectId(), name: 'Currys veg', type: CategoryType.FOOD, order: 2 }));
    const catStandaardCurry = await categoryRepo.save(categoryRepo.create({ _id: newObjectId(), name: 'Standaard curry', type: CategoryType.FOOD, order: 3 }));
    const catStarters = await categoryRepo.save(categoryRepo.create({ _id: newObjectId(), name: 'Starters', type: CategoryType.FOOD, order: 4 }));
    const catDessert = await categoryRepo.save(categoryRepo.create({ _id: newObjectId(), name: 'Dessert', type: CategoryType.FOOD, order: 5 }));
    const catDrinken = await categoryRepo.save(categoryRepo.create({ _id: newObjectId(), name: 'Drinken', type: CategoryType.BEVERAGE, order: 6 }));

    console.log('Inserting Menu Items...');
    const createItem = async (catId: string, name: string, price: number, image: string, choices: any[] = []) => {
        return await menuItemRepo.save(menuItemRepo.create({
            _id: newObjectId(),
            name,
            price,
            image,
            categoryId: catId,
            choices,
            available: true,
            isActive: true,
            dailyAvailability: true,
            createdAt: now(),
            updatedAt: now(),
        }));
    };

    const rolls = await createItem(catStarters._id, 'Rolls', 2, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600', [
        { name: 'Mutton', priceModifier: 0 },
        { name: 'Chicken', priceModifier: 0 }
    ]);
    const vadai = await createItem(catStarters._id, 'Vadai', 1.5, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600');
    const softCake = await createItem(catStarters._id, 'Soft cake', 2, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600');

    const kottu = await createItem(catHoofdgerechten._id, 'Kotthu Rotti', 12, 'https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?auto=format&fit=crop&q=80&w=600', [
        { name: 'Beef', priceModifier: 0 },
        { name: 'Mutton', priceModifier: 0 },
        { name: 'Chicken', priceModifier: 0 },
        { name: 'Vegetarisch', priceModifier: 0 }
    ]);
    const friedRice = await createItem(catHoofdgerechten._id, 'Fried rice', 10, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600', [
        { name: 'Kip', priceModifier: 0 },
        { name: 'Garnalen', priceModifier: 0 },
        { name: 'Vegetarisch', priceModifier: 0 }
    ]);
    const noedels = await createItem(catHoofdgerechten._id, 'Noedels', 10, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600', [
        { name: 'Kip', priceModifier: 0 },
        { name: 'Garnalen', priceModifier: 0 },
        { name: 'Vegetarisch', priceModifier: 0 }
    ]);
    const idiyappam = await createItem(catHoofdgerechten._id, 'Idiyappam met sambal en soddhi', 12, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=600');
    const biryani = await createItem(catHoofdgerechten._id, 'Biryani', 14, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600', [
        { name: 'Chicken', priceModifier: 0 },
        { name: 'Mutton', priceModifier: 0 },
        { name: 'Beef', priceModifier: 0 },
        { name: 'Vegetarisch', priceModifier: 0 }
    ]);
    const nethilliPuttu = await createItem(catHoofdgerechten._id, 'Nethilli Puttu', 12, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600');
    const whiteRice = await createItem(catHoofdgerechten._id, 'Witte rijst', 6, 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=600');

    const aubergineCurry = await createItem(catCurrysVeg._id, 'Aubergine curry', 6, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600');
    const paneerCurry = await createItem(catCurrysVeg._id, 'Paneer curry', 7, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600');
    const daalCurry = await createItem(catCurrysVeg._id, 'Daal curry', 5, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600');
    const uienSalade = await createItem(catCurrysVeg._id, 'Uien salade', 3, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600');
    const aardappelCurry = await createItem(catCurrysVeg._id, 'Aardappelcurry', 5, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600');
    const kousenbandCurry = await createItem(catCurrysVeg._id, 'Kousenbandcurry', 6, 'https://images.unsplash.com/photo-1515516969-d4008cc6241a?auto=format&fit=crop&q=80&w=600');
    const linzenCurry = await createItem(catCurrysVeg._id, 'Linzencurry', 5, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600');

    const chickenCurry = await createItem(catStandaardCurry._id, 'Chicken curry', 8, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600');
    const muttonCurry = await createItem(catStandaardCurry._id, 'Mutton curry', 10, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600');
    const friedChicken = await createItem(catStandaardCurry._id, 'Gebakken kip', 7, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600');

    const fruitSalade = await createItem(catDessert._id, 'Huisgemaakste fruitsalade met ijs', 5, 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=600');
    const mangoLassi = await createItem(catDrinken._id, 'Mango lassi', 4, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=600');
    const rosemilk = await createItem(catDrinken._id, 'Rosemilk', 3.5, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600');
    const cola = await createItem(catDrinken._id, 'Cola (zero)', 2.5, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600');
    const fanta = await createItem(catDrinken._id, 'Fanta', 2.5, 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&q=80&w=600');
    const water = await createItem(catDrinken._id, 'Water', 2, 'https://images.unsplash.com/photo-1616118132534-381148898bb4?auto=format&fit=crop&q=80&w=600');

    console.log('Inserting Catering Packages...');

    await packageRepo.save(packageRepo.create({
        _id: newObjectId(),
        name: 'Buffet Pakket - Meest Gekozen',
        description: 'We bieden een buffet aan voor €13,00 per persoon. \nHierbij kan er gekozen worden uit 5 gerechten.\n\nStandaard inbegrepen (geen keuze nodig): Chicken curry, Mutton curry, Gebakken kip en uiensalade.',
        basePrice: 13,
        minGuests: 10,
        available: true,
        isActive: true,
        sortOrder: 1,
        categories: [
            {
                name: 'Kies 5 gerechten',
                description: 'Kies uit Hoofdgerechten en 2 Vega Currys',
                minSelect: 5,
                maxSelect: 5,
                items: [
                    { menuItem: kottu._id },
                    { menuItem: friedRice._id },
                    { menuItem: noedels._id },
                    { menuItem: idiyappam._id },
                    { menuItem: biryani._id },
                    { menuItem: nethilliPuttu._id },
                    { menuItem: whiteRice._id },
                    { menuItem: aubergineCurry._id },
                    { menuItem: paneerCurry._id },
                    { menuItem: daalCurry._id },
                    { menuItem: aardappelCurry._id },
                    { menuItem: kousenbandCurry._id },
                    { menuItem: linzenCurry._id },
                    { menuItem: uienSalade._id },
                ]
            }
        ]
    }));

    await packageRepo.save(packageRepo.create({
        _id: newObjectId(),
        name: 'All-in Pakket',
        description: 'Wij hebben ook onze eigen all in pakket. Beschikbaar voor €23 per persoon.',
        basePrice: 23,
        minGuests: 10,
        available: true,
        isActive: true,
        sortOrder: 2,
        categories: [
            {
                name: 'Drinken & Starters',
                description: 'Kies naar wens',
                minSelect: 0,
                maxSelect: 10,
                items: [
                    { menuItem: mangoLassi._id },
                    { menuItem: rosemilk._id },
                    { menuItem: cola._id },
                    { menuItem: fanta._id },
                    { menuItem: water._id },
                    { menuItem: rolls._id },
                    { menuItem: vadai._id },
                    { menuItem: softCake._id },
                ]
            },
            {
                name: 'Hoofdgerechten',
                description: 'Kies uw hoofdgerecht',
                minSelect: 1,
                maxSelect: 5,
                items: [
                    { menuItem: biryani._id },
                    { menuItem: friedRice._id },
                    { menuItem: idiyappam._id },
                    { menuItem: kottu._id },
                    { menuItem: whiteRice._id },
                ]
            },
            {
                name: 'Currys Veg',
                description: 'Kies uw vegetarische currys',
                minSelect: 1,
                maxSelect: 4,
                items: [
                    { menuItem: aubergineCurry._id },
                    { menuItem: paneerCurry._id },
                    { menuItem: daalCurry._id },
                    { menuItem: uienSalade._id },
                ]
            },
            {
                name: 'Standaard Currys',
                description: 'Kies uw vlees currys',
                minSelect: 1,
                maxSelect: 3,
                items: [
                    { menuItem: chickenCurry._id },
                    { menuItem: muttonCurry._id },
                    { menuItem: friedChicken._id },
                ]
            },
            {
                name: 'Dessert',
                description: 'Kies uw dessert',
                minSelect: 0,
                maxSelect: 1,
                items: [
                    { menuItem: fruitSalade._id },
                ]
            }
        ]
    }));

    console.log('Database successfully seeded!');
    await app.close();
}

bootstrap();