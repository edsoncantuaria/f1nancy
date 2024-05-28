
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

    try {
        const response = await fetch('/send-email-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({username, email})
        });
  
        if (response.ok) {
          alert('Obrigado por se cadastrar!');
        } else {
          const errorData = await response.json();
          console.error('Erro ao enviar email de cadastro', errorData);
          alert('Erro ao enviar email de cadastro. Por favor, tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao enviar email:', error);
        alert('Erro ao enviar email. Por favor, tente novamente.');
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


    document.getElementById('contactForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o comportamento padrão de envio do formulário
    
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
    
        console.log('Form data:', { name, email, message }); // Log para depuração
    
        try {
          const response = await fetch('/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
          });
    
          if (response.ok) {
            alert('Email enviado com sucesso!');
          } else {
            const errorData = await response.json();
            console.error('Erro ao enviar email:', errorData);
            alert('Erro ao enviar email. Por favor, tente novamente.');
          }
        } catch (error) {
          console.error('Erro ao enviar email:', error);
          alert('Erro ao enviar email. Por favor, tente novamente.');
        }
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



// Função para abrir o modal de edição e buscar os detalhes da transação
function openEditModal(transactionId) {
    // Obter os dados da transação usando o ID
    fetch(`/transactions/${transactionId}`)
        .then(response => response.json())
        .then(data => {
            // Preencher o formulário de edição com os dados da transação
            document.getElementById('edit-date').value = data.date;
            document.getElementById('edit-value').value = data.value;
            document.getElementById('edit-description').value = data.description;
            document.getElementById('edit-category').value = data.category;
            document.getElementById('edit-transactionType').value = data.transaction_type;

            // Definir o ID da transação no formulário de edição
            document.getElementById('edit-transaction-form').setAttribute('data-transaction-id', transactionId);

            // Abrir o modal de edição
            
            editModal.style.display = 'block';
        })
        .catch(error => console.error('Erro ao obter dados da transação:', error));
}


// Função para buscar detalhes da transação pelo ID
async function fetchTransactionDetails(transactionId) {
    try {
        const response = await fetch(`/transactions/${transactionId}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar detalhes da transação');
        }
        const transactionDetails = await response.json();
        return transactionDetails;
    } catch (error) {
        console.error('Erro ao buscar detalhes da transação:', error.message);
        return null;
    }
}



// Função para preencher o modal de edição com os detalhes da transação
function fillEditModal(transaction) {
    if (!transaction) {
        console.error('Detalhes da transação não encontrados');
        return;
    }

    // Converter a data para o formato 'yyyy-MM-dd'
    const date = new Date(transaction.date);
    const formattedDate = date.toISOString().split('T')[0];

    // Preencher os campos do modal com os detalhes da transação
    document.getElementById('edit-date').value = formattedDate;
    document.getElementById('edit-value').value = transaction.value;
    document.getElementById('edit-description').value = transaction.description;
    document.getElementById('edit-category').value = transaction.category;
    document.getElementById('edit-transactionType').value = transaction.transaction_type;

    // Exibir o modal de edição
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'block';

    console.log('Método de Pagamento:', transaction.payment_method);
    console.log('Tipo:', transaction.transaction_type);
    console.log('Data da transação:', formattedDate);

}




// Event listener para o botão de fechar do modal
document.querySelector('.close').onclick = closeModal;

// Função para fechar o modal quando o usuário clicar no botão de fechar ou fora do modal
function closeModal() {
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'none';
}


document.getElementById('contactForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o comportamento padrão de envio do formulário

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    console.log('Form data:', { name, email, message }); // Log para depuração

    try {
    const response = await fetch('/send-email', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
    });

    if (response.ok) {
        alert('Email enviado com sucesso!');
    } else {
        const errorData = await response.json();
        console.error('Erro ao enviar email:', errorData);
        alert('Erro ao enviar email. Por favor, tente novamente.');
    }
    } catch (error) {
    console.error('Erro ao enviar email:', error);
    alert('Erro ao enviar email. Por favor, tente novamente.');
    }
});

// Função para enviar o formulário de edição
function submitEditForm() {
    const id = document.getElementById('edit-transaction-form').getAttribute('data-transaction-id'); // Obter o ID da transação do atributo data-transaction-id

    const editedData = {
        date: document.getElementById('edit-date').value,
        value: document.getElementById('edit-value').value,
        description: document.getElementById('edit-description').value,
        category: document.getElementById('edit-category').value,
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




function closeEditModal() {
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'none';
}


// Event listener para fechar o modal quando o usuário clicar fora do modal
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    if (event.target == editModal) {
        closeModal();
    }
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
            const welcomeMessage = document.getElementById('welcome-message');
            const removeControle = document.getElementById('controle-receitas-despesas');
            const removeTabela = document.getElementById('removeTabela');
            const removeAbout = document.getElementById('removeAbout');
            const removeContact = document.getElementById('contact');
            const removeTestimonial = document.getElementById('testimonial');
            const removeSistema = document.getElementById('sistema');



            if (data.loggedIn) {
                userInfo.textContent = `Bem-vindo, ${data.username}`;
                logoutButton.style.display = 'inline';
                loginButton.style.display = 'none'; // Esconder botão de login
                registerButton.style.display = 'none'; // Esconder botão de registro
                welcomeMessage.style.display = 'none';
                removeAbout.style.display = 'none';
                removeContact.style.display = 'none';
                removeTestimonial.style.display = 'none';

            } else {
                userInfo.textContent = '';
                logoutButton.style.display = 'none';
                loginButton.style.display = 'inline'; // Mostrar botão de login
                registerButton.style.display = 'inline'; // Mostrar botão de registro
                removeControle.style.display = 'none';
                removeTabela.style.display = 'none';
                removeSistema.style.display = 'none';

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

                    <td>${formattedDate}</td>
                    <td>${transaction.value.toFixed(2)}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.category}</td>
                    <td>${transaction.transaction_type}</td>
                    <td>
                        <button class="btn-td" onclick="openEditModal(${transaction.id})" data-transaction-id="${transaction.id}">Editar</button>
                        <button class="btn-td" onclick="deleteTransaction(${transaction.id})">Excluir</button>
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
            <td>${formattedDate}</td>
            <td>${transaction.value.toFixed(2)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>${transaction.transaction_type}</td>
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
        document.getElementById('filter-transactionType').value = '';

        // Atualizar a tabela após limpar os filtros
        applyFilters();
    });
});


// Chame loadTransactions ao carregar a página inicial
if (window.location.pathname === '/') {
    loadTransactions();
}

// Função para ocultar a mensagem de boas-vindas quando o usuário está logado
function hideWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }
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
    document.getElementById('current-balance').textContent = `R$ ${data.currentBalance.toFixed(2)}`;
    document.getElementById('total-revenue').textContent = `R$ ${data.totalRevenue.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `R$ ${data.totalExpenses.toFixed(2)}`;

    createBarChart('expenses-chart', data.expensesByCategory, 'Despesas por Categoria', 'rgba(255, 99, 132, 0.5)', 'rgba(255, 99, 132, 1)');
    createBarChart('revenue-chart', data.revenueByCategory, 'Receitas por Categoria', 'rgba(99, 255, 125, 0.5)', 'rgba(99, 255, 125, 1)');
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

// Obter os elementos dos modais e botões
const transactionModal = document.getElementById("transactionModal");
const filterModal = document.getElementById("filterModal");

const openTransactionModalBtn = document.getElementById("openTransactionModalBtn");
const openFilterModalBtn = document.getElementById("openFilterModalBtn");

const addTransactionBtn = document.getElementById("add-transaction-btn");
const filterBtn = document.getElementById("filter-btn");

const closeTransactionModal = document.getElementById("closeTransactionModal");
const closeFilterModal = document.getElementById("closeFilterModal");

openTransactionModalBtn.onclick = function() {
  transactionModal.style.display = "block";
}
openFilterModalBtn.onclick = function() {
  filterModal.style.display = "block";
}
addTransactionBtn.onclick = function() {
  transactionModal.style.display = "block";
}
filterBtn.onclick = function() {
  filterModal.style.display = "block";
}

closeTransactionModal.onclick = function() {
  transactionModal.style.display = "none";
}
closeFilterModal.onclick = function() {
  filterModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == transactionModal) {
    transactionModal.style.display = "none";
  }
  if (event.target == filterModal) {
    filterModal.style.display = "none";
  }
}

//Metas 
/*
document.addEventListener('DOMContentLoaded', () => {
    const metasList = document.getElementById('metas-list');
    const metaForm = document.getElementById('meta-form');
    const metaName = document.getElementById('meta-name');
    const metaDueDate = document.getElementById('meta-due-date');
    const metaValue = document.getElementById('meta-value');

    // Impede a seleção de datas retroativas
    metaDueDate.setAttribute('min', new Date().toISOString().split('T')[0]);

    const loadMetas = async () => {
        const response = await fetch('/metas');
        const metas = await response.json();
        const balanceResponse = await fetch('/dashboard-data');
        const { currentBalance } = await balanceResponse.json();
        metasList.innerHTML = '';
        metas.forEach(meta => {
            const progress = Math.min((currentBalance / meta.value) * 100, 100).toFixed(2);
            const formattedDate = formatDate(meta.due_date);
            const metaItem = document.createElement('div');
            metaItem.innerHTML = `
                <h3>${meta.name}</h3>
                <p>Data Limite: ${formattedDate}</p>
                <p>Valor: R$ ${meta.value.toFixed(2)}</p>
                <p>Progresso: <span id="progress-${meta.id}">${progress}%</span></p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                <button onclick="deleteMeta(${meta.id})">Remover</button>
                <button onclick="finalizeMeta(${meta.id}, ${progress})">Finalizar</button>
            `;
            metasList.appendChild(metaItem);
        });
    };

    metaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dueDate = metaDueDate.value;
        const today = new Date().toISOString().split('T')[0];
        if (dueDate < today) {
            alert('A data da meta não pode ser retroativa.');
            return;
        }
        const response = await fetch('/metas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: metaName.value,
                due_date: metaDueDate.value,
                value: parseFloat(metaValue.value) // Assegurar que o valor é float
            }),
        });
        if (response.ok) {
            loadMetas();
            metaForm.reset();
        }
    });

    window.deleteMeta = async (id) => {
        const response = await fetch(`/metas/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            loadMetas();
        }
    };

    window.finalizeMeta = async (id, progress) => {
        if (progress < 100) {
            alert('A meta ainda não atingiu 100%');
            return;
        }
        const response = await fetch('/finalize-meta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ metaId: id }),
        });
        if (response.ok) {
            loadMetas();
        }
    };

    loadMetas();
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
*/

//

document.addEventListener('DOMContentLoaded', () => {
    const metasList = document.getElementById('metas-list');
    const metaForm = document.getElementById('meta-form');
    const metaName = document.getElementById('meta-name');
    const metaDueDate = document.getElementById('meta-due-date');
    const metaValue = document.getElementById('meta-value');

    // Impede a seleção de datas retroativas
    metaDueDate.setAttribute('min', new Date().toISOString().split('T')[0]);

    const loadMetas = async () => {
        const response = await fetch('/metas');
        const metas = await response.json();
        const balanceResponse = await fetch('/dashboard-data');
        const { currentBalance } = await balanceResponse.json();
        metasList.innerHTML = '';
        metas.forEach(meta => {
            const progress = Math.min((currentBalance / meta.value) * 100, 100).toFixed(2);
            const formattedDate = formatDate(meta.due_date);
            const metaItem = document.createElement('div');
            metaItem.innerHTML = `
                <h3>${meta.name}</h3>
                <p>Data Limite: ${formattedDate}</p>
                <p>Valor: R$ ${meta.value.toFixed(2)}</p>
                <p>Progresso: <span id="progress-${meta.id}">${progress}%</span></p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                <button onclick="deleteMeta(${meta.id})">Remover</button>
                <button onclick="finalizeMeta(${meta.id}, ${progress})">Finalizar</button>
            `;
            metasList.appendChild(metaItem);
        });
    };

    metaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dueDate = metaDueDate.value;
        const today = new Date().toISOString().split('T')[0];
        if (dueDate < today) {
            alert('A data da meta não pode ser retroativa.');
            return;
        }
        const response = await fetch('/metas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: metaName.value,
                due_date: metaDueDate.value,
                value: parseFloat(metaValue.value) // Assegurar que o valor é float
            }),
        });
        if (response.ok) {
            loadMetas();
            metaForm.reset();
        }
    });

    window.deleteMeta = async (id) => {
        const response = await fetch(`/metas/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            loadMetas();
        }
    };

    window.finalizeMeta = async (id, progress) => {
        if (progress < 100) {
            alert('A meta ainda não atingiu 100%');
            return;
        }
        const response = await fetch('/finalize-meta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ metaId: id }),
        });
        if (response.ok) {
            loadMetas();
        } else {
            const error = await response.json();
            alert(`Erro ao finalizar meta: ${error.error}`);
        }
    };

    loadMetas();
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

