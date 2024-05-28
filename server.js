const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
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

// Conexão com o banco de dados MySQL usando pool de conexões
const pool = mysql.createPool({
    connectionLimit: 40, // Limite de conexões no pool
    host: 'sql10.freesqldatabase.com',
    user: 'sql10710062',
    password: '1Y5xlnDAJQ',
    database: 'sql10710062'
});

// Função para executar consultas SQL
function executeQuery(query, params) {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

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
        subject: `Novo contato do formulário: ${name} email ${email}`,
        text: message
    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
        console.log(`Enviado email de formulário`);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email' });
        console.log(`ERRO: Não foi enviado email de formulário`);
    }
});

app.post('/send-email-register', async (req, res) => {
    const { username, email } = req.body;
    const mailOptions = {
        from: 'sistema.financy@gmail.com',
        to: `${email}`,
        subject: `Email surpresa!`,
        text: `f1nancy agradece pelo seu cadastro, ${username} seja bem-vindo a uma vida financeira organizada`
    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
        console.log(`Enviado email de registro`);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email' });
        console.log(`ERRO: Não foi enviado email de registro`);
    }
});

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
        await executeQuery(query, [username, email, hashedPassword]);
        res.json({ message: 'Usuário registrado com sucesso' });
        console.log(`Usuário registrado`);
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
        console.log(`Erro ao registrar usuário`);
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
        const results = await executeQuery(query, [username]);
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
        console.log(`Login Feito com sucesso`);
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.json({ success: false, message: 'Erro ao fazer login.' });
        console.log(`Erro ao fazer Login`);
    }
});

// Rota para fazer logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            res.status(500).json({ error: 'Erro ao fazer logout' });
            console.log(`Erro ao fazer Logout`);
        } else {
            res.json({ message: 'Logout bem-sucedido' });
            console.log(`Logout Feito`);
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
app.get('/transactions', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const sql = 'SELECT * FROM transacao WHERE user_id = ? ORDER BY date DESC';
    try {
        const results = await executeQuery(sql, [userId]);
        res.status(200).json(results);
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro ao buscar transações' });
        console.log(`Erro ao fazer buscar transações`);
    }
});

// Rota POST para adicionar uma nova transação
app.post('/transactions', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const { date, value, description, category, transaction_type } = req.body;
    const sql = 'INSERT INTO transacao (date, value, description, category, transaction_type, user_id) VALUES (?, ?, ?, ?, ?, ?)';
    try {
        const result = await executeQuery(sql, [date, value, description, category, transaction_type || null, userId]);
        res.status(200).json({ id: result.insertId, date, value, description, category, transaction_type });
        console.log(`Adicionado transação`);
    } catch (err) {
        console.error('Erro ao adicionar transação:', err);
        res.status(500).json({ error: 'Erro ao adicionar transação' });
        console.log(`Erro ao fazer adicionar transação`);
    }
});

// Rota GET para buscar uma transação específica para edição
app.get('/transactions/:id', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const id = req.params.id;
    const sql = 'SELECT * FROM transacao WHERE id=? AND user_id=?';
    try {
        const result = await executeQuery(sql, [id, userId]);
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ error: 'Transação não encontrada' });
            console.log(`Erro ao fazer procurar transação`);
        }
    } catch (err) {
        console.error('Erro ao buscar transação para edição:', err);
        res.status(500).json({ error: 'Erro ao buscar transação para edição' });
        console.log(`Erro ao fazer procurar transação`);
    }
});

// Rota PUT para editar uma transação existente
app.put('/transactions/:id', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const id = req.params.id;
    const { date, value, description, category, transactionType } = req.body;
    const sql = 'UPDATE transacao SET date=?, value=?, description=?, category=?, transaction_type=? WHERE id=? AND user_id=?';
    try {
        await executeQuery(sql, [date, value, description, category, transactionType, id, userId]);
        res.status(200).json({ id, date, value, description, category, transactionType });
        console.log(`Transação editada`);
    } catch (err) {
        console.error('Erro ao editar transação:', err);
        res.status(500).json({ error: 'Erro ao editar transação' });
        console.log(`Erro ao editar uma transação`);
    }
});

// Rota DELETE para excluir uma transação existente
app.delete('/transactions/:id', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const id = req.params.id;
    const sql = 'DELETE FROM transacao WHERE id=? AND user_id=?';
    try {
        await executeQuery(sql, [id, userId]);
        res.status(200).json({ id });
        console.log(`Transação deletada`);
    } catch (err) {
        console.error('Erro ao excluir transação:', err);
        res.status(500).json({ error: 'Erro ao excluir transação' });
        console.log(`Erro ao deletar transação`);
    }
});

// Rota POST para filtrar transações com base nos parâmetros enviados
app.post('/filtered-transactions', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const { start_date, end_date, category, transaction_type } = req.body;

    let sql = 'SELECT * FROM transacao WHERE user_id = ?';
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

    try {
        const results = await executeQuery(sql, params);
        res.status(200).json(results);
        console.log(`Filtrado transação`);
    } catch (error) {
        console.error('Erro ao filtrar transações:', error);
        res.status(500).json({ error: 'Erro ao filtrar transações' });
        console.log(`Erro ao filtrar transação`);
    }
});

