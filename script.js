// Variáveis globais
const monthSelect = document.getElementById('month-select');
const yearSelect = document.getElementById('year-select');
const tableBody = document.getElementById('table-body');
const totalHoursCell = document.getElementById('total-hours');

// Nomes dos meses
const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Objeto para armazenar os dados de horas
let hoursData = {};

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', function() {
  loadDataFromLocalStorage();
  initializeTable();
  
  // Event listeners para os seletores
  monthSelect.addEventListener('change', initializeTable);
  yearSelect.addEventListener('change', initializeTable);
});

/**
 * Inicializa a tabela com os dias do mês selecionado
 */
function initializeTable() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  
  // Limpar a tabela
  tableBody.innerHTML = '';
  
  // Obter o número de dias no mês
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Criar chave para armazenar dados do mês/ano
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  
  // Inicializar dados do mês se não existirem
  if (!hoursData[monthKey]) {
    hoursData[monthKey] = {};
  }
  
  // Criar linhas para cada dia do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = String(day).padStart(2, '0');
    const row = createTableRow(day, monthKey, dayKey);
    tableBody.appendChild(row);
  }
  
  // Atualizar o total de horas
  updateTotalHours(monthKey);
}

/**
 * Cria uma linha da tabela para um dia específico
 */
function createTableRow(day, monthKey, dayKey) {
  const row = document.createElement('tr');
  
  // Obter dados salvos para este dia
  const dayData = hoursData[monthKey][dayKey] || { startTime: '', endTime: '' };
  
  // Célula do dia
  const dayCell = document.createElement('td');
  dayCell.className = 'day-cell';
  dayCell.textContent = day;
  
  // Célula da hora inicial
  const startCell = document.createElement('td');
  const startInput = document.createElement('input');
  startInput.type = 'time';
  startInput.value = dayData.startTime || '';
  startInput.dataset.monthKey = monthKey;
  startInput.dataset.dayKey = dayKey;
  startInput.addEventListener('change', function() {
    saveTimeData(monthKey, dayKey, 'startTime', this.value);
    updateDayTotal(row, monthKey, dayKey);
    updateTotalHours(monthKey);
  });
  startCell.appendChild(startInput);
  
  // Célula da hora final
  const endCell = document.createElement('td');
  const endInput = document.createElement('input');
  endInput.type = 'time';
  endInput.value = dayData.endTime || '';
  endInput.dataset.monthKey = monthKey;
  endInput.dataset.dayKey = dayKey;
  endInput.addEventListener('change', function() {
    saveTimeData(monthKey, dayKey, 'endTime', this.value);
    updateDayTotal(row, monthKey, dayKey);
    updateTotalHours(monthKey);
  });
  endCell.appendChild(endInput);
  
  // Célula do total de horas do dia
  const totalCell = document.createElement('td');
  totalCell.className = 'total-cell';
  totalCell.id = `total-${monthKey}-${dayKey}`;
  
  row.appendChild(dayCell);
  row.appendChild(startCell);
  row.appendChild(endCell);
  row.appendChild(totalCell);
  
  // Calcular e exibir o total do dia
  updateDayTotal(row, monthKey, dayKey);
  
  return row;
}

/**
 * Atualiza o total de horas de um dia específico
 */
function updateDayTotal(row, monthKey, dayKey) {
  const dayData = hoursData[monthKey][dayKey];
  const totalCell = row.querySelector('.total-cell') || document.getElementById(`total-${monthKey}-${dayKey}`);
  
  if (dayData && dayData.startTime && dayData.endTime) {
    const hours = calculateHours(dayData.startTime, dayData.endTime);
    totalCell.textContent = formatHours(hours);
  } else {
    totalCell.textContent = '0h';
  }
}

/**
 * Calcula a diferença de horas entre dois horários
 */
function calculateHours(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;
  
  let diffMinutes = endTotalMinutes - startTotalMinutes;
  
  // Se o resultado for negativo, significa que o horário final é no dia seguinte
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Adiciona 24 horas
  }
  
  return diffMinutes / 60; // Converter para horas
}

/**
 * Formata as horas para exibição (ex: 8.5h, 10h, 0.5h)
 */
function formatHours(hours) {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
}

/**
 * Atualiza o total de horas do mês
 */
function updateTotalHours(monthKey) {
  let totalMinutes = 0;
  
  // Somar todas as horas do mês
  for (const dayKey in hoursData[monthKey]) {
    const dayData = hoursData[monthKey][dayKey];
    if (dayData && dayData.startTime && dayData.endTime) {
      const hours = calculateHours(dayData.startTime, dayData.endTime);
      totalMinutes += hours * 60;
    }
  }
  
  // Converter minutos para horas
  const totalHours = totalMinutes / 60;
  totalHoursCell.textContent = formatHours(totalHours);
}

/**
 * Salva os dados de tempo no objeto hoursData
 */
function saveTimeData(monthKey, dayKey, timeType, value) {
  if (!hoursData[monthKey]) {
    hoursData[monthKey] = {};
  }
  
  if (!hoursData[monthKey][dayKey]) {
    hoursData[monthKey][dayKey] = { startTime: '', endTime: '' };
  }
  
  hoursData[monthKey][dayKey][timeType] = value;
  
  // Salvar no localStorage
  saveDataToLocalStorage();
}

/**
 * Salva os dados no localStorage
 */
function saveDataToLocalStorage() {
  localStorage.setItem('marcandoMinhasHoras', JSON.stringify(hoursData));
}

/**
 * Carrega os dados do localStorage
 */
function loadDataFromLocalStorage() {
  const savedData = localStorage.getItem('marcandoMinhasHoras');
  if (savedData) {
    try {
      hoursData = JSON.parse(savedData);
    } catch (e) {
      console.error('Erro ao carregar dados do localStorage:', e);
      hoursData = {};
    }
  }
}
