require('dotenv/config');

const assert = require('node:assert/strict');
const { AppDataSource } = require('../dist/src/database/data-source.js');
const { CategoryEntity } = require('../dist/src/menu/entities/category.entity.js');
const { MenuItemEntity } = require('../dist/src/menu/entities/menu-item.entity.js');

const categoryId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const menuItemId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const disposableId = 'cccccccccccccccccccccccc';

async function main() {
  if (!['localhost', '127.0.0.1', '::1'].includes(process.env.POSTGRES_HOST)
    || !/^tft_migration_(clean|clone)_\d{8}$/.test(process.env.POSTGRES_DB || '')) {
    throw new Error('Migration smoke test requires an explicitly named local test database.');
  }

  const mode = process.argv[2];
  if (!['seed', 'verify', 'crud'].includes(mode)) throw new Error('Use seed, verify, or crud.');

  await AppDataSource.initialize();
  try {
    const categories = AppDataSource.getRepository(CategoryEntity);
    const menuItems = AppDataSource.getRepository(MenuItemEntity);

    if (mode === 'seed') {
      assert.equal(await categories.findOneBy({ _id: categoryId }), null);
      await categories.save({ _id: categoryId, name: 'Migration fixture category' });
      await menuItems.save({
        _id: menuItemId,
        name: 'Migration fixture item',
        price: 12.5,
        categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (mode === 'verify') {
      const category = await categories.findOneBy({ _id: categoryId });
      const item = await menuItems.findOneBy({ _id: menuItemId });
      assert.equal(category?.name, 'Migration fixture category');
      assert.equal(item?.categoryId, categoryId);
      assert.equal(item?.price, 12.5);
    }

    if (mode === 'crud') {
      assert.equal(await categories.findOneBy({ _id: disposableId }), null);
      await categories.save({ _id: disposableId, name: 'Create check' });
      assert.equal((await categories.findOneBy({ _id: disposableId }))?.name, 'Create check');
      await categories.update({ _id: disposableId }, { name: 'Update check' });
      assert.equal((await categories.findOneBy({ _id: disposableId }))?.name, 'Update check');
      await categories.delete({ _id: disposableId });
      assert.equal(await categories.findOneBy({ _id: disposableId }), null);
    }

    console.log(`migration_smoke_${mode}=passed`);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((error) => {
  console.error(`migration_smoke_failed=${error.message}`);
  process.exitCode = 1;
});
