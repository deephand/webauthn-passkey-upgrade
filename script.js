const form = document.getElementsByClassName('form-class')[0];
const usernameContainer = document.getElementById('username-container');
const successContainer = document.getElementById('success-container');
const successUsername = document.getElementById('success-username');
const successPassword = document.getElementById('success-password');
const messageDiv = document.getElementById('message');
const usernameOrEmailInput = document.getElementById('will-be-updated');
const urlParams = new URLSearchParams(window.location.search);
const isUsername = urlParams.has('username');
const noUsernameInPasswordForm = urlParams.has('noUsernameInPasswordForm');

console.log('Customization options:');
console.log('  - "username" URL parameter: ' + (isUsername ? 'present. Using username field.' : 'not present. Using email field.'));
console.log('  - "noUsernameInPasswordForm" URL parameter: ' + (noUsernameInPasswordForm ? 'present. Username field will not be present on the password screen.' : 'not present. Username will be carried over to the password screen.'));

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
        const autocompleteType = isUsername ? 'username' : 'email';
        const fieldName = isUsername ? 'username' : 'email';
        const fieldType = isUsername ? 'text' : 'email';
        usernameField = `<input type="${fieldType}" id="${fieldName}" name="${fieldName}" value="${username}" autocomplete="${autocompleteType}" class="hidden">`;
    }

    const passwordContainerHTML = `
        <div id="password-container" class="container">
            <h3>Username first flow demo</h3>
            <p>Now, enter an arbitrary password to continue. There's no real backend.</p>
            <form class="form-class">
                ${usernameField}
                <input type="password" id="password" placeholder="PASSWORD" required>
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
        successUsername.textContent = username;
        successPassword.textContent = password;
        successContainer.classList.remove('hidden');
        conditionalCreate();
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

function showMessage(msg, isError = false) {
    messageDiv.textContent = msg;
    messageDiv.className = isError ? 'error' : 'success';
}

function showError(msg) {
    showMessage(msg, true);
}

let conditionalCreate = async () => {
    const userName = document.getElementById('success-username').textContent;
    if (!userName) {
        showMessage("Thank you for using passkeys!");
        return;
    }
    const rpId = window.location.hostname;
    if (PublicKeyCredential === undefined) {
        showError("This browser doesn's support WebAuthn.");
        return;
    }
    if (PublicKeyCredential.getClientCapabilities === undefined) {
        showError(
        "getClientCapabilities() not supported. Try enabling chrome://flags#enable-experimental-web-platform-features"
        );
        return;
    }
    let capabilities;
    try {
        capabilities = await PublicKeyCredential.getClientCapabilities();
    } catch (error) {
        showError("An error occurred: " + error.toString());
        return;
    }
    if (!capabilities.conditionalCreate) {
        showError(
        "Your browser doesn's support passkey upgrades. Try enabling chrome://flags#web-authentication-passkey-upgrades maybe?"
        );
        return;
    }
    showMessage("Checking for existing passkeys...");
    let timeoutID = window.setTimeout(() => {
        showError(
        "Looks like it's not working. Make sure your browser can access your passkeys. Try creating one on webauthn.io first to check. Also make sure there is a matching password in your password manager with the same username you used to log in."
        );
    }, 10000);
    let credential;
    console.log('Upgrade for ' + rpId);
    let pk = {
        challenge: Uint8Array.from([1, 2, 3, 4]),
        rp: {
        name: "Passkey Upgrade Demo",
        id: window.location.hostname,
        },
        user: {
        id: Uint8Array.from(userName.split("").map(c => c.codePointAt(0))),
        name: userName,
        displayName: userName,
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
        userVerification: "discouraged",
        residentKey: "required",
        },
    };
    console.log(pk);
    try {
        credential = await navigator.credentials.create({
        publicKey: pk,
        mediation: "conditional",
        });
    } catch (error) {
        showError("An error occurred: " + error.toString());
        return;
    }
    window.clearTimeout(timeoutID);
    if (!credential) {
        // This can happen if the user cancels the creation.
        // We can choose to show a message or not.
        showMessage("Passkey creation was not completed.");
        return;
    }
    showMessage("Shiny new passkey!");
};