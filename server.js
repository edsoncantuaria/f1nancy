const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session = require('express-session');
const nodemailerSendgrid = require('nodemailer-sendgrid');


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // para produção, mude para true e use HTTPS
}));

// Conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'f1nancy'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL');
});


// Configuração do transporte de email usando SendGrid
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: {
        user: 'apikey',
        pass: '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',
    },
});
  
  app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;
  
    const mailOptions = {
      from: 'sistema.financy@gmail.com',
      to: 'sistema.financy@gmail.com',
      subject: `Novo contato do formulário: ${name} email ${email}` ,
      text: message
    };
 
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Error sending email' });
    }
  });


  app.post('/send-email-register', async (req, res) => {
    const { username, email} = req.body;
  
    const mailOptions = {
      from: 'sistema.financy@gmail.com',
      to: `${email}`,
      subject: `Email supresa!` ,
      text: `f1nancy agradece pelo seu cadastro, ${username} seja bem vindo a uma vida financeira organizada`
    };
 
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Error sending email' });
    }
  });

// Função para executar consultas SQL
function executeQuery(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

// Carregar arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticação
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/login.html');
    }
}

// Rota GET para carregar a página inicial
app.get('/', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para registrar um novo usuário
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO usuario (username, email, password) VALUES (?, ?, ?)';
        connection.query(query, [username, email, hashedPassword], (error, results) => {
            if (error) {
                console.error('Erro ao registrar usuário:', error);
                res.status(500).json({ error: 'Erro ao registrar usuário' });
            } else {
                res.json({ message: 'Usuário registrado com sucesso' });
            }
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

// Rota de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: 'Nome de usuário e senha são obrigatórios.' });
    }

    try {
        const query = 'SELECT * FROM usuario WHERE username = ?';
        connection.query(query, [username], async (error, results) => {
            if (error) {
                console.error('Erro ao buscar usuário:', error);
                return res.json({ success: false, message: 'Erro ao fazer login.' });
            }

            if (results.length === 0) {
                return res.json({ success: false, message: 'Usuário não encontrado.' });
            }

            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.json({ success: false, message: 'Senha incorreta.' });
            }

            req.session.userId = user.id;
            req.session.username = user.username;
            res.json({ success: true, message: 'Login bem-sucedido!' });
        });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.json({ success: false, message: 'Erro ao fazer login.' });
    }
});

// Rota para fazer logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            res.status(500).json({ error: 'Erro ao fazer logout' });
        } else {
            res.json({ message: 'Logout bem-sucedido' });
        }
    });
});

// Rota para verificar autenticação
app.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Rota GET para buscar e retornar todas as transações do usuário
app.get('/transactions', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const sql = 'SELECT * FROM transacao WHERE user_id = ? ORDER BY date DESC'; 
    connection.query(sql, [userId], (error, results) => {
        if (error) {
            console.error('Erro ao buscar transações:', error);
            res.status(500).json({ error: 'Erro ao buscar transações' });
        } else {
            res.status(200).json(results);
        }
    });
});


