(function () {
    document.addEventListener('deviceready', onDeviceReady, false);

    function onDeviceReady() {
        addGigyaSdkScript('3_hOdIVleWrXNvjArcZRwHJLiGA4e6Jrcwq7RfH5nL7ZUHyI_77z43_IQrJYxLbiq_');
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
                            data: {ownId: window.ownIdDataObject.data},
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

    function registerStreamline({ firstName, password, data, loginId }) {
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
                        data: { ownId: data },
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

    function gigyaLogin({email, password}) {
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

    function logout() {
        window.gigya.accounts.logout();
    }

    window.auth = { login, register, registerStreamline, gigyaLogin, logout };
})();