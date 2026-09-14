// Fixture: each line must trigger Cap 9 guard rules (code only, not comments).
@NativePlugin(name = "Fixture")
class Cap9PositiveAndroidFixture extends Plugin {

    void sample() {
        getConfigValue("key");
        call.hasOption("x");
        call.save();
        call.isSaved();
        call.isReleased();
        saveCall(call);
        freeSavedCall();
        getSavedCall();
        hasDefinedPermissions(new String[] { "a" });
        hasPermission("camera");
        pluginRequestPermission("camera", 1);
        pluginRequestPermissions(new String[] { "a" }, 1);
        pluginRequestAllPermissions();
        startActivityForResult(call, new Intent(), 99);
        bridge.startActivityForPluginWithResult(call, new Intent(), 99);
        CapConfig capConfig = new CapConfig(getContext().getAssets(), null);
        capConfig.getObject("plugins");
        new MessageHandler(bridge, webView, new Object());
        pathHandler.getResponseHeaders();
        int x = Bridge.CAPACITOR_HTTPS_INTERCEPTOR_START;
    }
}
