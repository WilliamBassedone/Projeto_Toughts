const { DataTypes } = require('sequelize')

const db = require('../db/conn')

// 

const User = require('./User')

const Tought = db.define('Tought', {
      title: {
            type: DataTypes.STRING,
            allowNull: false,
            require: true,
      },
})

// Relacionamentos entre as tabelas

// Um pensamento pertence um usuário
Tought.belongsTo(User)

// Um usuário tem muitos pensamentos
User.hasMany(Tought)

module.exports = Tought