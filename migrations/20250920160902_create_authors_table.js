/**
 * @param { import('knex').Knex } knex
 */
exports.up = function up(knex) {
  return knex.schema.createTable('authors', (table) => {
    table.increments('id').primary();
    table.string('first_name').notNullable();
    table.string('middle_name');
    table.string('last_name').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = function down(knex) {
  return knex.schema.dropTable('authors');
};

