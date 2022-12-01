const todoListApp = document.querySelector('#todolist');
const completedListApp = document.querySelector('#completedlist');
const addItemForm = document.querySelector('#addtodo');
const allApp = document.querySelector('.inner-content');
const searchForm = document.querySelector('#search');

// Render the list
const getList = () => {

    // Clear DOM
    todoListApp.innerHTML = ``;
    completedListApp.innerHTML = ``;

    // Upcoming tasks
    const upcomingTask = todos.filter(taskItem => taskItem.completed === false);

    upcomingTask.forEach(listItem => {
        const listDataItems = `
        <div class="listitem ongoing" data-title="${listItem.title}">
            <div class="itemcontent">
                <div class="check">
                    <span class="material-symbols-outlined" data-done="${listItem.title}">done</span>
                </div>
                <span class="itemtitle">${listItem.title}</span>
            </div>
            <div class="misc">
                <span class="category ${listItem.category}">${listItem.category}</span>
                <span class="material-symbols-outlined trash" data-delete="${listItem.title}">delete</span>
            </div>
        </div>
        `;
        // Connect it to the DOM
        todoListApp.innerHTML += listDataItems;
    })

    // Completed tasks
    const compTasks = todos.filter(taskItems => taskItems.completed === true);

    compTasks.forEach(listItem => {
        const listDataItems = `
        <div class="listitem completed" data-title="${listItem.title}">
            <span>${listItem.title}</span>
            <div class="misc">
                <span class="category ${listItem.category}">${listItem.category}</span>
                <span class="material-symbols-outlined trash" data-delete="${listItem.title}">delete</span>
            </div>
        </div>
        `;
        //Connect to the DOM
        completedListApp.innerHTML += listDataItems;
    })
}

getList();

addItemForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const newTodoTitle = addItemForm.addfield.value;
    const newTodoCategory = addItemForm.taskcategory.value;

    // Push new object into the array
    todos.push({
        title: newTodoTitle, category: newTodoCategory, completed: false
     })
     // Reset value
     addItemForm.addfield.value = ``;
     addItemForm.taskcategory.value = `none`;

     getList();
});

allApp.addEventListener('click', (e) => {

    //Look into the objekt with the title who has the same name as the button attribute
    if(e.target.dataset.done) {
        const getItem = todos.find(({ title }) => title === e.target.dataset.done);
        getItem.completed = true;
    }
    if(e.target.dataset.delete) {
        const getItem = todos.findIndex(item => item.title === e.target.dataset.delete);
        // Remove the object from the array
        todos.splice(getItem, 1);
    }
    removeFilter();
    getList();
});

// The filter function
const filterItems = searchTerm => {
    const itemEl = document.querySelectorAll('.listitem');

    itemEl.forEach(listItem => {
        if(!listItem.classList.contains('completed')) {
            listItem.classList.add('hide');
        }
    })
    
    const taskFilter = todos.filter((filterItem) => filterItem.title.toLowerCase().trim().includes(searchTerm));

    taskFilter.forEach(listItem => {
        let filteredEl = document.querySelector('[data-title="' + listItem.title + '"]')
        if(!listItem.completed) {
            filteredEl.classList.remove('hide');
        }
    });
}

searchForm.addEventListener('keyup', (e) => {
    e.preventDefault();
    const searchOutput = searchForm.searchfield.value.toLowerCase().trim();
    filterItems(searchOutput); 
});

// Function remove filter text
const removeFilter = () => {
    searchForm.searchfield.value = ``;
}