import './assets/style/css/style.min.css'

// Interfaces
import {
    todosItem,
    } from "./assets/script/interfaces"

// Modules - Just for testing some ideas
import { togglePopup, popUpContainer, closeUserLogin } from "./assets/script/modules/modules";

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
    getDocs,
    getDoc
    } from 'firebase/firestore'

// User Authentication
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth'

// API Config
import {firebaseConfig} from "./assets/script/api/getapi"

// Init API
initializeApp(firebaseConfig)

// Connect to database and services
const db = getFirestore()
const auth = getAuth()

// Select collection in Firebase
// Collection
const colRef = collection(db, 'todos')
const userRef = collection(db, 'user')

// Query
const q = query(colRef, orderBy('created', 'desc'))

let todos: todosItem []
let userId: any
let userName: string

// Render Login box
const userLogin = () => {
    const loginFormDiv = document.querySelector('#loginform') as HTMLDivElement
    loginFormDiv.innerHTML = `
        <form id="user" class="userform">
          <input id="username" class="username" type="email" name="username" placeholder="Email" required>
          <input id="password" class="password" type="password" name="password" placeholder="Password" required>
          <div class="error-message hide"></div>
          <button class="welcome">Login! <span class="material-symbols-outlined">login</span></button>
        </form>
    `

    // Authenticate user with Firebase
    const userForm = document.querySelector('#user') as HTMLFormElement
    userForm.addEventListener('submit', (e) => {
        e.preventDefault()

        const email = userForm.username.value
        const password = userForm.password.value

        signInWithEmailAndPassword(auth, email, password)
            .then(cred => {
                userId = cred.user.uid
                //user = cred.user
                // Set Name from user
                getUserAccount(userId)
                closeUserLogin()
            })
            .catch(err => {
                const errorMessage = document.querySelector('.error-message') as HTMLDivElement
                errorMessage.classList.remove('hide')
                errorMessage.innerHTML = `${err.code}`
            })
    })
}

userLogin()

// Get the user account information
const getUserAccount = (id:any) => {
    const getUser = query(userRef, where("userid", "==", id))
    getDocs(getUser)
        .then(user => {
            user.forEach(user => {
                userName = String(user.data().name)
            })
            renderTodos() // Main render todos when the App starts
        })
        .catch(err => {
            console.log(err.message)
        })
}

// Render Create new user
const createNewUser = document.querySelector('.createuser') as HTMLSpanElement
createNewUser.addEventListener('click', () => {
    togglePopup()
    popUpContainer.innerHTML = `
        <!-- Start: Create new user -->
        <div class="user-box">
            <!-- Create new user form -->
            <h2>Create new user &#128075;</h2>
            <form id="createnewuser" class="createnewuser">
                <p>Enter the follwing information</p>
                <input id="create-username" class="username" type="email" name="createusername" placeholder="Email" required>
                <input id="create-name" class="username" type="text" name="createname" placeholder="Your name" required>
                <input id="create-password" class="username" type="password" name="createpassword" placeholder="Password" required>
                <div class="button-bar">
                    <button id="createbutton" type="submit" class="create-button">Create user</button>
                    <button id="createuser-cancel" type="button" class="cancel">Cancel</button>
                </div>
            </form>
        </div>
        <!-- End: Create new user -->
    `
    // Create new user: form data input
    const newUserForm = document.querySelector('#createnewuser') as HTMLFormElement
    newUserForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const userCredentials = {
            email: newUserForm.createusername.value,
            name: newUserForm.createname.value,
            password: newUserForm.createpassword.value
        }
        userName = newUserForm.createname.value
        saveUser(userCredentials)
    })

    // Close the form for creating new user
    const cancelButton = document.querySelector('#createuser-cancel') as HTMLButtonElement
    cancelButton.addEventListener('click', () => {
        togglePopup()
        popUpContainer.innerHTML = ``
    })
})

// Save New user data to Firebase
const saveUser = (credentials:any) => {
    createUserWithEmailAndPassword(auth, credentials.email, credentials.password)
        .then(cred => {
            addDoc(userRef, {
                name: credentials.name,
                userid: cred.user.uid
            })
                .then(() => {
                    togglePopup()
                    popUpContainer.innerHTML = ``
                    userId = cred.user.uid
                    //user = cred.user
                    closeUserLogin()
                    renderTodos()
                })
        })
        .catch(err => {
            console.log(err.message)
        })
}

