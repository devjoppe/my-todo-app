// Select the div for the HTML-form
export const loginformDiv = document.querySelector('#loginform') as HTMLDivElement

// Render login form
export const loginForm = () => {
    loginformDiv.innerHTML = `
    <form id="user" class="userform">
      <input id="username" class="username" type="text" name="username" placeholder="Email" required>
      <input id="password" class="password" type="password" name="password" placeholder="Password" required>
      <button class="welcome">Login! <span class="material-symbols-outlined">login</span></button>
    </form>
    `
}