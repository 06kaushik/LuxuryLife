#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>          // Firebase
#import <GoogleMaps/GoogleMaps.h>  // Google Maps

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSLog(@"AppDelegate running, FIRApp configure called");

  // ✅ Initialize Firebase
  [FIRApp configure];

  // ✅ Provide Google Maps API key from Info.plist
  NSString *apiKey = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"GMSApiKey"];
  if (apiKey && apiKey.length > 0) {
    [GMSServices provideAPIKey:apiKey];
    NSLog(@"Google Maps API key provided.");
  } else {
    NSLog(@"❗️Google Maps API key is missing in Info.plist");
  }

  self.moduleName = @"Luxury_Life";
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
