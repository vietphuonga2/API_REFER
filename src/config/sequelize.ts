import { Sequelize } from 'sequelize';

import { environment } from './';
console.log(environment);
export const sequelize = new Sequelize(
  environment.database,
  environment.user,
  environment.password,

  {
    host: environment.host,
    dialect: 'mysql',
    logging: false,
    port: environment.db_port || 3306,
    // query: { raw: true },
    timezone: '+07:00',
    pool: {
      max: 30,
      min: 0,
      acquire: 60000,
      idle: 5000,
    },
  },
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    // return sequelize.sync({ force: false, alter: true, logging: console.log });
  })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// sequelize
//   // thêm mới mà k xóa
//   .sync({ force: false, alter: true, logging: console.log })
//   // xóa hết rồi thêm lại
//   // .sync({ force: true })
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.error(err);
//   });
