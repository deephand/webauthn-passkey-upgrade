# WebAuthn Passkey Upgrade

This project demonstrates a username-first login flow with an automated passkey upgrade feature.

## Automated Passkey Upgrade

After a successful password-based login, the application will attempt to create a new passkey for the user. This demonstrates a seamless upgrade from a password-based login to a more secure passkey.

## Customization

The login flow can be customized using the following URL parameters:

*   `username`: Use a username instead of an email for login.
*   `noUsernameInPasswordForm`: Do not pre-fill the username on the password screen.
*   `delay`: Add a simulated network delay (in milliseconds) after the password form is submitted.