package com.ownid.sdk.cordova;


import android.net.Uri;
import android.util.Log;
import android.webkit.WebView;

import com.ownid.sdk.OwnId;
import com.ownid.sdk.OwnIdWebViewBridge;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.Config;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Collections;
import java.util.HashSet;

public class OwnIDCordovaPlugin extends CordovaPlugin {

    private static final String PRODUCT_NAME = "OwnIdCordovaPlugin/3.6.3";

    private JSONObject ownIdConfig;

    @Override
    protected void pluginInitialize() {
        super.pluginInitialize();

        ownIdConfig = new JSONObject();
        try {
            ownIdConfig.put("appId", preferences.getString("ownid-appId", ""));
            ownIdConfig.put("env", preferences.getString("ownid-env", ""));
            ownIdConfig.put("enableLogging", preferences.getBoolean("ownid-enableLogging", false));
        } catch (JSONException e) {
            Log.w("OwnIDCordovaPlugin", "Error parsing preferences", e);
            return;
        }

        String allowedOrigin;
        try {
            Uri uri = Uri.parse(Config.getStartUrl());
            allowedOrigin = uri.getScheme() + "://" + uri.getHost();
        } catch (Exception e) {
            Log.w("OwnIdCordovaPlugin", "Error parsing start url", e);
            allowedOrigin = "https://localhost";
        }

        OwnId.createInstanceFromJson(cordova.getActivity(), ownIdConfig.toString(), PRODUCT_NAME);

        final HashSet<String> allowedOriginRules = new HashSet<>(Collections.singletonList(allowedOrigin));

        final OwnIdWebViewBridge webViewBridge = OwnId.createWebViewBridge();
        webViewBridge.injectInto((WebView) webView.getView(), allowedOriginRules, cordova.getActivity(), true, null);
    }

    @Override
    public boolean execute(String action, CordovaArgs args, CallbackContext callbackContext) throws JSONException {
        if ("getOwnIDConfiguration".equals(action)) {
            callbackContext.success(ownIdConfig);
            return true;
        }
        return false;
    }
}