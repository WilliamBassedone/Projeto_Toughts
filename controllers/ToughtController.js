
// Models
const Tought = require('../models/Tought')
const User = require('../models/User')

// Para o filtro like
const { Op } = require('sequelize')

module.exports = class ToughtController {

      static async showToughts(req, res) {

            // Search

            let search = ''

            if (req.query.search) {
                  search = req.query.search
            }

            // Order

            let order = 'DESC'

            if (req.query.order === 'old') {
                  order = 'ASC'
            } else {
                  order = 'DESC'
            }

            const toughtsData = await Tought.findAll({

                  // Join com a tabela toughts e a tabela users, Trazendo o autor de cada pensamento
                  include: User,

                  // Filtro like, se não existir traz todos os resultados
                  where: {
                        title: { [Op.like]: `%${search}%` }
                  },

                  order: [['createdAt', order]],
            })

            const toughts = toughtsData.map((result) => result.get({ plain: true }))

            let toughtsQty = toughts.length

            if (toughtsQty === 0) {
                  toughtsQty = false
            }

            res.render('toughts/home', { toughts, search, toughtsQty })
      }

      static async dashboard(req, res) {

            const userId = req.session.userid

            const user = await User.findOne({
                  where: {
                        id: userId,
                  },

                  //Traz todos os dados desse usuário da tabela
                  include: Tought,
                  plain: true,
            })

            // check if user exists
            if (!user) {
                  res.redirect('/login')
            }


            // console.log(user.Toughts)

            const toughts = user.Toughts.map((result) => result.dataValues)

            let emptyToughts = false

            if (toughts.length === 0) {
                  emptyToughts = true
            }
            // console.log(toughts)

            res.render('toughts/dashboard', { toughts, emptyToughts })
      }

      static createTought(req, res) {
            res.render('toughts/create')
      }

      static async createToughtSave(req, res) {
            const tought = {
                  title: req.body.title,
                  UserId: req.session.userid
            }
            await Tought.create(tought)

            req.flash('message', 'Pensamento criado com sucesso!')

            try {
                  req.session.save(() => {
                        res.redirect('/toughts/dashboard')

                  })
            } catch (error) {
                  console.log('Erro: ' + error)
            }
      }

      static async removeTought(req, res) {
            const id = req.body.id
            const UserId = req.session.userid

            try {
                  await Tought.destroy({ where: { id: id, UserId: UserId } })
                  req.flash('message', 'Pensamento removido com sucesso!')
                  req.session.save(() => {
                        res.redirect('/toughts/dashboard')

                  })
            } catch (error) {
                  console.log('Erro: ' + error)
            }
      }

      static async updateTought(req, res) {
            const id = req.params.id
            const tought = await Tought.findOne({ where: { id: id }, raw: true })
            res.render('toughts/edit', { tought })
      }

      static async updateToughtSave(req, res) {


            // Filtro para o SQL Sequelize
            const id = req.body.id

            // Dado a ser atualizado
            const tought = {
                  title: req.body.title
            }

            try {
                  await Tought.update(tought, { where: { id: id } })

                  req.flash('message', 'Pensamento atualizado com sucesso!')
                  req.session.save(() => {
                        res.redirect('/toughts/dashboard')

                  })
            } catch (error) {
                  console.log('Erro' + error)
            }
      }
}