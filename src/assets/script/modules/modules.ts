export const popUpContainer = document.querySelector('.existing-container') as HTMLDivElement

// Toggle background popUp
export const togglePopup = () => {
    popUpContainer.classList.toggle('hide')
}

export const closeUserLogin = () => {
    document.querySelector('.user-app')!.remove()
    document.querySelector('.todo-app')!.classList.remove('hide')
}