// Rota POST para adicionar uma nova transação
app.post('/transactions', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { date, value, description, category, transaction_type } = req.body;
    const sql = `INSERT INTO transacao (date, value, description, category, transaction_type, user_id) VALUES (?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [date, value, description, category, transaction_type || null, userId], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar transação:', err);
            res.status(500).json({ error: 'Erro ao adicionar transação' });
        } else {
            console.log('Transação adicionada:', result);
            res.status(200).json({ id: result.insertId, date, value, description, category, transaction_type });
        }
    });
});


// Rota GET para buscar uma transação específica para edição
app.get('/transactions/:id', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const id = req.params.id;
    const sql = `SELECT * FROM transacao WHERE id=? AND user_id=?`;
    connection.query(sql, [id, userId], (err, result) => {
        if (err) {
            console.error('Erro ao buscar transação para edição:', err);
            res.status(500).json({ error: 'Erro ao buscar transação para edição' });
        } else {
            if (result.length > 0) {
                res.status(200).json(result[0]);
            } else {
                res.status(404).json({ error: 'Transação não encontrada' });
            }
        }
    });
});




// Rota PUT para editar uma transação existente
app.put('/transactions/:id', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const id = req.params.id;
    const { date, value, description, category, transactionType } = req.body;
    const sql = `UPDATE transacao SET date=?, value=?, description=?, category=?, transaction_type=? WHERE id=? AND user_id=?`;
    connection.query(sql, [date, value, description, category, transactionType, id, userId], (err, result) => {
        if (err) {
            console.error('Erro ao editar transação:', err);
            res.status(500).json({ error: 'Erro ao editar transação' });
        } else {
            console.log('Transação editada:', result);
            res.status(200).json({ id, date, value, description, category, transactionType });
        }
    });
});



// Rota DELETE para excluir uma transação existente
app.delete('/transactions/:id', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const id = req.params.id;
    const sql = `DELETE FROM transacao WHERE id=? AND user_id=?`;
    connection.query(sql, [id, userId], (err, result) => {
        if (err) {
            console.error('Erro ao excluir transação:', err);
            res.status(500).json({ error: 'Erro ao excluir transação' });
        } else {
            console.log('Transação excluída:', result);
            res.status(200).json({ id });
        }
    });
});

// Rota POST para filtrar transações com base nos parâmetros enviados
app.post('/filtered-transactions', (req, res) => {
    const userId = req.session.userId;
    const { start_date, end_date, category, subcategory, account, payment_method, transaction_type } = req.body;

    // Construir a consulta SQL dinamicamente com base nos parâmetros recebidos
    let sql = 'SELECT * FROM transacao WHERE user_id = ?'; // Começa com user_id para filtrar pelo usuário

    const params = [userId];

    if (start_date) {
        sql += ' AND date >= ?';
        params.push(start_date);
    }

    if (end_date) {
        sql += ' AND date <= ?';
        params.push(end_date);
    }

    if (category) {
        sql += ' AND category = ?';
        params.push(category);
    }

    if (transaction_type) {
        sql += ' AND transaction_type = ?';
        params.push(transaction_type);
    }

    connection.query(sql, params, (error, results) => {
        if (error) {
            console.error('Erro ao filtrar transações:', error);
            res.status(500).json({ error: 'Erro ao filtrar transações' });
        } else {
            res.status(200).json(results);
        }
    });
});


// Rota GET para buscar dados do dashboard
app.get('/dashboard-data', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const totalRevenueQuery = `SELECT SUM(value) AS totalRevenue FROM transacao WHERE transaction_type = "receita" AND user_id = ${userId}`;
        const totalExpensesQuery = `SELECT SUM(value) AS totalExpenses FROM transacao WHERE transaction_type = "despesa" AND user_id = ${userId}`;
        const expensesByCategoryQuery = `SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "despesa" AND user_id = ${userId} GROUP BY category`;
        const revenueByCategoryQuery = `SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "receita" AND user_id = ${userId} GROUP BY category`;

        // Executar consultas e obter resultados
        const totalRevenueResult = await executeQuery(totalRevenueQuery);
        const totalExpensesResult = await executeQuery(totalExpensesQuery);
        const expensesByCategoryResult = await executeQuery(expensesByCategoryQuery);
        const revenueByCategoryResult = await executeQuery(revenueByCategoryQuery);

        // Extrair valores dos resultados
        const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
        const totalExpenses = totalExpensesResult[0]?.totalExpenses || 0;

        // Mapear resultados para as categorias
        const expensesByCategory = expensesByCategoryResult.map(row => ({
            category: row.category,
            total: row.total
        }));

        const revenueByCategory = revenueByCategoryResult.map(row => ({
            category: row.category,
            total: row.total
        }));

        // Calcular saldo atual
        const currentBalance = totalRevenue - totalExpenses;

        // Enviar resposta JSON
        res.json({
            currentBalance,
            totalRevenue,
            totalExpenses,
            expensesByCategory,
            revenueByCategory
        });
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }
});

// Rota GET para buscar dados de despesas mensais
app.get('/monthly-expenses', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const monthlyExpensesQuery = `
            SELECT MONTH(date) as month, SUM(value) AS total
            FROM transacao
            WHERE transaction_type = 'despesa' AND user_id = ${userId}
            GROUP BY MONTH(date)
            ORDER BY MONTH(date);
        `;

        // Executar consulta e obter resultados
        const monthlyExpensesResult = await executeQuery(monthlyExpensesQuery);

        // Mapear resultados para o formato desejado
        const monthlyExpenses = Array.from({ length: 12 }, (_, i) => {
            const monthData = monthlyExpensesResult.find(row => row.month === i + 1);
            return monthData ? monthData.total : 0;
        });

        // Enviar resposta JSON
        res.json({ monthlyExpenses });
    } catch (error) {
        console.error('Erro ao buscar dados de despesas mensais:', error);
        res.status(500).json({ error: 'Erro ao buscar dados de despesas mensais' });
    }
});


// Rota GET para obter todas as metas do usuário
app.get('/metas', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const sql = 'SELECT * FROM meta WHERE user_id = ?';
    connection.query(sql, [userId], (error, results) => {
        if (error) {
            console.error('Erro ao buscar metas:', error);
            res.status(500).json({ error: 'Erro ao buscar metas' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Rota POST para adicionar uma nova meta
app.post('/metas', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { name, due_date, value } = req.body;
    const sql = `INSERT INTO meta (name, due_date, value, user_id) VALUES (?, ?, ?, ?)`;
    connection.query(sql, [name, due_date, value, userId], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar meta:', err);
            res.status(500).json({ error: 'Erro ao adicionar meta' });
        } else {
            console.log('Meta adicionada:', result);
            res.status(200).json({ id: result.insertId, name, due_date, value });
        }
    });
});

// Rota DELETE para remover uma meta existente
app.delete('/metas/:id', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const id = req.params.id;
    const sql = `DELETE FROM meta WHERE id=? AND user_id=?`;
    connection.query(sql, [id, userId], (err, result) => {
        if (err) {
            console.error('Erro ao excluir meta:', err);
            res.status(500).json({ error: 'Erro ao excluir meta' });
        } else {
            console.log('Meta excluída:', result);
            res.status(200).json({ id });
        }
    });
});

// Rota POST para finalizar uma meta
app.post('/finalize-meta', (req, res) => {
    const { metaId } = req.body;
    const userId = req.session.userId;

    console.log(`Iniciando finalização da meta: metaId=${metaId}, userId=${userId}`);

    const totalRevenueQuery = `SELECT SUM(value) AS totalRevenue FROM transacao WHERE transaction_type = "receita" AND user_id = ?`;
    const totalExpensesQuery = `SELECT SUM(value) AS totalExpenses FROM transacao WHERE transaction_type = "despesa" AND user_id = ?`;

    connection.query(totalRevenueQuery, [userId], (err, revenueResults) => {
        if (err) {
            console.error('Erro ao buscar receitas:', err);
            return res.status(500).json({ error: 'Erro ao buscar receitas' });
        }

        connection.query(totalExpensesQuery, [userId], (err, expensesResults) => {
            if (err) {
                console.error('Erro ao buscar despesas:', err);
                return res.status(500).json({ error: 'Erro ao buscar despesas' });
            }

            const totalRevenue = revenueResults[0].totalRevenue || 0;
            const totalExpenses = expensesResults[0].totalExpenses || 0;
            const currentBalance = totalRevenue - totalExpenses;

            const queryMeta = `SELECT * FROM meta WHERE id = ? AND user_id = ?`;
            connection.query(queryMeta, [metaId, userId], (err, results) => {
                if (err) {
                    console.error('Erro ao buscar meta:', err);
                    return res.status(500).json({ error: 'Erro ao buscar meta' });
                }

                const meta = results[0];
                const progress = (currentBalance / meta.value) * 100;

                if (progress < 100) {
                    console.log('A meta ainda não atingiu 100%');
                    return res.status(400).json({ error: 'A meta ainda não atingiu 100%' });
                }

                const today = new Date().toISOString().split('T')[0];
                const transaction = {
                    date: today,
                    value: meta.value,
                    description: meta.name,
                    category: 'Meta',
                    transaction_type: 'despesa'
                };

                const queryInsertTransaction = `
                    INSERT INTO transacao (user_id, date, value, description, category, transaction_type)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                connection.query(queryInsertTransaction, [userId, transaction.date, transaction.value, transaction.description, transaction.category, transaction.transaction_type], (err) => {
                    if (err) {
                        console.error('Erro ao adicionar transação:', err);
                        return res.status(500).json({ error: 'Erro ao adicionar transação' });
                    }

                    const queryDeleteMeta = `DELETE FROM meta WHERE id = ? AND user_id = ?`;
                    connection.query(queryDeleteMeta, [metaId, userId], (err) => {
                        if (err) {
                            console.error('Erro ao deletar meta:', err);
                            return res.status(500).json({ error: 'Erro ao deletar meta' });
                        }

                        console.log('Meta finalizada e transação criada com sucesso');
                        res.status(200).json({ message: 'Meta finalizada e transação criada com sucesso' });
                    });
                });
            });
        });
    });
});
// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});