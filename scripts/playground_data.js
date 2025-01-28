function playground_set_data(data)
{
    localStorage.setItem("playground-open", JSON.stringify(data, undefined, 4));
}

function playground_set_url(url)
{
    localStorage.setItem("playground-open", url);
}

function playground_get_data()
{
    var data = localStorage.getItem("playground-open");
    localStorage.removeItem("playground-open");
    if ( data )
        return data;
    return null;
}