// Logout check and check for deleting user
const logoutCheck = () => {
    togglePopup()
    popUpContainer.innerHTML = `
        <div class="logout-box">
            <h2>Sign out?</h2>
            <span>
              Are you sure you want to sign out?  
            </span>
            <div class="box-buttons">
                <button data-action="logout">Yes please</button>
                <button class="cancel" data-action="cancel" >No way!</button>
            </div>
        </div>`
}

// Logout user
const logoutUser = () => {
    console.log("Log out")
    signOut(auth)
        .then(() => {
            location.reload()
        })
        .catch(err => {
            console.log(err.message)
        })
}

// User settings Panel
const settingsPanelEl = document.querySelector('.settings-panel') as HTMLDivElement
const settingsPanel = () => {
    settingsPanelEl.classList.toggle('hide')
    settingsPanelEl.innerHTML = `
        <div class="settings-close">
        Close settings<span class="material-symbols-outlined close-settings">cancel</span>
        </div>
        <div class="settings-category">
            <h3>User settings</h3>
            <div class="settings-item" data-action="deleteUser">
                Remove my user and all data
            </div>
        </div>
    `
    document.querySelector('.settings-close')!.addEventListener('click', () => {
        settingsPanelEl.classList.toggle('hide')
        settingsPanelEl.innerHTML = ``
    })
    // Actions from the User settings tab
    settingsPanelEl.addEventListener('click', (e) => {
        let target:any = e.target as HTMLDivElement
        if(target.dataset.action === 'deleteUser') {
            console.log("deleteAccountCheck")
            deleteAccountCheck()
        }
    })
}

// Fetch/update data from Firebase realtime
// And Check if the user is signed in.
onAuthStateChanged(auth, (user) => {
    if(user) {
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
        userId = user.uid
        getUserAccount(userId) // Get the account info. Add more info in the future.
        closeUserLogin()
    })
    } else {
        console.log("No user logged in")
    }
})

const todoList = document.querySelector('#todolist')!
const completedList = document.querySelector('#completedlist')!
const searchForm = document.querySelector('#search') as HTMLFormElement
const darkBg = document.querySelector('.existing-container') as HTMLDivElement

// Hide the container
document.querySelector('.todo-app')!.classList.add('hide')

// Render user settings
const userSettings = () => {
    document.querySelector('.user-settings')!.innerHTML = `
        <div class="logged-user">
            <span class="material-symbols-outlined">person</span>
            <div class="user-info">
                <strong>Signed in as: </strong><br>
                ${userName}
            </div>
        </div>
        <div class="settings">
            <span class="material-symbols-outlined toggle-settings">settings</span>
            <span class="material-symbols-outlined logout">logout</span>
        </div>
    `
    document.querySelector('.logout')!.addEventListener('click', () => {
        logoutCheck()
    })
    document.querySelector('.toggle-settings')!.addEventListener('click', () => {
        settingsPanel()
    })
}

