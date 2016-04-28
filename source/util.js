function copyAttributesToObject(attributes, object) {
    // this removes functions and leaves us with only serializable types
    // which is what we care about
    var attrs = JSON.parse(JSON.stringify(attributes));

    for (var key in attrs) {
        object[key] = attrs[key];
    }
}
