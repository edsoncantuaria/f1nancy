const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

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
    database: 'financy'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL');
});

// Carregar arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));


// Rota GET para carregar a página inicial
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
      const [rows] = await db.execute('SELECT * FROM usuario WHERE username = ?', [username]);
      if (rows.length === 0) {
        return res.json({ success: false, message: 'Usuário não encontrado.' });
      }
  
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.json({ success: false, message: 'Senha incorreta.' });
      }
  
      req.session.userId = user.id;
      res.json({ success: true, message: 'Login bem-sucedido!' });
    } catch (err) {
      console.error(err);
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
    const sql = 'SELECT * FROM transacao WHERE user_id = ?';
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
    const { date, value, description, category, subcategory, account, payment_method, transaction_type } = req.body;
    const sql = `INSERT INTO transacao (date, value, description, category, subcategory, account, payment_method, transaction_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [date, value, description, category, subcategory, account, payment_method || null, transaction_type || null, userId], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar transação:', err);
            res.status(500).json({ error: 'Erro ao adicionar transação' });
        } else {
            console.log('Transação adicionada:', result);
            res.status(200).json({ id: result.insertId, date, value, description, category, subcategory, account, payment_method, transaction_type });
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
    const { date, value, description, category, subcategory, account, paymentMethod, transactionType } = req.body;
    const sql = `UPDATE transacao SET date=?, value=?, description=?, category=?, subcategory=?, account=?, payment_method=?, transaction_type=? WHERE id=? AND user_id=?`;
    connection.query(sql, [date, value, description, category, subcategory, account, paymentMethod, transactionType, id, userId], (err, result) => {
        if (err) {
            console.error('Erro ao editar transação:', err);
            res.status(500).json({ error: 'Erro ao editar transação' });
        } else {
            console.log('Transação editada:', result);
            res.status(200).json({ id, date, value, description, category, subcategory, account, paymentMethod, transactionType });
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

// Outras rotas (dashboard, filtro, etc) permanecem inalteradas, mas precisam verificar o `userId` na consulta SQL
// Rota POST para filtrar transações com base nos parâmetros enviados
app.post('/filtered-transactions', (req, res) => {
    const userId = req.session.userId;
    const { start_date, end_date, category, subcategory, account, payment_method, transaction_type } = req.body;

    // Construir a consulta SQL dinamicamente com base nos parâmetros recebidos
    let sql = 'SELECT * FROM transacao WHERE 1=1'; // Começa com 1=1 para facilitar a concatenação dos filtros

    if (start_date) {
        sql += ` AND date >= '${start_date}'`;
    }

    if (end_date) {
        sql += ` AND date <= '${end_date}'`;
    }

    if (category) {
        sql += ` AND category LIKE '%${category}%'`;
    }

    if (subcategory) {
        sql += ` AND subcategory LIKE '%${subcategory}%'`;
    }

    if (account) {
        sql += ` AND account = '${account}'`;
    }

    if (payment_method) {
        sql += ` AND payment_method = '${payment_method}'`;
    }

    if (transaction_type) {
        sql += ` AND transaction_type = '${transaction_type}'`;
    }

    // Executar a consulta SQL construída com os filtros e retornar as transações filtradas
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Erro ao filtrar transações:', error);
            res.status(500).json({ error: 'Erro ao filtrar transações' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Rota GET para buscar dados do dashboard do usuário
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

        // Enviar dados do dashboard para o cliente
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

// Função para executar consultas SQL e retornar uma Promise
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



app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
