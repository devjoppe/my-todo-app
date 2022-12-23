import './assets/style/css/style.min.css'

// Interfaces
import {
    todosItem,
    userItem
    } from "./assets/script/interfaces"

// Firebase Imports: getFirestore, collection and getDocs
import {initializeApp} from 'firebase/app'
import {
    collection,
    getFirestore,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    updateDoc,
    where,
    getDocs
    } from 'firebase/firestore'

// API Config
import {firebaseConfig} from "./assets/script/api/getapi"

// Init API
initializeApp(firebaseConfig)

// Connect to database
const db = getFirestore()

// Select collection in Firebase
//  Collection
const colRef = collection(db, 'todos')
const userRef = collection(db, 'user')
// Query
const q = query(colRef, orderBy('created', 'desc'))
const qu = query(userRef)

let todos: todosItem []
let users: userItem []
let userId: any
let userName: string

// Fetch/update data from Firebase realtime
onSnapshot(q, (snapshot) => {
    todos = []
    snapshot.docs.forEach(item => {
        todos.push({
            id: item.id,
            todo: item.data().todo,
            completed: item.data().completed,
            category: item.data().category,
            created: serverTimestamp(),
            userid: item.data().userid
        })
    })
})

onSnapshot(qu, (snapshot)=> {
    users = []
    snapshot.docs.forEach(item => {
        users.push({
            username: item.data().username,
            email: item.data().email,
            id: item.id
        })
    })
})

const todoList = document.querySelector('#todolist')!
const completedList = document.querySelector('#completedlist')!
const searchForm = document.querySelector('#search') as HTMLFormElement
const userForm = document.querySelector('#user') as HTMLFormElement

// Hide the container
document.querySelector('.todo-app')!.classList.add('hide')

// Check user email to the database
userForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const userMail: string = userForm.useremail.value
    userName = userForm.username.value

    const isUser = users.filter(user => user.email === userMail).map(item => item.id).join('')
    userId = isUser

    setTodo(userId)

    document.querySelector('.user-app')!.classList.add('hide')
    document.querySelector('.todo-app')!.classList.remove('hide')

    isUser ? headsUp() : newUser(userMail, userName)
})

// Heads up -> existing user
const headsUpMsg = document.querySelector('.existing-container')!
const headsUp = () => {
    headsUpMsg.classList.remove('hide')
}
headsUpMsg.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement
    if(target.tagName === 'BUTTON') {
        headsUpMsg.classList.add('hide')
        renderTodos()
    }
})

// New user, save user data
const newUser = (mail:string, name:string) => {
    addDoc(userRef, {
        username: name,
        email: mail
    })
        .then(() => {
            console.log("New user created")
            const newUser = query(userRef, where("email", "==", mail))
            getDocs(newUser)
            .then(user => {
                user.forEach(uId => {
                    userId = uId.id
                })
                renderTodos()
            }
        )
    })
}

// Render todos
const renderTodos = () => {
    console.log("Render todos")
    document.querySelector('#usertitle')!.innerHTML = `${userName} Todos &#x1F4C3;`
    document.querySelector('#uid')!.setAttribute('value', userId)
    todoList.innerHTML = todos.filter(item => !item.completed && item.userid === userId).map(item => {
        return `<div class="listitem ongoing" data-title="${item.todo}" data-category="${item.category}" data-itemid="${item.id}">
            <div class="itemcontent">
                <div class="check">
                    <span class="material-symbols-outlined" data-user="${item.userid}" data-done="${item.id}">done</span>
                </div>
                <span class="itemtitle">${item.todo}</span>
            </div>
            <div class="misc">
                <span class="category ${item.category}">${item.category}</span>
                <span class="material-symbols-outlined pen" data-edit="${item.id}">edit</span>
                <span class="material-symbols-outlined trash" data-user="${item.userid}" data-delete="${item.id}">delete</span>
            </div>
        </div>`
    }).join("")
    if(!todoList.innerHTML) {
        todoList.innerHTML = `You have nothing todo &#x1F62E;`
    }
    setTodo(userId) // Updates the user todos array
    completedRender()
}

// Render todos completed
const completedRender = () => {
    completedList.innerHTML = todos.filter(item => item.completed && item.userid === userId).map(item => `
        <div class="listitem completed" data-title="${item.todo}">
            <span class="itemtitle">${item.todo}</span>
            <div class="misc">
                <span class="category ${item.category}">${item.category}</span>
                <span class="material-symbols-outlined trash" data-user="${item.userid}" data-delete="${item.id}">delete</span>
            </div>
        </div>
    `).join("")
    if(!completedList.innerHTML) {
        completedList.innerHTML = `Zero completed &#128564;`
    }
}

// Add todos
const todoForm = document.querySelector('#addtodo') as HTMLFormElement
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addDoc(colRef, {
        todo: todoForm.addtask.value,
        category: todoForm.taskcategory.value,
        completed: false,
        created: serverTimestamp(),
        userid: todoForm.uid.value
    })
    .then(() => {
        searchForm.reset()
        todoForm.reset()
        renderTodos()
    })
})

