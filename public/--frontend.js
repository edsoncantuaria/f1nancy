// Elementos HTML para controle de paginação
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageDisplay = document.getElementById('current-page');


// Variáveis de controle de página
let currentPage = 1;

// Função para buscar e exibir transações da página atual

function fetchAndDisplayCurrentPageTransactions() {
    fetch(`/transactions?page=${currentPage}&limit=${transactionsPerPage}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar transações');
            }
            return response.json();
        })
        .then(data => {
            const { transactions, totalPages } = data;
            if (currentPage > totalPages) {
                currentPage = totalPages; // Bloqueia a ida das transações paginadas
            } else if (currentPage > 1) {
                currentPage = 1; // Bloqueia a navegação para a segunda página
            }
            displayTransactions(transactions);
            updatePaginationButtons(currentPage, totalPages);
        })
        .catch(error => {
            console.error('Erro ao buscar transações:', error);
        });
}



// Função para atualizar a exibição da página atual
function updateCurrentPageDisplay() {
    currentPageDisplay.textContent = currentPage;
}



// Event listeners para os botões de páginação
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updateCurrentPageDisplay();
        fetchAndDisplayCurrentPageTransactions();
    }
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    updateCurrentPageDisplay();
    fetchAndDisplayCurrentPageTransactions();
});





document.addEventListener('DOMContentLoaded', async () => {
    await fetchTransactions();
    
    const form = document.getElementById('transaction-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await fetch('/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (!response.ok) {
                throw new Error('Erro ao adicionar transação');
            }

            const data = await response.json();
            addTransactionRow(data);
        } catch (error) {
            console.error('Erro ao adicionar transação:', error.message);
        }
    });
});

async function fetchTransactions() {
    try {
        const response = await fetch('/transactions');
        if (!response.ok) {
            throw new Error('Erro ao buscar transações');
        }

        const data = await response.json();
        data.forEach(transaction => {
            if (transaction.date) {
                addTransactionRow(transaction);
            } else {
                console.error('Erro ao buscar transações: data da transação é nula');
            }
        });
    } catch (error) {
        console.error('Erro ao buscar transações:', error.message);
    }
}

  
function addTransactionRow(transaction) {
    const tbody = document.querySelector('#transaction-table tbody');
    const row = document.createElement('tr');

    // Extrair apenas o dia, mês e ano da data
    const dateParts = transaction.date.split('T')[0].split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    // Mapear valores nulos para strings correspondentes
    const paymentMethod = transaction.payment_method ? transaction.payment_method : '-';
    const transactionType = transaction.transaction_type ? transaction.transaction_type : '-';

    row.innerHTML = `
        <td>${transaction.id}</td>
        <td>${formattedDate}</td>
        <td>${transaction.value}</td>
        <td>${transaction.description}</td>
        <td>${transaction.category}</td>
        <td>${transaction.subcategory}</td>
        <td>${transaction.account}</td>
        <td>${paymentMethod}</td>
        <td>${transactionType}</td>
        <button class="btn-td" onclick="openEditModal(${transaction.id})" data-transaction-id="${transaction.id}">Editar</button>
        <button class="btn-td" onclick="deleteRow(${transaction.id})">Excluir</button>
    </td>
`;

tbody.appendChild(row);
}




function deleteRow(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        fetch(`/transactions/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir transação');
            }
            return response.json();
        })
        .then(data => {
            console.log('Transação excluída:', data);
            location.reload(); // Recarregar a página após a exclusão
        })
        .catch(error => {
            console.error('Erro ao excluir transação:', error.message);
        });
    }
}

// Função para abrir o modal de edição com o ID da transação
function openEditModal(id) {
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';

    // Adicione o ID da transação ao formulário de edição
    document.getElementById('edit-transaction-form').setAttribute('data-transaction-id', id);
}


// Evento de clique no botão "Editar" para abrir o modal
document.addEventListener('click', function(e) {
    if (e.target && e.target.textContent === 'Editar') {
        const id = e.target.dataset.transactionId; // Obter o ID da transação
        openEditModal(id);
    }
});


// Fechar o modal ao clicar no botão de fechar (X)
const closeBtn = document.querySelector('.close');
closeBtn.addEventListener('click', function() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
});


