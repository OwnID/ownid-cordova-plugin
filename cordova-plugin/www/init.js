var exec = require('cordova/exec');

document.addEventListener('deviceready', function () {
    exec(
        function (config) {
            const env = config.env && config.env !== 'prod' ? `${config.env}.` : '';
            const url = config.env === 'prod-eu'
                ? `https://cdn.ownid-eu.com/sdk/${config.appId}`
                : `https://cdn.${env}ownid.com/sdk/${config.appId}`;

            ((o,w,n,i,d)=>{o[i]=o[i]||(async(...a)=>((o[i].q=o[i].q||[]).push(a),{error:null,data:null})),
            (d=w.createElement("script")).src=url,d.async=1,w.head.appendChild(d)})  
            (window,document,config.appId,'ownid');
        },
        function (error) { console.warn('OwnIDCordovaPlugin.getOwnIDConfiguration error:', JSON.stringify(error)); },
        'OwnIDCordovaPlugin',
        'getOwnIDConfiguration',
        []
    );
}, false);