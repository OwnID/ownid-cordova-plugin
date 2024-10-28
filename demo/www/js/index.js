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
}

function showLoginPage() {
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('registration-page').style.display = 'none';
    document.getElementById('user-page').style.display = 'none';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';

    ownid('destroy', 'register');
    ownid("login", {
        loginIdField: document.getElementById("login-email"),
        passwordField: document.getElementById("login-password"),
        onError: (error) => document.getElementById('login-error').innerText = error,
        onLogin: (data) => showUserPage(data.metadata.loginId)
    });
}

function showRegistrationPage() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('registration-page').style.display = 'block';
    document.getElementById('user-page').style.display = 'none';
    document.getElementById('register-name').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';


    ownid('destroy', 'login');
    ownid("register", {
        loginIdField: document.getElementById("register-email"),
        passwordField: document.getElementById("register-password"),
        passwordFieldBinding: true,
        onError: (error) => document.getElementById('register-error').innerText = error,
        onRegister: (ownIdData) => { window.ownIdDataObject = ownIdData; }
    });
}

function showUserPage(email) {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('registration-page').style.display = 'none';
    document.getElementById('user-page').style.display = 'block';
    document.getElementById('user-email').innerText = 'Logged in as: ' + email;

    ownid('destroy', 'login');
    ownid('destroy', 'register');
}

function startElite() {
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
                    await auth.registerStreamline(regData);

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
                        await auth.gigyaLogin({ email: params.loginId, password: params.password });

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
        onFinish: (data) => { showUserPage(data.loginId); },
    };

    window.ownid('start', {
        events,
        providers
    });
}

function logout() {
    auth.logout();
    showLoginPage();
}