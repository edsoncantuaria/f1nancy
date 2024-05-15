// Rota para obter os dados do dashboard
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

