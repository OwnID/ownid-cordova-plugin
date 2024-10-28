## OwnID Apache Cordova Plugin

The [OwnID](https://ownid.com) Apache Cordova Plugin is a plugin for [Apache Cordova](https://cordova.apache.org) that integrates native [OwnID Android SDK](https://github.com/OwnID/ownid-android-sdk) and [OwnID iOS SDK](https://github.com/OwnID/ownid-ios-sdk) functionality into Cordova applications.

It enables seamless user authentication using OwnID by automatically attaching the OwnID WebView Bridge to the Cordova WebView.

For platform specific documentaion please check [OwnID Android SDK](https://github.com/OwnID/ownid-android-sdk) and [OwnID iOS SDK](https://github.com/OwnID/ownid-ios-sdk).

Requirements:
 - Cordova platform version 12.x or higher for Android.
 - Cordova platform version 7.x or higher for iOS.

To add OwnID Apache Cordova Plugin to your project, run the following command:

```
cordova plugin add @ownid/cordova-plugin
```

### Configuration

After installing the plugin, update `config.xml` with the OwnID configuration.

Set OwnID application id `ownid-appId`, environment (optional) `ownid-env` and native logging (optional) `ownid-enableLogging`:

```xml
<widget>
   <preference name="ownid-appId" value="gephhajfhdefa" /> <!--Use your OwnID application id-->
   <preference name="ownid-env" value="uat" />              <!--(optional) skip for production environment-->
   <preference name="ownid-enableLogging" value="true" />   <!--(optional) skip for production environment-->
</widget>
```

Ensure that you set schema and hostname:

```xml
<widget>
   <preference name="scheme" value="cordova" />
   <preference name="hostname" value="localhost" />
</widget>
``` 

#### Android Settings

If you are using Cordova Android version 12.x, please follow these steps:

1. Set the Target SDK Version

   Ensure that your target SDK version is set to at least 34:
   ```
   <widget>
     <preference name="android-targetSdkVersion" value="34" />
   </widget>
   ```

2. Configure Android Gradle Plugin and Gradle

   a. Upgrade to Android Gradle Plugin ≥ 8.1.0 and Gradle ≥ 8.0

      Update your project to use Android Gradle Plugin version 8.1.0 or higher, and Gradle version 8.0 or higher:
      ```
      <widget>
         <preference name="AndroidGradlePluginVersion" value="8.1.0" />
         <preference name="GradleVersion" value="8.0" />
      </widget>
      ```

   b. Workaround if You Cannot Upgrade
      
      If you cannot upgrade to Android Gradle Plugin, you can use a workaround to address this [bug](https://r8-review.googlesource.com/c/r8/+/79240) by adding a hook that sets the R8 dependency to `com.android.tools:r8:8.1.56`:

      * **Copy the Hook Script**

        Copy the `android_hook_r8.js` file with the hook script into your project. You can find it in `demo/android_hook_r8.js`.

      * **Reference the Hook in `config.xml`**

        Add the following to your `config.xml` to reference the hook script:
         ```
         <widget>
            <platform name="android">
               <hook type="after_prepare" src="android_hook_r8.js" />
            </platform>
         </widget>
         ``` 

#### iOS Specific Settings

The iOS platform-specific settings include preferences for iOS and Swift versions, as well as configuration for associated domains - necessary steps for enabling Passkey authentication. To learn more, see [Enable Passkey Authentication](https://github.com/OwnID/ownid-ios-sdk/blob/master/Docs/sdk-custom-integration.md#enable-passkey-authentication).

Update your `config.xml` with following:

```xml
<platform name="ios">
   <!-- Set the minimum iOS and swift version required for the app and OwnID SDK -->
   <preference name="deployment-target" value="14.0" /> 
   <preference name="pods_ios_min_version" value="14.0" />
   <preference name="SwiftVersion" value="5.0" />

   <config-file parent="com.apple.developer.associated-domains" target="OwnIDCordovaPluginDemo/Entitlements-Debug.plist">
      <array>
         <!-- Set your associated domain -->
         <string>webcredentials:your.domain.com</string>
      </array>
   </config-file>
   <config-file parent="com.apple.developer.associated-domains" target="OwnIDCordovaPluginDemo/Entitlements-Release.plist">
      <array>
         <!-- Set your associated domain -->
         <string>webcredentials:your.domain.com</string>
      </array>
   </config-file>
</platform>
``` 

## Web Integration

Integration with a Cordova app follows the same process as for regular web applications. For detailed steps, refer to our [integration guide](https://docs.ownid.com/building-blocks/get-started).

Note: You can skip the "Reference the OwnID SDK" section, as plugin includes it by default.

## License

```
Copyright 2024 OwnID INC.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
