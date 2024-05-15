// Lidar com o registro de usuário

document.getElementById('registerForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();
    if (response.ok) {
        alert(result.message);
        window.location.href = 'login.html';
    } else {
        alert(result.error);
    }
});

// Lidar com o login de usuário
document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const username = form.username.value;
    const password = form.password.value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (response.ok) {
        alert(result.message);
        window.location.href = 'index.html';
    } else {
        alert(result.error);
    }
});

// Lidar com o logout de usuário
document.getElementById('logoutButton')?.addEventListener('click', async () => {
    const response = await fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    if (response.ok) {
        alert(result.message);
        window.location.href = 'login.html';
    } else {
        alert(result.error);
    }
});

// Lidar com o Botão de Registro de usuário
document.getElementById('loginButton')?.addEventListener('click', async () => {
    window.location.href = 'login.html';

});
// Lidar com o Botão de Registro de usuário
document.getElementById('registerButton')?.addEventListener('click', async () => {
        window.location.href = 'register.html';

});


// Logout
    document.getElementById('logout-button').addEventListener('click', () => {
        fetch('/logout', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    window.location.href = '/login.html';
                }
            })
            .catch(error => console.error('Erro ao fazer logout:', error));
    });


// Função para excluir uma transação pelo ID
async function deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        try {
            const response = await fetch(`/transactions/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir transação');
            }

            const data = await response.json();
            console.log('Transação excluída:', data);
            location.reload(); // Recarregar a página após a exclusão
        } catch (error) {
            console.error('Erro ao excluir transação:', error.message);
        }
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


// Lidar com adição, edição e exclusão de transações como antes
document.addEventListener('DOMContentLoaded', () => {
        // Verificar se o usuário está autenticado
        fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            const userInfo = document.getElementById('user-info');
            const logoutButton = document.getElementById('logout-button');
            const loginButton = document.getElementById('loginButton');
            const registerButton = document.getElementById('registerButton');

            if (data.loggedIn) {
                userInfo.textContent = `Bem-vindo, ${data.username}`;
                logoutButton.style.display = 'inline';
                loginButton.style.display = 'none'; // Esconder botão de login
                registerButton.style.display = 'none'; // Esconder botão de registro
            } else {
                userInfo.textContent = '';
                logoutButton.style.display = 'none';
                loginButton.style.display = 'inline'; // Mostrar botão de login
                registerButton.style.display = 'inline'; // Mostrar botão de registro
            }
        })
        .catch(error => console.error('Erro ao verificar autenticação:', error));

    if (window.location.pathname === '/index.html') {
        loadTransactions();
    }

    document.getElementById('addTransactionForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const transactionData = {
            date: form.date.value,
            value: form.value.value,
            description: form.description.value,
            category: form.category.value,
            subcategory: form.subcategory.value,
            account: form.account.value,
            payment_method: form.paymentMethod.value,
            transaction_type: form.transactionType.value,
        };

        const transactionId = form.dataset.transactionId;

        try {
            let response;
            if (transactionId) {
                // Editar transação existente
                response = await fetch(`/transactions/${transactionId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transactionData),
                });
            } else {
                // Adicionar nova transação
                response = await fetch('/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transactionData),
                });
            }

            const data = await response.json();
            if (response.ok) {
                alert(transactionId ? 'Transação editada com sucesso' : 'Transação adicionada com sucesso');
                loadTransactions();
                form.reset();
                form.querySelector('button[type="submit"]').innerText = 'Adicionar Transação';
                delete form.dataset.transactionId;
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
        }
    });



     // Variáveis para controle de paginação
     let currentPage = 1;
     const transactionsPerPage = 10;
     let totalTransactions = 0;

 
     // Event listener para botão de página anterior
     const prevPageBtn = document.getElementById('prevPageBtn');
     prevPageBtn.addEventListener('click', () => {
         if (currentPage > 1) {
             currentPage--;
             loadTransactions();
         }
     });
 
     // Event listener para botão de próxima página
     const nextPageBtn = document.getElementById('nextPageBtn');
     nextPageBtn.addEventListener('click', () => {
         const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
         if (currentPage < totalPages) {
             currentPage++;
             loadTransactions();
         }
     });


     async function loadTransactions() {
        try {
            const response = await fetch('/transactions');
            const transactions = await response.json();
            totalTransactions = transactions.length;
            const transactionsTableBody = document.getElementById('transactionsTableBody');
            transactionsTableBody.innerHTML = '';
    
            const startIndex = (currentPage - 1) * transactionsPerPage;
            const endIndex = startIndex + transactionsPerPage;
            const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
            paginatedTransactions.forEach(transaction => {
                const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR'); // Formatar a data adequadamente
    
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.id}</td>
                    <td>${formattedDate}</td> <!-- Utilizar a data formatada aqui -->
                    <td>${transaction.value.toFixed(2)}</td> <!-- Arredondar o valor para duas casas decimais -->
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
                transactionsTableBody.appendChild(row);
            });
    
            updatePaginationUI(transactions.length);
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    }
    

    // Função para atualizar a interface de paginação
    function updatePaginationUI(totalTransactions) {
        const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
        const pageNumbersContainer = document.getElementById('pageNumbers');
        pageNumbersContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageNumberBtn = document.createElement('button');
            pageNumberBtn.textContent = i;
            pageNumberBtn.classList.add('page-btn');
            if (i === currentPage) {
                pageNumberBtn.classList.add('active');
            }
            pageNumberBtn.addEventListener('click', () => {
                currentPage = i;
                loadTransactions();
            });
            pageNumbersContainer.appendChild(pageNumberBtn);
        }
    }

    // Funções relacionadas a editar e excluir transações
    async function editTransaction(id) {
        // Função para abrir o modal de edição com o ID da transação
function openEditModal(id) {
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';

    // Adicione o ID da transação ao formulário de edição
    document.getElementById('edit-transaction-form').setAttribute('data-transaction-id', id);
}

// Função para enviar o formulário de edição
async function submitEditForm() {
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

    try {
        const response = await fetch(`/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editedData)
        });

        if (!response.ok) {
            throw new Error('Erro ao editar transação');
        }

        const data = await response.json();
        console.log('Transação editada:', data);
        location.reload(); // Recarregar a página após a edição
    } catch (error) {
        alert('Erro ao editar: escreva em todos os campos');
        console.error('Erro ao editar transação:', error.message);
    }
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

    }

    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.transactionId; // Obter o ID da transação
            deleteTransaction(id); // Chamar a função para excluir a transação
        }
    });

    // Carregar transações ao carregar a página
    loadTransactions();
});




// Evento de clique no botão "Aplicar Filtros"
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'apply-filters-btn') {
        applyFilters();
    }
});

// Função para atualizar a tabela de transações com os dados filtrados
function updateTransactionTable(transactions) {
    const tbody = document.querySelector('#transaction-table tbody');
    tbody.innerHTML = ''; // Limpar o conteúdo atual da tabela

    transactions.forEach(transaction => {
        // Formatar a data para exibir apenas a parte da data (sem o horário)
        const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR'); // Altere 'pt-BR' para a localização desejada

        const row = document.createElement('tr');
        // Preencher a linha da tabela com os dados da transação
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${formattedDate}</td> <!-- Utilizar a data formatada aqui -->
            <td>${transaction.value.toFixed(2)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>${transaction.subcategory}</td>
            <td>${transaction.account}</td>
            <td>${transaction.payment_method}</td>
            <td>${transaction.transaction_type}</td>
            <td>
                <button class="btn-td" onclick="openEditModal(${transaction.id})" data-transaction-id="${transaction.id}">Editar</button>
                <button class="btn-td" onclick="deleteTransaction(${transaction.id})">Excluir</button>
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
    clearFiltersBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Evitar o comportamento padrão de envio de formulário

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


// Chame loadTransactions ao carregar a página inicial
if (window.location.pathname === '/') {
    loadTransactions();
}


// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        const response = await fetch('/dashboard-data');
        const data = await response.json();

        document.getElementById('currentBalance').textContent = data.currentBalance;
        document.getElementById('totalRevenue').textContent = data.totalRevenue;
        document.getElementById('totalExpenses').textContent = data.totalExpenses;

        const expensesByCategory = data.expensesByCategory;
        const revenueByCategory = data.revenueByCategory;

        const expensesByCategoryElement = document.getElementById('expensesByCategory');
        expensesByCategoryElement.innerHTML = '';
        expensesByCategory.forEach(expense => {
            const listItem = document.createElement('li');
            listItem.textContent = `${expense.category}: ${expense.total}`;
            expensesByCategoryElement.appendChild(listItem);
        });

        const revenueByCategoryElement = document.getElementById('revenueByCategory');
        revenueByCategoryElement.innerHTML = '';
        revenueByCategory.forEach(revenue => {
            const listItem = document.createElement('li');
            listItem.textContent = `${revenue.category}: ${revenue.total}`;
            revenueByCategoryElement.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
    }
}


// Chamar loadDashboardData ao carregar a página inicial
if (window.location.pathname === '/') {
    loadDashboardData();
}

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
