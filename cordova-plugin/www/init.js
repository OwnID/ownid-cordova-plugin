var exec = require('cordova/exec');
window.ownid = window.ownid || (async (...a) => ((window.ownid.q = window.ownid.q || []).push(a), {error: null, data: null}));
document.addEventListener('deviceready', function () {
    exec(
        function (config) {
            const env = config.env && config.env !== 'prod' ? `${config.env}.` : '';
            const script = document.createElement('script');
            script.src = config.env === 'prod-eu'
                ? `https://cdn.ownid-eu.com/sdk/${config.appId}`
                : `https://cdn.${env}ownid.com/sdk/${config.appId}`;
            script.async = true;
            document.head.appendChild(script);
        },
        function (error) {
            console.warn('OwnIDCordovaPlugin.getOwnIDConfiguration error:', JSON.stringify(error));
        },
        'OwnIDCordovaPlugin',
        'getOwnIDConfiguration',
        []
    );
}, false);