// Rota GET para buscar dados do dashboard
app.get('/dashboard-data', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const totalRevenueQuery = `SELECT SUM(value) AS totalRevenue FROM transacao WHERE transaction_type = "receita" AND user_id = ?`;
        const totalExpensesQuery = `SELECT SUM(value) AS totalExpenses FROM transacao WHERE transaction_type = "despesa" AND user_id = ?`;
        const expensesByCategoryQuery = `SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "despesa" AND user_id = ? GROUP BY category`;
        const revenueByCategoryQuery = `SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "receita" AND user_id = ? GROUP BY category`;

        const totalRevenueResult = await executeQuery(totalRevenueQuery, [userId]);
        const totalExpensesResult = await executeQuery(totalExpensesQuery, [userId]);
        const expensesByCategoryResult = await executeQuery(expensesByCategoryQuery, [userId]);
        const revenueByCategoryResult = await executeQuery(revenueByCategoryQuery, [userId]);

        const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
        const totalExpenses = totalExpensesResult[0]?.totalExpenses || 0;

        const expensesByCategory = expensesByCategoryResult.map(row => ({
            category: row.category,
            total: row.total
        }));

        const revenueByCategory = revenueByCategoryResult.map(row => ({
            category: row.category,
            total: row.total
        }));

        const currentBalance = totalRevenue - totalExpenses;

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
        console.log(`Erro ao fazer carregar Dashboard`);
    }
});

// Rota GET para buscar dados de despesas mensais
app.get('/monthly-expenses', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const monthlyExpensesQuery = `
            SELECT MONTH(date) as month, SUM(value) AS total
            FROM transacao
            WHERE transaction_type = 'despesa' AND user_id = ?
            GROUP BY MONTH(date)
            ORDER BY MONTH(date);
        `;

        const monthlyExpensesResult = await executeQuery(monthlyExpensesQuery, [userId]);

        const monthlyExpenses = Array.from({ length: 12 }, (_, i) => {
            const monthData = monthlyExpensesResult.find(row => row.month === i + 1);
            return monthData ? monthData.total : 0;
        });

        res.json({ monthlyExpenses });
    } catch (error) {
        console.error('Erro ao buscar dados de despesas mensais:', error);
        res.status(500).json({ error: 'Erro ao buscar dados de despesas mensais' });
        console.log(`Erro ao fazer carregar Despesas Mensais`);
    }
});

// Rota GET para obter todas as metas do usuário
app.get('/metas', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const sql = 'SELECT * FROM meta WHERE user_id = ?';
    try {
        const results = await executeQuery(sql, [userId]);
        res.status(200).json(results);
    } catch (error) {
        console.error('Erro ao buscar metas:', error);
        res.status(500).json({ error: 'Erro ao buscar metas' });
        console.log(`Erro ao ao buscar metas`);
    }
});

// Rota POST para adicionar uma nova meta
app.post('/metas', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const { name, due_date, value } = req.body;
    const sql = `INSERT INTO meta (name, due_date, value, user_id) VALUES (?, ?, ?, ?)`;
    try {
        const result = await executeQuery(sql, [name, due_date, value, userId]);
        res.status(200).json({ id: result.insertId, name, due_date, value });
    } catch (err) {
        console.error('Erro ao adicionar meta:', err);
        res.status(500).json({ error: 'Erro ao adicionar meta' });
        console.log(`Erro ao adicionar meta`);
    }
});

// Rota DELETE para remover uma meta existente
app.delete('/metas/:id', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const id = req.params.id;
    const sql = `DELETE FROM meta WHERE id=? AND user_id=?`;
    try {
        await executeQuery(sql, [id, userId]);
        res.status(200).json({ id });
    } catch (err) {
        console.error('Erro ao excluir meta:', err);
        res.status(500).json({ error: 'Erro ao excluir meta' });
        console.log(`Erro ao excluir meta`);
    }
});

// Rota POST para finalizar uma meta
app.post('/finalize-meta', isAuthenticated, async (req, res) => {
    const { metaId } = req.body;
    const userId = req.session.userId;

    try {
        const totalRevenueQuery = `SELECT SUM(value) AS totalRevenue FROM transacao WHERE transaction_type = "receita" AND user_id = ?`;
        const totalExpensesQuery = `SELECT SUM(value) AS totalExpenses FROM transacao WHERE transaction_type = "despesa" AND user_id = ?`;

        const revenueResults = await executeQuery(totalRevenueQuery, [userId]);
        const expensesResults = await executeQuery(totalExpensesQuery, [userId]);

        const totalRevenue = revenueResults[0]?.totalRevenue || 0;
        const totalExpenses = expensesResults[0]?.totalExpenses || 0;
        const currentBalance = totalRevenue - totalExpenses;

        const queryMeta = `SELECT * FROM meta WHERE id = ? AND user_id = ?`;
        const results = await executeQuery(queryMeta, [metaId, userId]);
        const meta = results[0];
        const progress = (currentBalance / meta.value) * 100;

        if (progress < 100) {
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
        await executeQuery(queryInsertTransaction, [userId, transaction.date, transaction.value, transaction.description, transaction.category, transaction.transaction_type]);

        const queryDeleteMeta = `DELETE FROM meta WHERE id = ? AND user_id = ?`;
        await executeQuery(queryDeleteMeta, [metaId, userId]);

        res.status(200).json({ message: 'Meta finalizada e transação criada com sucesso' });
    } catch (error) {
        console.error('Erro ao finalizar meta:', error);
        res.status(500).json({ error: 'Erro ao finalizar meta' });
        console.log(`Erro ao finalizar meta`);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
