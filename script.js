const form = document.getElementsByClassName('form-class')[0];
const usernameContainer = document.getElementById('username-container');
const usernameOrEmailInput = document.getElementById('will-be-updated');
const urlParams = new URLSearchParams(window.location.search);
const isUsername = urlParams.has('username');
const noUsernameInPasswordForm = urlParams.has('noUsernameInPasswordForm');
const delay = parseInt(urlParams.get('delay')) || 500;

console.log('Customization options:');
console.log('   - "username" URL parameter: ' + (isUsername ? 'present. Using username field.' : 'not present. Using email field.'));
console.log('   - "noUsernameInPasswordForm" URL parameter: ' + (noUsernameInPasswordForm ? 'present. Username field will not be present on the password screen.' : 'not present. Username will be carried over to the password screen.'));
console.log(`   - "delay" URL parameter: ${urlParams.has('delay') ? "" : "not"} present. Using ${delay}ms delay after password form.`);

if (isUsername) {
    usernameOrEmailInput.type = 'text';
    usernameOrEmailInput.placeholder = 'USERNAME';
    usernameOrEmailInput.id = 'username';
    usernameOrEmailInput.name = 'username';
    usernameOrEmailInput.autocomplete = "username webauthn";
} else {
    usernameOrEmailInput.type = 'email';
    usernameOrEmailInput.placeholder = 'EMAIL ADDRESS';
    usernameOrEmailInput.id = 'email';
    usernameOrEmailInput.name = 'email';
    usernameOrEmailInput.autocomplete = "email webauthn";
}

let username = '';

function showPasswordContainer() {
    const urlParams = new URLSearchParams(window.location.search);
    const noUsernameInPasswordForm = urlParams.has('noUsernameInPasswordForm');

    let usernameField = '';
    if (!noUsernameInPasswordForm) {
        const fieldName = isUsername ? 'username' : 'email';
        const fieldType = isUsername ? 'text' : 'email';
        usernameField = `<input type="${fieldType}" id="${fieldName}" name="${fieldName}" value="${username}" class="hidden">`;
    }

    const passwordContainerHTML = `
        <div id="password-container" class="container">
            <h3>WebAuthn Passkey Upgrade Demo</h3>
            <p>Now, enter an arbitrary password to continue. There's no real backend.</p>
            <form class="form-class">
                ${usernameField}
                <input type="password" id="password" placeholder="PASSWORD" required autocomplete="current-password">
                <button type="submit">Sign in</button>
            </form>
        </div>
    `;
    const footer = document.querySelector('.main-footer');
    footer.insertAdjacentHTML('beforebegin', passwordContainerHTML);

    const passwordForm = document.getElementsByClassName('form-class')[0];
    const passwordContainer = document.getElementById('password-container');

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        passwordContainer.remove();
        // Simulate network request
        window.location.href = `success.html?username=${username}&password=${password}&delay=${delay}`;
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    username = usernameOrEmailInput.value;
    usernameContainer.remove();
    // Simulate network request
    setTimeout(() => {
        showPasswordContainer();
    }, 500);
});