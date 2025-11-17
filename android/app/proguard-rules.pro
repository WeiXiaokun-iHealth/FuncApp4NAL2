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

# 保留 NAL2 库的所有类
-keep class au.org.nal.** { *; }
-keepclassmembers class au.org.nal.** { *; }
-keepnames class au.org.nal.** { *; }

# 特别保留 OutputResult 类
-keep class au.org.nal.OutputResult { *; }
-keepclassmembers class au.org.nal.OutputResult { *; }
-keepnames class au.org.nal.OutputResult { *; }

# 保留 NAL2 模块
-keep class com.nal2.** { *; }
-keepclassmembers class com.nal2.** { *; }

# 保护状态栏相关类
-keep class com.facebook.react.modules.statusbar.** { *; }
-keep class expo.modules.statusbar.** { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}

# 保护React Native核心模块
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

-keep class net.gotev.uploadservice.** { *; }

# 友盟
-keep class com.umeng.** {*;}

-keep class org.repackage.** {*;}

-keep class com.uyumao.** { *; }

-keepclassmembers class * {
   public <init> (org.json.JSONObject);
}

-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

-keep public class com.ihealthlabs.HearingAid.app.R$*{
public static final int *;
}
