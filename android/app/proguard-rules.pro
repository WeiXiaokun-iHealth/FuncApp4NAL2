# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# Keep HttpServerModule and related classes
-keep class com.funcapp4nal2.HttpServerModule { *; }
-keep class com.funcapp4nal2.HttpServerPackage { *; }
-keepclassmembers class com.funcapp4nal2.HttpServerModule {
    public *;
}

# Keep NAL2 module
-keep class com.nal2.** { *; }

# Keep network-related classes for IP detection
-keep class android.net.wifi.** { *; }
-keep class java.net.** { *; }
