#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>

@interface AppDelegate : EXAppDelegateWrapper

@property (nonatomic, strong) NSString *deviceTokenString;

@property (nonatomic, assign) BOOL enterBackground;
+ (void)requestUMAuthorizationWithSuccess:(void (^)(BOOL result))successBlock fail:(void (^)(NSError *error))failBlock;

@end