// Edit todos
todoList.addEventListener('click', (e) => {
    const listEditItem = document.querySelectorAll('.listitem')
    const target = e.target as HTMLElement
    if(target.dataset.edit) {
        listEditItem.forEach(item => {
            let itemDiv = item as HTMLDivElement
            if(itemDiv.dataset.itemid === target.dataset.edit) {
                let itemCategoryNone: String = ''
                let itemCategoryPrivate: String = ''
                let itemCategoryWork: String = ''
                switch (itemDiv.dataset.category) {
                    case 'none':
                        itemCategoryNone = 'Selected'
                        break
                    case 'private':
                        itemCategoryPrivate = 'Selected'
                        break
                    case 'work':
                        itemCategoryWork = 'Selected'
                        break
                }
                itemDiv.innerHTML = `
                <form id="edit" data-todoid="${target.dataset.edit}">
                    <input id="edit-todo" class="edit-input" type="text" name="editfield" value="${itemDiv.dataset.title}">
                    <label for="category-edit"></label>
                    <select class="addcategory-edit" id="category-edit" name="taskcategoryedit">
                        <option value="none" ${itemCategoryNone}>None</option>
                        <option value="private" ${itemCategoryPrivate}>Private</option>
                        <option value="work" ${itemCategoryWork}>Work</option>
                    </select>
                </form>
                `
            }
        })
    }
})

// Save edited data to server
todoList.addEventListener('submit', (e) => {
    e.preventDefault()
    const target = e.target as HTMLFormElement
    if(target.tagName === 'FORM') {
        const docId:string = target.dataset.todoid!
        let docRef = doc(db, 'todos', docId)
        updateDoc(docRef, {
            todo: target.editfield.value,
            category: target.taskcategoryedit.value
        })
            .then(() =>
                renderTodos()
            )
    }
})

// Delete and add as completed from upcoming tasks
todoList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if(target.dataset.delete) {
        const docRef = doc(db, 'todos', target.dataset.delete)
        deleteDoc(docRef)
        .then(() =>
            renderTodos(),
        )
    }
    if(target.dataset.done) {
        let docRef = doc(db, 'todos', target.dataset.done)
        updateDoc(docRef, {
            completed: true
        })
        .then(() =>
            renderTodos()
        )
    }
})

// Delete from completed tasks
completedList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if(target.dataset.delete) {
        const docRef = doc(db, 'todos', target.dataset.delete)
        deleteDoc(docRef)
            .then(() =>
                renderTodos()
            )
    }
})

// Set the todolist based on user
let userTodos: any [] = []
const setTodo = (userId: any) => {
    userTodos = todos.filter(item => userId.includes(item.userid))
    console.log("Set new Array for user todos", userTodos)
}

// Search function
searchForm.addEventListener('keyup', (e) => {
    e.preventDefault()
    const searchKey: string = searchForm.searchfield.value.toLowerCase().trim()
    if(!searchKey || searchKey === '') {
        resetHide()
    }
    filterTasks(searchKey)
})

// Disable submit on search
searchForm.addEventListener('submit', (e) => {
    e.preventDefault()
})

// Search tasks function
const filterTasks = (searchKey: string) => {
    console.log("Filter todos")
    console.log(searchKey)
    let listElement:any
    const taskItem = document.querySelectorAll('.listitem')
    taskItem.forEach(item => {
        if(!item.classList.contains('completed') && !item.classList.contains('hide')) {
            console.log("Going hide")
            console.log(item)
            listElement = item
            item.classList.add('hide')
        }
    })
    const searchQuery = userTodos.filter((item: any) => item.todo.toLowerCase().trim().includes(searchKey))
    console.log(userTodos)
    searchQuery.forEach(item => {
        const searchedItem = document.querySelector('[data-title="' + item.todo + '"]')!
        if(!item.completed && listElement.classList.contains('hide')) {
            console.log("display")
            searchedItem.classList.remove('hide')
        }
    })
}

// Reset all hide on list items
const resetHide = () => {
    console.log("Reset filter")
    let listItems = document.querySelectorAll('.listitem')!
    listItems.forEach(item => {
        item.classList.remove('hide')
    })
}

// Exit and remove user from database
document.querySelector('.logout')!.addEventListener('click', () => {
    console.log("Exit and remove user")
    let docQuery = query(colRef, where('userid', '==', userId))
    getDocs(docQuery)
        .then(docItem => {
            docItem.forEach(docId => {
              console.log(docId.id)
                const docRef = doc(db, 'todos', docId.id)
                const userRef = doc(db, 'user', userId)
                deleteDoc(docRef)
                    .then(() => {
                        console.log("All todos deleted")
                        deleteDoc(userRef)
                            .then(() => {
                                console.log("User deleted")
                                window.location.reload()
                            })
                    })
            })
        })
})