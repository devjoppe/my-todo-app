// TODO:
// DONE - Hämta in lista med icke klara todos
// DONE - Hämta in lista med klara todos
// DONE - Push in new Tasks
// DONE - Click on complete
// DONE - Delete an item
// KINDA DONE - Filter by search box <- This was hard!

const todos = [
	{
		title: "Learn basic JavaScript",
        category: 'work',
		completed: false
	},
	{
		title: "Learn DOM",
        category: 'work',
		completed: false
	},
	{
		title: "Go out with the dog",
        category: 'private',
		completed: false
	},
	{
		title: "Finish my Todo-App",
        category: 'none',
		completed: true
	}
];

const todoListApp = document.querySelector('#todolist');
const completedListApp = document.querySelector('#completedlist');
const addItemForm = document.querySelector('#addtodo');
const allApp = document.querySelector('.inner-content');
const searchForm = document.querySelector('#search');

// Funktion för att hämta in och visa tasksen i listan
const getList = () => {

    // Clear DOM
    todoListApp.innerHTML = ``;
    completedListApp.innerHTML = ``;

    const upcomingTask = todos.filter(taskItem => taskItem.completed == false);

    upcomingTask.forEach(listItem => {
        // List onging tasks template

        const listDataItems = `
        <div class="listitem ongoing" data-title="${listItem.title}">
            <div class="itemcontent">
                <div class="check">
                    <span class="material-symbols-outlined" data="${listItem.title}">done</span>
                </div>
                <span class="itemtitle">${listItem.title}</span>
            </div>
            <div class="misc">
                <span class="category ${listItem.category}">${listItem.category}</span>
                <span class="material-symbols-outlined trash" delete="${listItem.title}">delete</span>
            </div>
        </div>
        `;
        // Connect it to the DOM
        todoListApp.innerHTML += listDataItems;
    })
    // Completed tasks
    const compTasks = todos.filter(taskItems => taskItems.completed == true);

    compTasks.forEach(listItem => {
        const listDataItems = `
        <div class="listitem completed">
            <span>${listItem.title}</span>
            <div class="misc">
                <span class="category ${listItem.category}">${listItem.category}</span>
                <span class="material-symbols-outlined trash" delete="${listItem.title}">delete</span>
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

    if(e.target.getAttribute('data')) {
        
        const listItem = e.target.getAttribute('data');
        //Look into the objekt with the title who has the same name as the button attribute
        const getItem = todos.find(({ title }) => title === listItem);
        getItem.completed = true;
    }

    if(e.target.getAttribute('delete')) {
        const listItem = e.target.getAttribute('delete');
        // Get the index in of the object in todos
        const getItem = todos.findIndex(item => item.title === listItem);
        // Remove the object from the array
        todos.splice(getItem, 1);
    }
    getList();
});

const listContent = document.querySelectorAll('.itemtitle');

// Filter function with some bugs :)
const filterItems = searchTerm => {
    const itemEl = document.querySelectorAll('.listitem');
    for(i = 0; i < itemEl.length; i++) {
        itemEl[i].classList.add('hide');
    }
    
    const taskFilter = todos.filter((filterItem) => filterItem.title.includes(searchTerm));

    taskFilter.forEach(listItem => {
        let filteredEl = document.querySelector('[data-title="' + listItem.title + '"]')
        if(filteredEl == null) {
        } else {
            filteredEl.classList.remove('hide');
        }
    });
}

searchForm.addEventListener('keyup', (e) => {
    e.preventDefault();
    const searchOutput = searchForm.searchfield.value.trim();
    
    // Starts the filter function
    filterItems(searchOutput); 
});