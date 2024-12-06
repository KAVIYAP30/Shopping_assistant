const itemInput = document.getElementById('item-input');
const addItemButton = document.getElementById('add-item');
const itemList = document.getElementById('item-list');
const budgetInput = document.getElementById('budget-input');
const totalCost = document.getElementById('total-cost');
const remainingBudget = document.getElementById('remaining-budget');
const budgetMessageContainer = document.getElementById('budget-message-container');
const recommendationToggle = document.getElementById('recommendation-toggle');
const listSelector = document.getElementById('list-selector');
const newListButton = document.getElementById('new-list');
const shareListButton = document.getElementById('share-list');
const recommendationDisplay = document.getElementById('recommendation-display');

const aisles = document.querySelectorAll('.aisle');
let shoppingLists = JSON.parse(localStorage.getItem('shoppingLists')) || { default: [] };
let currentList = 'default';
let selectedAisle = '';
let recommendations = {
  pasta: ['tomato sauce', 'parmesan cheese'],
  apple: ['peanut butter', 'granola'],
  chicken: ['rice', 'vegetables'],
  bread: ['butter', 'jam'],
  milk: ['cereal', 'cookies'],
};

// Update the dropdown with the available lists
function updateListSelector() {
  listSelector.innerHTML = '';
  for (let list in shoppingLists) {
    const option = document.createElement('option');
    option.value = list;
    option.textContent = list;
    listSelector.appendChild(option);
  }
  listSelector.value = currentList;
}
updateListSelector();

function selectAisleBasedOnItem(item) {
  highlightAisle('');
  if (item.includes('milk') || item.includes('cheese') || item.includes('butter') || item.includes('curd')) {
    highlightAisle('dairy');
  } else if (item.includes('fish') || item.includes('mutton') || item.includes('chicken')) {
    highlightAisle('meat');
  } else if (item.includes('produce')) {
    highlightAisle('produce');
  } else {
    highlightAisle('other');
  }
}

function highlightAisle(aisleName) {
  aisles.forEach(a => {
    a.classList.remove('selected');
    a.style.backgroundColor = '';
  });
  if (aisleName) {
    const selectedAisleElement = document.getElementById(`aisle-${aisleName}`);
    if (selectedAisleElement) {
      selectedAisleElement.classList.add('selected');
      selectedAisleElement.style.backgroundColor = 'yellow';
      selectedAisle = aisleName;
    }
  }
}

function displayRecommendations(item) {
  if (recommendations[item]) {
    const suggestionList = recommendations[item].map(rec => `<p>Do you want? ${rec}</p>`).join('');
    recommendationDisplay.innerHTML = suggestionList;
  }
}

function editItem(item, li) {
  const newItem = prompt('Edit item:', item);
  if (newItem) {
    li.querySelector('span').textContent = `${newItem} (${selectedAisle})`;
    const itemIndex = shoppingLists[currentList].findIndex(i => i.item === item);
    if (itemIndex !== -1) {
      shoppingLists[currentList][itemIndex].item = newItem;
      localStorage.setItem('shoppingLists', JSON.stringify(shoppingLists));
    }
  }
}

function deleteItem(item, li, cost) {
  itemList.removeChild(li);
  shoppingLists[currentList] = shoppingLists[currentList].filter(i => i.item !== item);
  localStorage.setItem('shoppingLists', JSON.stringify(shoppingLists));
  updateBudget(-cost);
}

function updateBudget(amount) {
  const currentTotal = parseFloat(totalCost.textContent.replace('Total Cost: $', '')) || 0;
  const newTotal = currentTotal + amount;
  totalCost.textContent = `Total Cost: $${newTotal.toFixed(2)}`;

  const remaining = parseFloat(budgetInput.value) - newTotal;
  remainingBudget.textContent = `Remaining Budget: $${remaining.toFixed(2)}`;

  if (remaining < 0) {
    budgetMessageContainer.textContent = 'You have exceeded your budget!';
  } else {
    budgetMessageContainer.textContent = '';
  }
}

// Add item to the list
addItemButton.addEventListener('click', () => {
  const item = itemInput.value.trim().toLowerCase();
  if (item) {
    selectAisleBasedOnItem(item);

    const li = document.createElement('li');
    const itemText = document.createElement('span');
    itemText.textContent = `${item} (${selectedAisle})`;
    li.appendChild(itemText);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editItem(item, li));
    li.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteItem(item, li, 5));
    li.appendChild(deleteButton);

    itemList.appendChild(li);
    itemInput.value = '';
    shoppingLists[currentList].push({ item, aisle: selectedAisle });
    localStorage.setItem('shoppingLists', JSON.stringify(shoppingLists));

    updateBudget(5);

    if (recommendationToggle.checked && recommendations[item]) {
      displayRecommendations(item);
    } else {
      recommendationDisplay.innerHTML = '';
    }
  } else {
    alert('Please enter an item name and select an aisle.');
  }
});

// Create a new shopping list
newListButton.addEventListener('click', () => {
  const listName = prompt('Enter a name for the new list:');
  if (listName) {
    shoppingLists[listName] = [];
    currentList = listName;
    localStorage.setItem('shoppingLists', JSON.stringify(shoppingLists));
    updateListSelector();
  }
});

// Share the current list
shareListButton.addEventListener('click', () => {
  const currentListItems = shoppingLists[currentList];
  const listContent = currentListItems.map(item => `${item.item} (${item.aisle})`).join('\n');

  if (listContent) {
    navigator.clipboard.writeText(listContent).then(() => {
      showNotification('List copied to clipboard!');
    }).catch(err => {
      alert('Failed to copy list: ' + err);
    });
  } else {
    alert('The list is empty!');
  }
});

// Notification function
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Select an aisle when clicked
aisles.forEach(aisle => {
  aisle.addEventListener('click', () => {
    aisles.forEach(a => a.classList.remove('selected'));
    aisle.classList.add('selected');
    selectedAisle = aisle.textContent.toLowerCase();
  });
});
