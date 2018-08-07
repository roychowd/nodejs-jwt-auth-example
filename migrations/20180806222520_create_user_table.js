exports.up = function(knex, Promise) {
  return knex.schema.createTable("login_user", table => {
    table
      .increments("id")
      .unsigned()
      .primary();
    table.string("email").notNull();
    table.string("password_digest").notNull();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("login_user");
};
