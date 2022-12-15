import './assets/style/css/style.min.css'

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
    // where,
    getDocs
    } from 'firebase/firestore'

// API Config
import {firebaseConfig} from "./assets/script/api/getapi"

// Init API
initializeApp(firebaseConfig)

// Connect to database
const db = getFirestore()

// Select collection in Firebase
const colRef = collection(db, 'todos')
const userRef = collection(db, 'user')

interface todosItem {
    todo: string,
    completed: boolean,
    id: any,
    category: string,
    created: any,
    userid: string
}

interface userItem {
    username: string
}

// Query
const q = query(colRef, orderBy('created', 'desc'))
const qu = query(userRef)

let todos: todosItem []
let users: userItem []

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
    renderTodos()
    completedRender()
})

onSnapshot(qu, (snapshot)=> {
    users = []
    snapshot.docs.forEach(item => {
        users.push({
            username: item.data().username
        })
    })
})

const todoList = document.querySelector('#todolist')!
const completedList = document.querySelector('#completedlist')!
const searchForm = document.querySelector('#search') as HTMLFormElement
const userForm = document.querySelector('#user') as HTMLFormElement

// Hide the container
// Todo Delete this one after the test.
document.querySelector('.todo-app')!.classList.add('hide')

// Check user email to the database
userForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const userMail: string = userForm.useremail.value
    const getUser = query(userRef)
    getDocs(getUser)
        .then(userItem => {
            userItem.docs.forEach(user => {
                if (user.data().email === userMail) {
                    existingUser()
                } else {
                    newUser()
                }
            })
        })
})

// User exist
const existingUser = () => {
    console.log("Existing user")
}

// New user, save user data
const newUser = () => {
    console.log("New user")
}

// Render todos
const renderTodos = () => {
    todoList.innerHTML = todos.filter(item => !item.completed).map(item => {
        return `<div class="listitem ongoing" data-title="${item.todo}">
            <div class="itemcontent">
                <div class="check">
                    <span class="material-symbols-outlined" data-done="${item.id}">done</span>
                </div>
                <span class="itemtitle">${item.todo}</span>
            </div>
            <div class="misc">
                <span class="category ${item.category}">${item.category}</span>
                <span class="material-symbols-outlined trash" data-delete="${item.id}">delete</span>
            </div>
        </div>`
    }).join("")
}

// Render todos completed
const completedRender = () => {
    completedList.innerHTML = todos.filter(item => item.completed).map(item => `
        <div class="listitem completed" data-title="${item.todo}">
            <span>${item.todo}</span>
            <div class="misc">
                <span class="category ${item.category}">${item.category}</span>
                <span class="material-symbols-outlined trash" data-delete="${item.id}">delete</span>
            </div>
        </div>
    `).join("")
}

// Add todos
const todoForm = document.querySelector('#addtodo') as HTMLFormElement
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addDoc(colRef, {
        todo: todoForm.addtask.value,
        category: todoForm.taskcategory.value,
        completed: false,
        created: serverTimestamp()
    })
    .then(() => {
        todoForm.reset()
    })
})

// Delete from upcoming tasks
todoList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if(target.dataset.delete) {
        const docRef = doc(db, 'todos', target.dataset.delete)
        deleteDoc(docRef)
    }
    if(target.dataset.done) {
        let docRef = doc(db, 'todos', target.dataset.done)
        updateDoc(docRef, {
            completed: true
        })
    }
})

// Delete from completed tasks
completedList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if(target.dataset.delete) {
        const docRef = doc(db, 'todos', target.dataset.delete)
        deleteDoc(docRef)
    }
})

// Search function
searchForm.addEventListener('keyup', (e) => {
    e.preventDefault()
    const searchKey: string = searchForm.searchfield.value.toLowerCase().trim()
    filterTasks(searchKey)
})

// Search tasks function
const filterTasks = (searchKey: string) => {
    console.log(searchKey)
    const taskItem = document.querySelectorAll('.listitem')
    taskItem.forEach(item => {
        if(!item.classList.contains('completed')) {
            item.classList.add('hide')
        }
    })
    const searchQuery = todos.filter((item) => item.todo.toLowerCase().trim().includes(searchKey))
    searchQuery.forEach(item => {
        const searchedItem = document.querySelector('[data-title="' + item.todo + '"]')!
        if(!item.completed) {
            searchedItem.classList.remove('hide')
        }
    })
}
