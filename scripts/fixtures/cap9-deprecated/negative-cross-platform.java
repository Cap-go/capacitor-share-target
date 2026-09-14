// Android file must not trip iOS-only bridge rules.
class Cap9NegativeCrossPlatformJava {

    void ok() {
        getConfig().getString("ok");
    }
}
