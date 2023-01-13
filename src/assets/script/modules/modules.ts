export const popUpContainer = document.querySelector('.existing-container') as HTMLDivElement

// Toggle background popUp
export const togglePopup = () => {
    popUpContainer.classList.toggle('hide')
}

export const closeUserLogin = () => {
    const userAppEl = document.querySelector('.user-app')! as HTMLDivElement
    if(userAppEl) {
        userAppEl.remove()
    }
    const todoAppEl = document.querySelector('.todo-app')! as HTMLDivElement
    if(todoAppEl.classList.contains('hide')) {
        todoAppEl.classList.remove('hide')
    } else {
        console.log("NOTHING TO HIDE")
    }
}
