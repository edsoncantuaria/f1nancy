//Dashboard
// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//       const response = await fetch('/dashboard-data');
//       if (!response.ok) {
//         throw new Error('Erro ao buscar dados do dashboard');
//       }
//       const data = await response.json();
//       updateDashboard(data);
//     } catch (error) {
//       console.error('Erro ao carregar dados do dashboard:', error.message);
//     }
//   });
  
//   function updateDashboard(data) {
//     document.getElementById('current-balance').textContent = `Saldo Atual: R$ ${data.currentBalance.toFixed(2)}`;
//     document.getElementById('total-revenue').textContent = `Receitas Totais: R$ ${data.totalRevenue.toFixed(2)}`;
//     document.getElementById('total-expenses').textContent = `Despesas Totais: R$ ${data.totalExpenses.toFixed(2)}`;

//     // Verifique se expensesByCategory é um array antes de usar map
//     if (Array.isArray(data.expensesByCategory)) {
//         // Mapeie os dados apenas se expensesByCategory for um array
//         createBarChart('expenses-chart', data.expensesByCategory, 'Despesas por Categoria');
//     } else {
//         console.error('Erro: Os dados de expensesByCategory não são um array.');
//     }

//     // Verifique se revenueByCategory é um array antes de usar map
//     if (Array.isArray(data.revenueByCategory)) {
//         // Mapeie os dados apenas se revenueByCategory for um array
//         createBarChart('revenue-chart', data.revenueByCategory, 'Receitas por Categoria');
//     } else {
//         console.error('Erro: Os dados de revenueByCategory não são um array.');
//     }
// }

// function createBarChart(chartId, data, label) {
//     const ctx = document.getElementById(chartId).getContext('2d');
//     new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: data.map(item => item.category),
//             datasets: [{
//                 label: label,
//                 data: data.map(item => item.total),
//                 backgroundColor: 'rgba(54, 162, 235, 0.5)',
//                 borderColor: 'rgba(54, 162, 235, 1)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     ticks: {
//                         callback: value => `R$ ${value.toFixed(2)}`
//                     }
//                 }
//             }
//         }
//     });
// }

// Frontend (frontend.js)

// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         const response = await fetch('/dashboard-data');
//         if (!response.ok) {
//             throw new Error('Erro ao buscar dados do dashboard');
//         }
//         const data = await response.json();
//         updateDashboard(data);
//     } catch (error) {
//         console.error('Erro ao carregar dados do dashboard:', error.message);
//     }
// });

// function updateDashboard(data) {
//     document.getElementById('current-balance').textContent = `R$ ${data.currentBalance.toFixed(2)}`;
//     document.getElementById('total-revenue').textContent = `R$ ${data.totalRevenue.toFixed(2)}`;
//     document.getElementById('total-expenses').textContent = `R$ ${data.totalExpenses.toFixed(2)}`;

//     createBarChart('expenses-chart', data.expensesByCategory, 'Despesas por Categoria', 'rgba(255, 99, 132, 0.5)', 'rgba(255, 99, 132, 1)');
//     createBarChart('revenue-chart', data.revenueByCategory, 'Receitas por Categoria', 'rgba(54, 162, 235, 0.5)', 'rgba(54, 162, 235, 1)');
// }

// function createBarChart(chartId, data, label, backgroundColor, borderColor) {
//     const ctx = document.getElementById(chartId).getContext('2d');
//     new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: data.map(item => item.category),
//             datasets: [{
//                 label: label,
//                 data: data.map(item => item.total),
//                 backgroundColor: backgroundColor,
//                 borderColor: borderColor,
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     ticks: {
//                         callback: value => `R$ ${value.toFixed(2)}`
//                     }
//                 }
//             }
//         }
//     });
    
// }

// async function applyFilters() {


// function editRow(id) {
//     fetch(`/transactions/${id}`)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Erro ao buscar transação para edição');
//             }
//             return response.json();
//         })
//         .then(transaction => {
//             const { date, value, description, category, subcategory, account, paymentMethod, transactionType } = transaction;

//             // Abre um formulário de edição com os campos disponíveis para edição
//             const newData = prompt('Digite os novos dados da transação no formato: data, valor, descrição, categoria, subcategoria, conta, método de pagamento, tipo de transação (deixe em branco para manter o valor original)', `${date}, ${value}, ${description}, ${category}, ${subcategory}, ${account}, ${paymentMethod}, ${transactionType}`);
//             if (newData !== null) {
//                 const [newDate, newValue, newDescription, newCategory, newSubcategory, newAccount, newPaymentMethod, newTransactionType] = newData.split(',').map(item => item.trim());

//                 // Converter a data para o formato correto (YYYY-MM-DD)
//                 const formattedDate = newDate ? new Date(newDate).toISOString().split('T')[0] : date;

//                 const editedData = {
//                     date: formattedDate,
//                     value: newValue !== '' ? newValue : value,
//                     description: newDescription !== '' ? newDescription : description,
//                     category: newCategory !== '' ? newCategory : category,
//                     subcategory: newSubcategory !== '' ? newSubcategory : subcategory,
//                     account: newAccount !== '' ? newAccount : account,
//                     paymentMethod: newPaymentMethod !== '' ? newPaymentMethod : paymentMethod,
//                     transactionType: newTransactionType !== '' ? newTransactionType : transactionType
//                 };

//                 fetch(`/transactions/${id}`, {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify(editedData)
//                 })
//                 .then(response => {
//                     if (!response.ok) {
//                         throw new Error('Erro ao editar transação');
//                     }
//                     return response.json();
//                 })
//                 .then(data => {
//                     console.log('Transação editada:', data);
//                     location.reload(); // Recarregar a página após a edição
//                 })
//                 .catch(error => {
//                     console.error('Erro ao editar transação:', error.message);
//                 });
//             }
//         })
//         .catch(error => {
//             console.error('Erro ao buscar transação para edição:', error.message);
//         });
// }
// // Chamar a função para buscar e exibir transações da página inicial ao carregar a página
// document.addEventListener('DOMContentLoaded', async () => {
//     await fetchAndDisplayCurrentPageTransactions();
// });
// async function fetchAndDisplayCurrentPageTransactions() {
//     try {
//         const response = await fetch(`/transactions?page=${currentPage}&limit=10`);
//         if (!response.ok) {
//             throw new Error('Erro ao buscar transações');
//         }

//         const data = await response.json();
//         updateTransactionTable(data);
//     } catch (error) {
//         console.error('Erro ao buscar transações:', error.message);
//     }
// }

