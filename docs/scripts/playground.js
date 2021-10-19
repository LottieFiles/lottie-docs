function lottie_setter(lottie_id, paths)
{
    var lottie_global = "lottie_json_" + lottie_id;
    var reload_function = "reload_lottie_" + lottie_id;
    var source = "";
    for ( var path of paths )
    {
        var resolved_path = lottie_global + "." + path;
        source += resolved_path + " = typeof " + resolved_path + " == 'number' ? Number(value) : value;"
    }
    source += reload_function + "();"

    return new Function("value", source);
}
