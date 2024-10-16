import Foundation
import WebKit
import OwnIDCoreSDK

@objc(OwnIDCordovaPlugin) class OwnIDCordovaPlugin: CDVPlugin {
    private let webBridge = OwnID.CoreSDK.createWebViewBridge()
    private var ownIDConfig = [String: Any]()
    
    override func pluginInitialize() {
        super.pluginInitialize()
        
        let settings = commandDelegate.settings
        
        ownIDConfig["appId"] = settings?["ownid-appid"]
        ownIDConfig["env"] = settings?["ownid-env"]
        ownIDConfig["enableLogging"] = (settings?["ownid-enablelogging"] as? String) == "true" ? true : false
        
        if let isLoggingEnabled = settings?["ownid-enablelogging"] as? String {
            if isLoggingEnabled.lowercased() == "true" {
                OwnID.CoreSDK.logger.isEnabled = true
            } else {
                OwnID.CoreSDK.logger.isEnabled = false
            }
            
        }
        if let appId = settings?["ownid-appid"] as? String {
            let environment = settings?["ownid-env"] as? String
            
            OwnID.CoreSDK.configure(appID: appId,
                                    userFacingSDK: Self.info(),
                                    environment: environment)
        }

        if let webView = webView as? WKWebView {
            var allowedOrigins: Set<String> = []
            if let viewController = viewController as? CDVViewController, let allowedOrigin = allowedOrigin(viewController: viewController) {
                allowedOrigins.insert(allowedOrigin)
            }
            
            webBridge.injectInto(webView: webView, allowedOriginRules: allowedOrigins)
        }
    }
    
    @objc(getOwnIDConfiguration:)
    func getOwnIDConfiguration(command: CDVInvokedUrlCommand) {
        let pluginResult: CDVPluginResult
        
        if !ownIDConfig.isEmpty {
            pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: ownIDConfig)
        } else {
            pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: "Configuration was null")
        }
        
        commandDelegate.send(pluginResult, callbackId: command.callbackId)
    }
    
    private func allowedOrigin(viewController: CDVViewController) -> String? {
        let settings = commandDelegate.settings
        var scheme = settings?["scheme"] as? String
        var hostname = ""
        
        let cdvIsFileScheme = (scheme == "file" || scheme == nil)
        
        if !cdvIsFileScheme {
            if scheme == nil || WKWebView.handlesURLScheme(scheme!) {
                scheme = "app"
            }
            
            hostname = (settings?["hostname"] as? String) ?? "localhost"
            
            return "\(scheme!)://\(hostname)"
        }
        
        return appURL(viewController: viewController)?.absoluteString
    }
    
    private func appURL(viewController: CDVViewController) -> URL? {
        var appURL: URL? = nil

        let startPage = viewController.startPage
        let wwwFolderName = viewController.wwwFolderName
        if startPage.contains("://") {
            appURL = URL(string: startPage)
        } else if wwwFolderName.contains("://") {
            appURL = URL(string: "\(wwwFolderName)/\(startPage)")
        } else if wwwFolderName.contains(".bundle") {
            if let bundle = Bundle(path: wwwFolderName) {
                appURL = bundle.url(forResource: startPage, withExtension: nil)
            }
        } else if wwwFolderName.contains(".framework") {
            if let bundle = Bundle(path: wwwFolderName) {
                appURL = bundle.url(forResource: startPage, withExtension: nil)
            }
        } else {
            if let startURL = URL(string: startPage),
               let startFilePath = commandDelegate.path(forResource: startURL.path) {
                appURL = URL(fileURLWithPath: startFilePath)
                
                let startPageNoParentDirs = startPage
                if let range = startPageNoParentDirs.rangeOfCharacter(from: CharacterSet(charactersIn: "?#")) {
                    let queryAndOrFragment = String(startPageNoParentDirs[range.lowerBound...])
                    appURL = URL(string: queryAndOrFragment, relativeTo: appURL)
                }
            }
        }

        return appURL
    }

    private static func info() -> OwnID.CoreSDK.SDKInformation {
        ("OwnIDCordovaPlugin", "3.5.1")
    }
}
