const User = require('../models/User')
const bcrypt = require('bcryptjs')

module.exports = class AuthController {

      static login(req, res) {
            res.render('auth/login')
      }

      static async loginPost(req, res) {


            /*
            
            Essa instrução faz parte da sintaxe de desestruturação (também conhecida como "destructuring") do JavaScript. A ideia da desestruturação é extrair valores de um objeto ou array e atribuí-los a variáveis individuais, o que torna o código mais legível e mais fácil de trabalhar.

            No caso específico do código que você mostrou, a instrução está extraindo o valor das propriedades "email" e "password" do objeto "req.body". O "req.body" é um objeto que contém os dados enviados em uma requisição HTTP no corpo da mensagem (por exemplo, em um formulário HTML enviado pelo usuário). A propriedade "email" é esperada conter o e-mail enviado pelo usuário e a propriedade "password" é esperada conter a senha enviada pelo usuário.

            A instrução está criando duas variáveis, chamadas "email" e "password", e atribuindo a elas os valores correspondentes no objeto "req.body". Depois disso, o código pode usar essas variáveis para realizar ações com esses valores (por exemplo, autenticar o usuário ou armazenar esses valores em um banco de dados).

            Em resumo, a instrução "const { email, password } = req.body" é uma maneira concisa de extrair dados de um objeto e atribuí-los a variáveis individuais para uso posterior no código.

            */
            const { email, password } = req.body

            // find user
            const user = await User.findOne({ where: { email: email } })

            if (!user) {
                  req.flash('message', 'Usuário não encontrado!')
                  res.render('auth/login')
                  return
            }

            // check if password match
            const passwordMatch = bcrypt.compareSync(password, user.password)

            if (!passwordMatch) {
                  req.flash('message', 'Usuário ou senha inválidos!')
                  res.render('auth/login')
                  return
            }

            // initialize session
            req.session.userid = user.id

            req.flash('message', 'Autenticação realizada com sucesso!')

            req.session.save(() => {
                  res.redirect('/')
            })


      }

      static register(req, res) {
            res.render('auth/register')
      }

      static async registerPost(req, res) {
            const { name, email, password, confirmpassword } = req.body

            // password match validation
            if (password != confirmpassword) {
                  // mensagem
                  req.flash('message', 'As senhas não conferem, tente novamente!')
                  res.render('auth/register')
                  return
            }

            // check if user exists
            const checkIfUserExists = await User.findOne({ where: { email: email } })

            if (checkIfUserExists) {
                  req.flash('message', 'O e-mail já está em uso!')
                  res.render('auth/register')
                  return
            }

            // create a password
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(password, salt)

            // creating object to save in the bank
            const user = {
                  name,
                  email,
                  password: hashedPassword
            }

            // saving in the bank
            try {
                  const createdUser = await User.create(user)

                  // initialize session
                  req.session.userid = createdUser.id

                  req.flash('message', 'Cadastro realizado com sucesso!')

                  req.session.save(() => {
                        res.redirect('/')
                  })

            } catch (err) {
                  console.log(err)
            }

      }

      static logout(req, res) {
            req.session.destroy()
            res.redirect('/login')
      }
}