// Função para enviar o formulário de edição
function submitEditForm() {
    const id = document.getElementById('edit-transaction-form').getAttribute('data-transaction-id'); // Obter o ID da transação do atributo data-transaction-id

    const editedData = {
        date: document.getElementById('edit-date').value,
        value: document.getElementById('edit-value').value,
        description: document.getElementById('edit-description').value,
        category: document.getElementById('edit-category').value,
        subcategory: document.getElementById('edit-subcategory').value,
        account: document.getElementById('edit-account').value,
        paymentMethod: document.getElementById('edit-paymentMethod').value,
        transactionType: document.getElementById('edit-transactionType').value
    };

    // Envie 'editedData' para o servidor usando Fetch API ou outra forma de requisição HTTP
    // Exemplo de envio usando Fetch API:
    fetch(`/transactions/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao editar transação');
        }
        return response.json();
    })
    .then(data => {
        console.log('Transação editada:', data);
        location.reload(); // Recarregar a página após a edição
    })
    .catch(error => {
        alert('Erro ao editar: escreva em todos os campos');
        console.error('Erro ao editar transação:', error.message);
    });
}

function updateTransactionTable(transactions) {
    const tbody = document.querySelector('#transaction-table tbody');
    tbody.innerHTML = ''; // Limpar o conteúdo atual da tabela

    transactions.forEach(transaction => {
        // Formatar a data para exibir apenas a parte da data (sem o horário)
        const formattedDate = new Date(transaction.date).toISOString().split('T')[0];

        const row = document.createElement('tr');
        // Preencher a linha da tabela com os dados da transação
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${formattedDate}</td> <!-- Utilizar a data formatada aqui -->
            <td>${transaction.value}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>${transaction.subcategory}</td>
            <td>${transaction.account}</td>
            <td>${transaction.payment_method}</td>
            <td>${transaction.transaction_type}</td>
            <td>
            <button class="btn-td" onclick="openEditModal(${transaction.id})" data-transaction-id="${transaction.id}">Editar</button>
            <button class="btn-td" onclick="deleteRow(${transaction.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}



// Função para aplicar os filtros
function applyFilters() {
    const filterData = {
        start_date: document.getElementById('start-date').value,
        end_date: document.getElementById('end-date').value,
        category: document.getElementById('filter-category').value,
        subcategory: document.getElementById('filter-subcategory').value,
        account: document.getElementById('filter-account').value,
        payment_method: document.getElementById('filter-paymentMethod').value,
        transaction_type: document.getElementById('filter-transactionType').value
    };

    // Envie 'filterData' para o servidor usando Fetch API ou outra forma de requisição HTTP
    // Exemplo de envio usando Fetch API:
    fetch('/filtered-transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filterData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao aplicar filtros');
        }
        return response.json();
    })
    .then(data => {
        // Atualize a tabela com as transações filtradas
        updateTransactionTable(data);
    })
    .catch(error => {
        console.error('Erro ao aplicar filtros:', error.message);
    });
}

//Limpar filtros aplicados
document.addEventListener('DOMContentLoaded', () => {
    // Outros códigos...

    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    clearFiltersBtn.addEventListener('click', () => {
        // Limpar os campos dos filtros
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-subcategory').value = '';
        document.getElementById('filter-account').value = '';
        document.getElementById('filter-paymentMethod').value = '';
        document.getElementById('filter-transactionType').value = '';

        // Atualizar a tabela após limpar os filtros
        applyFilters();
    });
});


document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch dashboard data
        const responseDashboard = await fetch('/dashboard-data');
        if (!responseDashboard.ok) {
            throw new Error('Erro ao buscar dados do dashboard');
        }
        const dashboardData = await responseDashboard.json();
        updateDashboard(dashboardData);

        // Fetch monthly expenses data
        const responseMonthlyExpenses = await fetch('/monthly-expenses');
        if (!responseMonthlyExpenses.ok) {
            throw new Error('Erro ao buscar dados de despesas mensais');
        }
        const monthlyExpensesData = await responseMonthlyExpenses.json();
        createMonthlyExpensesChart(monthlyExpensesData.monthlyExpenses);
    } catch (error) {
        console.error('Erro ao carregar dados:', error.message);
    }
});

function updateDashboard(data) {
    document.getElementById('current-balance').textContent = `Saldo Atual: R$ ${data.currentBalance.toFixed(2)}`;
    document.getElementById('total-revenue').textContent = `Receitas Totais: R$ ${data.totalRevenue.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `Despesas Totais: R$ ${data.totalExpenses.toFixed(2)}`;

    createBarChart('expenses-chart', data.expensesByCategory, 'Despesas por Categoria', 'rgba(255, 99, 132, 0.5)', 'rgba(255, 99, 132, 1)');
    createBarChart('revenue-chart', data.revenueByCategory, 'Receitas por Categoria', 'rgba(54, 162, 235, 0.5)', 'rgba(54, 162, 235, 1)');
}

function createBarChart(chartId, data, label, backgroundColor, borderColor) {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.category),
            datasets: [{
                label: label,
                data: data.map(item => item.total),
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => `R$ ${value.toFixed(2)}`,
                    color: 'black',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `R$ ${value.toFixed(2)}`
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function createMonthlyExpensesChart(monthlyExpenses) {
    const ctx = document.getElementById('monthly-expenses-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            datasets: [{
                label: 'Despesas Mensais',
                data: monthlyExpenses,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => `R$ ${value.toFixed(2)}`,
                    color: 'black',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `R$ ${value.toFixed(2)}`
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
