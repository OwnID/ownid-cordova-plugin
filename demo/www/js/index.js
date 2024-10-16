/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    addGigyaSdkScript('3_hOdIVleWrXNvjArcZRwHJLiGA4e6Jrcwq7RfH5nL7ZUHyI_77z43_IQrJYxLbiq_');

    waitForOwnId().then((ownid) => {
        ownid("login", {
            loginIdField: document.getElementById("login-email"),
            passwordField: document.getElementById("login-password"),
            onError: (error) => document.getElementById('login-error').innerText = error,
            onLogin: (data) => showUserPage(data.metadata.loginId)
        });

        ownid("register", {
            loginIdField: document.getElementById("register-email"),
            passwordField: document.getElementById("register-password"),
            passwordFieldBinding: true,
            onError: (error) => document.getElementById('register-error').innerText = error,
            onRegister: (ownIdData) => { window.ownIdDataObject = ownIdData; }
        });
    });
}

function addGigyaSdkScript(apikey) {
    const script = document.createElement('script');
    script.src = `https://cdns.gigya.com/js/gigya.js?apikey=${apikey}`;
    window.document.head.append(script);
    script.onload = function () {
        window.gigya.accounts.getAccountInfo({
            callback: function (response) {
                if (response.errorCode === 0) {
                    showUserPage(response.profile.email);
                } else {
                }
            }
        });
    };
}

function waitForOwnId() {
    return new Promise((resolve) => {
        const checkOwnId = setInterval(() => {
            if (window.ownid !== undefined) {
                clearInterval(checkOwnId);
                resolve(window.ownid);
            }
        }, 100); // Checks every 100ms
    });
}

function getProviders() {
    const providers = {
        account: {
            register: async (account) => {
                const regData = {
                    loginId: account.loginId,
                    password: window.ownid('generateOwnIDPassword', 12),
                    firstName: account.profile.firstName,
                    data: account.ownIdData,
                };
                try {
                    await registerStreamline(regData);

                    return { status: 'logged-in' };
                } catch (error) {
                    return { status: 'fail', reason: error };
                }
            },
        },
        auth: {
            password: {
                authenticate: async (params) => {
                    try {
                        await gigyaLogin({ email: params.loginId, password: params.password });

                        return { status: 'logged-in' };
                    } catch {
                        return { status: 'fail', reason: 'Please enter a valid password' };
                    }
                },
            },
        },
    };
    const events = {
        onAccountNotFound: () => ({ action: 'ui.register' }),
        onFinish: (data) => { console.log(data.loginId); showUserPage(data.loginId); },
    };

    return { events, providers };
}

function registerStreamline({
    firstName,
    password,
    data: ownidData,
    loginId,
}) {
    return new Promise((resolve, reject) => {
        window.gigya.accounts.initRegistration({
            callback: (response) => {
                // @ts-ignore
                window.gigya.accounts.register({
                    regToken: response.regToken,
                    email: loginId,
                    password,
                    profile: {
                        firstName,
                    },
                    data: { ownId: ownidData },
                    finalizeRegistration: true,
                    callback: async (data) => {
                        if (data.status === 'FAIL') {
                            reject(data.errorDetails);
                            return;
                        }

                        resolve(data);
                    },
                });
            },
        });
    });
}

function gigyaLogin({ email, password }) {
    return new Promise((resolve, reject) => {
        window.gigya.accounts.login({
            loginID: email,
            password,
            callback: (data) => {
                if (data.status === 'FAIL') {
                    reject(data.errorDetails);
                    return;
                }

                resolve(data);
            },
        });
    });
}

function showLoginPage() {
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('registration-page').style.display = 'none';
    document.getElementById('user-page').style.display = 'none';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';

    waitForOwnId().then((ownid) => {
        ownid('destroy', 'register');
        ownid("login", {
            loginIdField: document.getElementById("login-email"),
            passwordField: document.getElementById("login-password"),
            onError: (error) => document.getElementById('login-error').innerText = error,
            onLogin: (data) => showUserPage(data.metadata.loginId)
        });
    });
}

function showRegistrationPage() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('registration-page').style.display = 'block';
    document.getElementById('user-page').style.display = 'none';
    document.getElementById('register-name').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';


    waitForOwnId().then((ownid) => {
        ownid('destroy', 'login');
        ownid("register", {
            loginIdField: document.getElementById("register-email"),
            passwordField: document.getElementById("register-password"),
            passwordFieldBinding: true,
            onError: (error) => document.getElementById('register-error').innerText = error,
            onRegister: (ownIdData) => { window.ownIdDataObject = ownIdData; }
        });
    });
}

function showUserPage(email) {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('registration-page').style.display = 'none';
    document.getElementById('user-page').style.display = 'block';
    document.getElementById('user-email').innerText = 'Logged in as: ' + email;

    waitForOwnId().then((ownid) => {
        ownid('destroy', 'login');
        ownid('destroy', 'register');
    });
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email && password) {
        window.gigya.accounts.login({
            loginID: email,
            password: password,
            callback: function (response) {
                if (response.errorCode === 0) {
                    showUserPage(email);
                } else {
                    document.getElementById('login-error').innerText = `Login failed: ${response.errorDetails}`;
                }
            }
        });
    } else {
        document.getElementById('login-error').innerText = `Please fill all data`;
    }
}

function register() {
    const firstName = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (firstName && email && password) {
        window.gigya.accounts.initRegistration({
            callback: function (response) {
                if (response.errorCode === 0) {
                    window.gigya.accounts.register({
                        email: email,
                        password: password,
                        profile: {
                            firstName: firstName,
                        },
                        regToken: response.regToken,
                        data: { ownId: window.ownIdDataObject.data },
                        finalizeRegistration: true,
                        callback: function (response) {
                            if (response.errorCode === 0) {
                                showUserPage(email);
                            } else {
                                document.getElementById('register-error').innerText = `Registration failed: ${response.errorDetails}`;
                            }
                        }
                    });
                } else {
                    document.getElementById('register-error').innerText = `Registration failed: ${response.errorDetails}`;
                }
            }
        });
    } else {
        document.getElementById('register-error').innerText = `Please fill all data`;
    }
}

function startElite() {
    window.ownid('start', {
        ...getProviders(),
    });
}

function logout() {
    window.gigya.accounts.logout();
    showLoginPage();
}