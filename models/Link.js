const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

const LinkModel = sequelize.define(
  'links',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER,
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    source: {
      allowNull: false,
      defaultValue: null,
      type: Sequelize.TEXT,
    },
    slug: {
      allowNull: false,
      defaultValue: null,
      type: Sequelize.TEXT,
    },
    is_expire_type: {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.TINYINT,
    },
    expire_time: {
      defaultValue: null,
      type: Sequelize.TIME,
    },
    clicks: {
      defaultValue: 0,
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    created_at: {
      type: Sequelize.TIME,
      allowNull: false,
    },

    updated_at: {
      type: Sequelize.TIME,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = LinkModel;
