// getConfigValue("ignored-in-line-comment");
/* getConfigValue("ignored-in-block"); */
class Cap9NegativeMaskedJava {

    void ok() {
        String doc = "getConfigValue(\"ignored-in-string\")";
        String doc2 = "call.hasOption(\"ignored\")";
        getConfig().getString("ok");
    }
}
