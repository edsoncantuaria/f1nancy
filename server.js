const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota GET para buscar e retornar todas as transações
app.get('/transactions', (req, res) => {
    connection.query('SELECT * FROM transacao', (error, results) => {
        if (error) {
            console.error('Erro ao buscar transações:', error);
            res.status(500).json({ error: 'Erro ao buscar transações' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Rota POST para adicionar uma nova transação
app.post('/transactions', (req, res) => {
    const { date, value, description, category, subcategory, account, payment_method, transaction_type } = req.body;
    const sql = `INSERT INTO transacao (date, value, description, category, subcategory, account, payment_method, transaction_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [date, value, description, category, subcategory, account, payment_method || null, transaction_type || null], (err, result) => {
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
app.get('/transactions/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT * FROM transacao WHERE id=?`;
    connection.query(sql, [id], (err, result) => {
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
app.put('/transactions/:id', (req, res) => {
    const id = req.params.id;
    const { date, value, description, category, subcategory, account, paymentMethod, transactionType } = req.body;
    const sql = `UPDATE transacao SET date=?, value=?, description=?, category=?, subcategory=?, account=?, payment_method=?, transaction_type=? WHERE id=?`;
    connection.query(sql, [date, value, description, category, subcategory, account, paymentMethod, transactionType, id], (err, result) => {
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
app.delete('/transactions/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM transacao WHERE id=?`;
    connection.query(sql, [id], (err, result) => {
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

// Rota GET para buscar e retornar transações paginadas
// app.get('/transactions', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     connection.query('SELECT * FROM transacao LIMIT ?, ?', [offset, limit], (error, results) => {
//         if (error) {
//             console.error('Erro ao buscar transações:', error);
//             res.status(500).json({ error: 'Erro ao buscar transações' });
//         } else {
//             res.status(200).json(results);
//         }
//     });
// });

app.get('/transactions', async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const transactions = await Transaction.findAll({
            offset: (page - 1) * pageSize,
            limit: pageSize,
        });

        const totalPages = Math.ceil(await Transaction.count() / pageSize);

        res.json({ transactions, totalPages });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// // Rota para obter os dados do dashboard
// app.get('/dashboard-data', (req, res) => {
//     // Consulta para obter saldo atual, receitas totais, despesas totais, despesas por categoria e receitas por categoria
//     const sql = `
//         SELECT
//             (SELECT SUM(value) FROM transacao WHERE transaction_type = 'despesa') AS totalExpenses,
//             (SELECT SUM(value) FROM transacao WHERE transaction_type = 'receita') AS totalRevenue,
//             (SELECT SUM(value) FROM transacao WHERE transaction_type = 'receita') - (SELECT SUM(value) FROM transacao WHERE transaction_type = 'despesa') AS currentBalance,
//             category,
//             SUM(value) AS total
//         FROM
//             transacao
//         WHERE
//             transaction_type IN ('despesa', 'receita')
//         GROUP BY
//             category
//     `;

//     connection.query(sql, (err, result) => {
//         if (err) {
//             console.error('Erro ao executar consulta:', err);
//             res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
//             return;
//         }

//         const data = {
//             totalExpenses: result.reduce((acc, item) => acc + (item.transaction_type === 'despesa' ? item.total : 0), 0),
//             totalRevenue: result.reduce((acc, item) => acc + (item.transaction_type === 'receita' ? item.total : 0), 0),
//             currentBalance: result[0].currentBalance || 0,
//             expensesByCategory: result.filter(item => item.transaction_type === 'despesa'),
//             revenueByCategory: result.filter(item => item.transaction_type === 'receita')
//         };

//         res.json(data);
//     });
// });

// // Rota para obter os dados do dashboard
// app.get('/dashboard-data', async (req, res) => {
//     try {
//         const [totalRevenueResult, totalExpensesResult, expensesByCategoryResult, revenueByCategoryResult] = await Promise.all([
//             connection.query('SELECT SUM(value) AS totalRevenue FROM transacao WHERE transaction_type = "Receita"'),
//             connection.query('SELECT SUM(value) AS totalExpenses FROM transacao WHERE transaction_type = "Despesa"'),
//             connection.query('SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "Despesa" GROUP BY category'),
//             connection.query('SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "Receita" GROUP BY category')
//         ]);

//         const totalRevenue = totalRevenueResult[0].totalRevenue || 0;
//         const totalExpenses = totalExpensesResult[0].totalExpenses || 0;
//         const expensesByCategory = expensesByCategoryResult.map(row => ({ category: row.category, total: row.total }));
//         const revenueByCategory = revenueByCategoryResult.map(row => ({ category: row.category, total: row.total }));

//         const currentBalance = totalRevenue - totalExpenses;

//         res.json({ currentBalance, totalRevenue, totalExpenses, expensesByCategory, revenueByCategory });
//     } catch (error) {
//         console.error('Erro ao buscar dados do dashboard:', error);
//         res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
//     }
// });

//   // Rota para obter os dados do dashboard
// app.get('/dashboard-data', async (req, res) => {
//     try {
//         const [totalRevenueResult, totalExpensesResult, expensesByCategoryResult, revenueByCategoryResult] = await Promise.all([
//             connection.query('SELECT SUM(value) AS totalRevenue FROM transacao WHERE transaction_type = "receita"'),
//             connection.query('SELECT SUM(value) AS totalExpenses FROM transacao WHERE transaction_type = "despesa"'),
//             connection.query('SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "despesa" GROUP BY category'),
//             connection.query('SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "receita" GROUP BY category')
//         ]);

//         const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
//         const totalExpenses = totalExpensesResult[0]?.totalExpenses || 0;
//         const expensesByCategory = expensesByCategoryResult.map(row => ({ category: row.category, total: row.total }));
//         const revenueByCategory = revenueByCategoryResult.map(row => ({ category: row.category, total: row.total }));

//         const currentBalance = totalRevenue - totalExpenses;

//         res.json({ currentBalance, totalRevenue, totalExpenses, expensesByCategory, revenueByCategory });
//     } catch (error) {
//         console.error('Erro ao buscar dados do dashboard:', error);
//         res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
//     }
// });


// Rota para obter os dados do dashboard

// app.get('/dashboard-data', async (req, res) => {
//     try {
//         const [
//             totalRevenueResult,
//             totalExpensesResult,
//             expensesByCategoryResult,
//             revenueByCategoryResult
//         ] = await Promise.all([
//             connection.query(
//                 'SELECT SUM(value) AS totalRevenue FROM transacao WHERE transaction_type = "receita"'
//             ),
//             connection.query(
//                 'SELECT SUM(value) AS totalExpenses FROM transacao WHERE transaction_type = "despesa"'
//             ),
//             connection.query(
//                 'SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "despesa" GROUP BY category'
//             ),
//             connection.query(
//                 'SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "receita" GROUP BY category'
//             )
//         ]);

//         const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
//         const totalExpenses = totalExpensesResult[0]?.totalExpenses || 0;
//         let expensesByCategory = [];
//         let revenueByCategory = [];

//         if (Array.isArray(expensesByCategoryResult)) {
//             expensesByCategory = expensesByCategoryResult.map(row => ({
//                 category: row.category,
//                 total: row.total
//             }));
//         }

//         if (Array.isArray(revenueByCategoryResult)) {
//             revenueByCategory = revenueByCategoryResult.map(row => ({
//                 category: row.category,
//                 total: row.total
//             }));
//         }

//         const currentBalance = totalRevenue - totalExpenses;

//         res.json({
//             currentBalance,
//             totalRevenue,
//             totalExpenses,
//             expensesByCategory,
//             revenueByCategory
//         });
//     } catch (error) {
//         console.error('Erro ao buscar dados do dashboard:', error);
//         res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
//     }
// });


// Rota para obter os dados do dashboard

// Backend (server.js)

app.get('/dashboard-data', async (req, res) => {
    try {
        const totalRevenueQuery = 'SELECT SUM(value) AS totalRevenue FROM transacao WHERE transaction_type = "receita"';
        const totalExpensesQuery = 'SELECT SUM(value) AS totalExpenses FROM transacao WHERE transaction_type = "despesa"';
        const expensesByCategoryQuery = 'SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "despesa" GROUP BY category';
        const revenueByCategoryQuery = 'SELECT category, SUM(value) AS total FROM transacao WHERE transaction_type = "receita" GROUP BY category';

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

// mensal
app.get('/monthly-expenses', async (req, res) => {
    try {
        const monthlyExpensesQuery = `
            SELECT MONTH(date) as month, SUM(value) AS total
            FROM transacao
            WHERE transaction_type = 'despesa'
            GROUP BY MONTH(date)
            ORDER BY MONTH(date);
        `;
        
        connection.query(monthlyExpensesQuery, (error, results) => {
            if (error) {
                console.error('Erro ao buscar dados de despesas mensais:', error);
                res.status(500).json({ error: 'Erro ao buscar dados de despesas mensais' });
                return;
            }

            const monthlyExpenses = Array.from({ length: 12 }, (_, i) => {
                const monthData = results.find(row => row.month === i + 1);
                return monthData ? monthData.total : 0;
            });

            res.json({ monthlyExpenses });
        });
    } catch (error) {
        console.error('Erro ao buscar dados de despesas mensais:', error);
        res.status(500).json({ error: 'Erro ao buscar dados de despesas mensais' });
    }
});







// Lidar com rota não encontrada
app.use((req, res, next) => {
    res.status(404).send('Página não encontrada');
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
