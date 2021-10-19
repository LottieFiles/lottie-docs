function lottie_setter(lottie_id, paths)
{
    var lottie_global = "lottie_json_" + lottie_id;
    var reload_function = "reload_lottie_" + lottie_id;
    var source = "";
    for ( var item of paths )
    {
        var path = item;
        var operator = '';
        var bang = path.indexOf("!");
        if ( bang != -1 )
        {
            path = item.substr(0, bang);
            operator = item.substr(bang+1);
        }
        var resolved_path = lottie_global + "." + path;
        source += resolved_path + " = (typeof " + resolved_path + " == 'number' ? Number(value) : value)" + operator + ";\n"
    }
    source += reload_function + "();"

    return new Function("value", source);
}