// Render todos
const renderTodos = () => {
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
    userSettings() // Render user settings field
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
todoForm.addEventListener('submit',
    (e) => {
        e.preventDefault();
        addDoc(colRef, {
            todo: todoForm.addtask.value,
            category: todoForm.taskcategory.value,
            completed: false,
            created: serverTimestamp(),
            userid: todoForm.uid.value
        }).then(() => {
            searchForm.reset()
            todoForm.reset()
        }).catch(err => {
            console.log(err.message)
        })
})


// Edit todos
todoList.addEventListener('click', (e) => {
    const listEditItem = document.querySelectorAll('.listitem')
    const target = e.target as HTMLElement
    if(target.dataset.edit) {
        listEditItem.forEach(item => {
            let itemDiv = item as HTMLDivElement
            darkBg.classList.remove('hide')
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
                    <button class="edit-button">Update</button>
                </form>
                `
            }
        })
    }
})

// Save edited data to server
todoList.addEventListener('submit', (e) => {
    e.preventDefault()
    darkBg.classList.add('hide')
    const target = e.target as HTMLFormElement
    if(target.tagName === 'FORM') {
        const docId:string = target.dataset.todoid!
        let docRef = doc(db, 'todos', docId)
        updateDoc(docRef, {
            todo: target.editfield.value,
            category: target.taskcategoryedit.value
        })
            .then(() =>
                console.log("Update complete")
            )
    }
})

// Click delete or add as completed from upcoming tasks
todoList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if(target.dataset.delete) {
        deleteMsg(target.dataset.delete)
    }
    if(target.dataset.done) {
        let docRef = doc(db, 'todos', target.dataset.done)
        updateDoc(docRef, {
            completed: true
        })
        .then(() =>
            //renderTodos()
            console.log("Todo Done")
        )
    }
})

// Click delete from completed tasks
completedList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if(target.dataset.delete) {
        deleteMsg(target.dataset.delete)
    }
})

// Delete message
//const deleteBox = document.querySelector('.delete-box') as HTMLDivElement
const deleteMsg = (targetId:any) => {
    const docRef = doc(db, 'todos', targetId)
    let docData:any
    getDoc(docRef)
        .then(docItem => {
            docData = docItem.data()
            togglePopup()
            popUpContainer.innerHTML = `
            <div class="delete-box">
                <h2>Delete? &#128543;</h2>
                <span>
                    Are you sure you want to delete?<br>
                    <strong>${docData.todo}</strong>
                </span>
                <div class="box-buttons">
                    <button data-id="${docItem.id}" data-action="delete">Yes please</button>
                    <button class="cancel" data-action="cancel" >No way!</button>
                </div>
            </div>`
        })
}

// Delete check and Logout check
popUpContainer.addEventListener('click', (e:any) => {
    const target = e.target as HTMLElement
    if(target.tagName === 'BUTTON' && target.dataset.action) {
        togglePopup()
        popUpContainer.innerHTML = ``
        if(target.dataset.action === 'cancel') {
            renderTodos()
        } else if(target.dataset.action === 'delete' && target.dataset.id) {
            deleteTodos(target.dataset.id)
        } else if(target.dataset.action === 'logout') {
            logoutUser()
        } else if(target.dataset.action === 'deleteaccount') {
            console.log("Clicking the delete button")
            deleteUserData()
        }
    }
})

// Delete todos
const deleteTodos = (targetId:string) => {
    const docRef = doc(db, 'todos', targetId)
    deleteDoc(docRef)
        .then(() =>
            console.log("Delete completed")
        )
}

// Set the todolist based on user
let userTodos: any [] = []
const setTodo = (userId: any) => {
    userTodos = todos.filter(item => userId.includes(item.userid))
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
    let noFilter:boolean = false
    const filterText = document.querySelector('#nofilter') as HTMLSpanElement ?? ''
    const taskItem = document.querySelectorAll('.listitem')
    taskItem.forEach(item => {
        if(item.classList.contains('hide') && !noFilter) {
            filterText.classList.remove('hide')
        }
        if(!item.classList.contains('completed') && !item.classList.contains('hide')) {
            item.classList.add('hide')
        }
    })
    const searchQuery = userTodos.filter((item: any) => item.todo.toLowerCase().trim().includes(searchKey))
    searchQuery.forEach(item => {
        const searchedItem = document.querySelector('[data-title="' + item.todo + '"]') as HTMLDivElement
        if(!item.completed && searchedItem.classList.contains('hide')) {
            searchedItem.classList.remove('hide')
            noFilter = true
            filterText.classList.add('hide')
        }
    })
}

// Reset all hide on list items
const resetHide = () => {
    let listItems = document.querySelectorAll('.listitem')!
    listItems.forEach(item => {
        item.classList.remove('hide')
    })
}

// Check if the user wants to delete user account
const deleteAccountCheck = () => {
    console.log("Is this one working?")
    togglePopup()
    popUpContainer.innerHTML = `
        <div class="account-box">
            <h2>⚠️ Delete your account</h2>
            <span>
              Are you sure you want to delete your account?<br>
              <br>
              All user data and todos will be deleted.<br>  
            </span>
            <div class="box-buttons">
                <button data-action="deleteaccount">Yes please</button>
                <button class="cancel" data-action="cancel" >I´ve changed my mind!</button>
            </div>
        </div>`
}

// Deleting user with data, and account
const deleteUserData = () => {
    let docQuery = query(colRef, where('userid', '==', userId))
    let userQuery = query(userRef, where('userid', '==', userId))
    // Delete user documents
    getDocs(docQuery)
        .then(docItem => {
            docItem.forEach(docId => {
                const docRef = doc(db, 'todos', docId.id)
                deleteDoc(docRef)
                    .then(() => {
                        console.log("Todos deleted")
                    })
               })
        })
        .catch(err => {
            console.log(err.message)
        })
    // Delete user data
    getDocs(userQuery)
        .then(userItem => {
            userItem.forEach(docId => {
                const userRef = doc(db, 'user', docId.id)
                deleteDoc(userRef)
                    .then(()=> {
                        console.log("User data deleted")
                    })
                })
        })
        .catch(err => {
            console.log(err.message)
        })
    // Delete user account
    onAuthStateChanged(auth, (user) => {
        if (user) {
            user.delete()
                .then(()=> {
                    console.log("Your Account has been deleted")
                    location.reload()
                })
                .catch(err => {
                    console.log(err.message)
                })
            }
    })
}