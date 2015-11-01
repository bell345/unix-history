function addScripts(srcs, onload) {
    var currSrc = srcs.splice(0, 1)[0];

    var onloadFunc = (srcs.length == 0 ? onload : function (srcs, onload) { return function () {
        addScripts(srcs, onload);
    }; }(srcs, onload))

    addScript(currSrc, onloadFunc);
}

function addScript(src, onload) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    script.setAttribute("async", true);
    if (onload) script.onload = onload;
    document.head.appendChild(script);
}

$(function () {
    // TODO: debugging, please comment out in production
    //localStorage.removeItem("seen-intro");

    if (localStorage.getItem("seen-intro") == null) {
        $("body").toggleClass("intro", true);
        localStorage.setItem("seen-intro", "true");
    }

    var pathname = location.pathname.replace("unix-history/", "").replace(/^\/|\/$/g, "");
    if (pathname != "")
        $("header")[0].setAttribute("data-directory", pathname);

    Typer.type($("header")[0], "unix --history", 200, function (el) { $("body").toggleClass("intro", false); });

    var scrBase = "assets/js/tblib/";

    addScripts([scrBase + "base.js", scrBase + "util.js", scrBase + "loader.js", scrBase + "net.js"], function () {
        loader.start();
        loader.addTask(executeHTMLIncludes("assets/data/includes.json"), null, "HTMLIncludes");
    });

    // parse <dfn>s
    var dfns = $("dfn");
    for (var i=0;i<dfns.length;i++) {
        var currDef = dfns[i];
        var term = currDef.innerHTML;
        // removes all child elements of currDef
        while (currDef.firstChild) {
            currDef.removeChild(currDef.firstChild);
        }

        var link = document.createElement("a");
        link.innerHTML = term;
        if (currDef.title != undefined && currDef.title != "") term = currDef.title;
        link.href = "glossary#" + encodeURIComponent(term.replace(/[ ]/g, "-")).toLowerCase();
        currDef.appendChild(link);
    }
});
