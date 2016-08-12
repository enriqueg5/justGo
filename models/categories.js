'use strict';
module.exports = function(sequelize, DataTypes) {
  var Categories = sequelize.define('Categories', {
    category: DataTypes.STRING,
    city: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Categories;
};