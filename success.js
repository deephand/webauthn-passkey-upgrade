const successUsername = document.getElementById('success-username');
const successPassword = document.getElementById('success-password');
const messageDiv = document.getElementById('message');
const successContainer = document.getElementById('success-container');

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const password = urlParams.get('password');
const delay = parseInt(urlParams.get('delay')) || 0;

setTimeout(() => {
    successContainer.classList.remove('hidden');
    successUsername.textContent = username;
    successPassword.textContent = password;
    conditionalCreate();
}, delay);

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

conditionalCreate();