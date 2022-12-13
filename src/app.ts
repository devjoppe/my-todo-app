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
    serverTimestamp
    } from 'firebase/firestore'

// API Config
import {firebaseConfig} from "./assets/script/api/getapi"

// Init API
initializeApp(firebaseConfig)

// Connect to database
const db = getFirestore()

// Select collection in Firebase
const colRef = collection(db, 'todos')

interface todosItem {
    todo: string,
    completed: boolean,
    id: any,
    category: string,
    created: any
}

// Query
const q = query(colRef, orderBy('created', 'desc'))

let todos: todosItem []

// Fetch/update data from Firebase realtime
onSnapshot(q, (snapshot) => {
    todos = []
    snapshot.docs.forEach(item => {
        todos.push({
            id: item.id,
            todo: item.data().todo,
            completed: item.data().completed,
            category: item.data().category,
            created: serverTimestamp()
        })
    })
    console.log(todos)
    renderTodos()
})

// Render
const renderTodos = () => {
    document.querySelector('#todolist')!.innerHTML = todos.filter(item => !item.completed).map(item => {
        return `<div class="listitem ongoing" data-title="${item.todo}">
            <div class="itemcontent">
                <div class="check">
                    <span class="material-symbols-outlined" data-done="${item.todo}">done</span>
                </div>
                <span class="itemtitle">${item.todo}</span>
            </div>
            <div class="misc">
                <span class="category ${item.category}">${item.category}</span>
                <span class="material-symbols-outlined trash" data-delete="${item.id}">delete</span>
            </div>
        </div>`
    }).join('')
}

// Add
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

// Delete
