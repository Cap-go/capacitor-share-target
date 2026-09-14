// getConfigValue("ignored-in-line-comment")
/* block getConfigValue("ignored") */
let migration = "getConfigValue(\"ignored-in-string\")"
let note = 'hasOption("also-ignored")'

func cap9NegativeMaskedSwift() {
    let _ = getConfig().getString("ok")
    let _ = "\(getConfig().getString(\"ok\"))"
}
