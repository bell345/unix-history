if (!window.jQuery) {
    throw new Error("[tblib/ui.js] jQuery has not been loaded");
} else if (!window.TBI) {
    throw new Error("[tblib/ui.js] base.js has not been loaded");
} else if (!TBI.Util) {
    throw new Error("[tblib/ui.js] util.js has not been loaded");
} else {

TBI.UI = {};

// Moves the navbar indicator to the specified element.
TBI.UI.navMoveTo = function (ind, el) {
    if ($(el).length < 1) return false;
    var inr = $(ind + " div"),
        loc = $(el).offset().left,
        off = $(ind).offset().left,
        wid = parseInt($(inr).css("width")),
        lim = parseInt(window.innerWidth - wid),
        alg = Math.bound(loc - off, 0, lim),
        cn = $(inr)[0].className;
    $(inr)[0].className = cn.replace(" focus", "");
    $(inr).css("left", alg + "px");
}
// A blanket function that handles the navbar indicator behaviour and dynamic navigation related content.
TBI.UI.checkNav = function (nav) {
    $(nav+">div:not(.nav-indicator)").off("mousemove");
    // When mouse is moving on the navbar, move the indicator its position.
    $(nav+">div:not(.nav-indicator)").mousemove(function (event) {
        var width = parseInt($(nav+" .nav-indicator div").css("width"));
        var half = width/2;
        var off = $(nav+" .nav-indicator").offset().left;
        var alg = event.clientX-half-off;
        var page = parseInt($("body").css("width"));
        if(alg<0)alg=0;
        else if(alg+off+width>page) alg=page-width-off;
        var cn = $(nav+" .nav-indicator div")[0].className;
        $(nav+" .nav-indicator div")[0].className = cn.search(" focus") != -1 ? cn : cn + " focus";
        $(nav+" .nav-indicator div").css("left", alg+"px");
    });
    // When leaving or creating the navbar, move the indicator to the current menu item after 500ms.
    $(nav).off("mouseleave");
    $(nav).mouseleave(function () {
        var timer = TBI.TimerDB["nav-curr"];
        if (!isNull(timer)) timer.clear();

        TBI.Timer(function () { TBI.UI.navMoveTo(nav + " .nav-indicator", "#curr"); }, 500, false);
    });
    if ($(nav).length > 0) {
        var timer = TBI.TimerDB["nav-curr"];
        if (!isNull(timer)) timer.clear();

        TBI.Timer(function () { TBI.UI.navMoveTo(nav + " .nav-indicator", "#curr"); }, 500, false);
    }
    // Handles the dynamic content.
    // TODO: Soon to be redone without gratuitous jQuery usage.
    if (!isNull(TBI.content)) for (var i=0;i<TBI.content.length;i++) {
        var item = TBI.content[i];
        if ($(".nav-"+item.id+" .inner-nav").length == 0) $(".nav-"+item.id).append("<ul class='inner-nav'></ul>");
        else $(".nav-"+item.id+" .inner-nav").empty();
        for (var j=0;j<TBI[item.name].length;j++) {
            var sect = TBI[item.name][j],
                text = "<li>";
            if (!isNull(sect.link)) text += "<a href='"+sect.link+"' class='external'></a>";
            text += "<a href='/"+item.path+"/#"+sect.id+"'>"+sect.name+"</a></li>";
            $(".nav-"+item.id+" .inner-nav").append(text);
        }
    }
    TBI.UI.updateUI();

    // Handles the indicator behaviour relating to inner navigation menus.
    var navItems = $(nav+" > div:not(.nav-indicator):not(.done)"); // gets array of unhandled items
    for (var i=0;i<navItems.length;i++) {
        var parent = navItems[i]; // the div containing the inner nav
        var child = parent.gecn("inner-nav")[0]; // the inner nav itself
        parent.className += " done"; // marks event handled-ness so you don't do it again and waste time
        if (!isNull(child)) { // if the parent has an inner nav
            $(child).off("mouseenter");
            $(child).mouseenter(function (nav, parent) { // when you move into the inner nav...
                return function () {
                    $(parent).off("mousemove"); // remove indicator mouse tracking (for the moment)
                    var moveFunc = function (nav, parent) {
                        return function () { TBI.UI.navMoveTo(nav+" .nav-indicator", parent); }; // move the indicator to the parent
                    }(nav, parent);
                    $(this).mousemove(moveFunc); // both when the mousemoves,
                    moveFunc(); // and straight away
                    TBI.UI.updateLinks(); // update behaviour for inner nav links
                }
            }(nav, parent));
            $(child).off("mouseleave");
            $(child).mouseleave(function (nav) { // when you leave the inner nav...
                return function () { TBI.UI.checkNav(nav); } // restore mouse tracking
            }(nav));
        }
    }
    /** Whether or not to show the "to top" menu item. */
    if (window.scrollY > 0) $(".nav-top").slideDown();
    else $(".nav-top").slideUp();
}
// Highlights the current navbar menu item.
TBI.UI.findPage = function (nav) {
    var curr = path[0];
    if (isNull(curr)) curr = "";
    var navdivs = nav+">div:not(.nav-indicator)";
    var navbar = $(navdivs);
    var links = $(navdivs+">a");
    for (var i = 0; i < links.length; i++) {
        if ($(links[i]).attr("href").split("/")[1] == curr) {
            $(navbar[i]).attr("id","curr");
            return true;
        }
    }
    $(".nav-home").attr("id","curr");
}

TBI.UI.updateUI = function () {
    var items = $("h2.item[id], h2.section[id]");
    if (items.length > 0 && $("#sidebar").length > 0) {
        if ($("#sidebar #sections").length == 0) {
            var header = document.createElement("h3");
            header.className = "span";
                var link = document.createElement("a");
                link.href = "javascript:void(0)";
                link.className = "up-down";
                link.setAttribute("for", "#sections");
                link.innerText = "Sections";
            header.appendChild(link);

            var list = document.createElement("ul");
            list.className = "side para";
            list.id = "sections";

            var sidebar = gebi("sidebar");
            sidebar.insertBefore(list, sidebar.firstChild);
            sidebar.insertBefore(header, sidebar.firstChild);
        } else $("#sidebar #sections").empty();

        for (var i=0;i<items.length;i++) {
            var sectionsList = $("#sidebar #sections")[0];
            var item = document.createElement("li");
                var link = document.createElement("a");
                link.href = location.origin + location.pathname + "#" + items[i].id;
                link.innerText = items[i].innerText;
            item.appendChild(link);
            sectionsList.appendChild(item);
        }
    }

    for (var i=0;i<$(".img-mid:not(.done)").length;i++) {
        var currimg = $(".img-mid:not(.done)")[i];
        currimg.id = generateUUID();
        currimg.getElementsByClassName("img-toggle")[0].setAttribute("for", "#" + currimg.id + " img");
        currimg.className += " done";
    }

    $("button.toggle:not(.done)").click(function (event) {
        if (event.button != 0) return true;
        $(this).toggleClass("on");
    });
    $("button.toggle:not(.done)").toggleClass("done", true);
    $(".up-down:not(.done)").click(function (event) {
        if (event.button != 0) return true;
        var toSwitch = $($(this).attr("for"));
        if (toSwitch.length > 0) toSwitch.slideToggle();
        $(this).toggleClass("on");
    });
    $(".up-down:not(.done)").toggleClass("done", true);
    var popups = $("*[data-popup-title]:not(.popup-done), *[data-popup-body]:not(.popup-done)");
    for (var i=0;i<popups.length;i++) {
        TBI.UI.HoverPopup.bindElement(popups[i],
            popups[i].attributes["data-popup-title"].value,
            popups[i].attributes["data-popup-body"].value);
    }
    popups.toggleClass("popup-done", true);
    for (var i=0;i<$("table.sortable:not(.done)").length;i++) {
        var curr = $("table.sortable:not(.done)")[i];

        // recording original table order
        var rows = curr.querySelectorAll("tbody tr");
        for (var j=0;j<rows.length;j++)
            if (rows[j].className.search(" torder") == -1) rows[j].className += " torder-"+j;

        var sortHeaders = curr.querySelectorAll("thead th.sort");
        $(sortHeaders).toggleClass("none", true);
        $(sortHeaders).click(function (table) {
            return function () {
                var upDownList = table.querySelectorAll("thead th.sort");
                var index = -1;
                // find current column index
                for (var i=0;i<upDownList.length;i++) {
                    if (upDownList[i] == this) index = i;
                    else upDownList[i].className = upDownList[i].className.replace(/( )*(up|down)/, "$1none");
                }

                var conditions = ["none", "up", "down"];
                if (index != -1) for (var i=0;i<conditions.length;i++) {
                    var condition = conditions[i];
                    if (this.className.search(condition) != -1) {
                        var futureCondition = conditions[(i + 1) % conditions.length];
                        // switch condition to next in line
                        $(this).toggleClass(condition, false);
                        $(this).toggleClass(futureCondition, true);
                        // according to current condition...
                        switch (futureCondition) {
                            // sort up
                            case "up": TBI.UI.sortTable(table, index, false); break;
                            // sort down
                            case "down": TBI.UI.sortTable(table, index, true); break;
                            // or restore original order
                            default: TBI.UI.sortTable(table, -1, false);
                        }
                        break;
                    }
                // if index is invalid, sort table anyway to restore order
            } else TBI.UI.sortTable(table, -1, false);
            }
        }(curr));
    }
    $("table.sortable:not(.done)").toggleClass("done", true);
}

TBI.UI.HoverPopup = function (x, y, title, body) {
    this.position = new Vector2D(x, y);
    var popDiv = document.createElement("div");
    popDiv.className = "popup";
    popDiv.style.top = this.position.x + 20;
    popDiv.style.left = this.position.y + 20;
        var popHead = document.createElement("h3");
        popHead.innerHTML = title;
    popDiv.appendChild(popHead);
        var popBody = document.createElement("div");
        popBody.className = "popup-body";
        popBody.innerHTML = body;
    popDiv.appendChild(popBody);

    $(".popup").remove();
    document.body.appendChild(popDiv);
    this.element = popDiv;

    Object.defineProperty(this, "title", {
        get: function () { return this.element.getn("h3")[0].innerHTML; },
        set: function (title) { this.element.getn("h3")[0].innerHTML = title; }
    });
    Object.defineProperty(this, "body", {
        get: function () { return this.element.gecn("popup-body")[0].innerHTML; },
        set: function (body) { this.element.gecn("popup-body")[0].innerHTML = body; }
    });
}
TBI.UI.HoverPopup.bindElement = function (element, title, body) {
    $(element).mousemove(function (title, body) {
        return function (event) {
            var popup = new TBI.UI.HoverPopup(event.clientX, event.clientY, title, body);
        }
    }(title, body));
    $(element).mouseleave(function () {
        $(".popup").remove();
    });
}
TBI.UI.HoverPopup.bindElements = function (elementArray, title, body) {
    for (var i=0;i<elementArray.length;i++)
        TBI.UI.HoverPopup.bindElement(elementArray[i], title, body);
}
// A predefined popup element that can be added to by using the same header.
// TODO: Make this better
TBI.notification = function (group, text, timeout) {
    var groupId = "note-group-"+group.toLowerCase(),
        noteGroup = $("#"+groupId),
        noteGroupList = $("#"+groupId+" li");
    if ($("#note-holder").length == 0) $("body").append("<div id='note-holder'><div id='note-holder-inner'></div></div>");
    if (noteGroup.length == 0) {
        var buttonText = "<button onclick='$(this).parent().remove()'>Dismiss</button>";
        $("#note-holder-inner").append("<div class='note' id='"+groupId+"'><h3>"+group+"</h3><ul></ul>"+buttonText+"</div>");
    }
    if (noteGroupList.length > 0) {
        var el = noteGroupList[noteGroupList.length-1];
        if (el.innerHTML == text) {
            if (isNull(el.dataset.instances)) el.dataset.instances = 1;
            el.dataset.instances++;
        } else $("#"+groupId+" ul").append("<li>"+text+"</li>");
    } else $("#"+groupId+" ul").append("<li>"+text+"</li>");
    TBI.timerClear("noteRemove-"+group.toLowerCase());
    var nRemoveTotal = 0;
    TBI.timerSet("noteRemove-"+group.toLowerCase(), 10, function () {
        if (nRemoveTotal > timeout) {
            $("#"+groupId).remove();
            TBI.timerClear("noteRemove-"+group.toLowerCase());
        } else nRemoveTotal += 10;
    });
}
// Changes the specified toggleable element either according to the boolean value passed to it, or simply toggles it.
TBI.UI.toggleButton = function (element, bool) {
    if (!isNull(element[0]) && element[0] instanceof HTMLElement) element = element[0];
    if (!element instanceof HTMLElement) return null;
    else if (!isNull(element.checked)) return element.checked = isNull(bool)?!element.checked:bool;
    var isToggled = TBI.UI.isToggled(element);
    if (!isToggled && bool !== false) { element.className += " on"; }
    else if (isToggled && bool !== true) { element.className = element.className.replace(" on",""); }
    if (!isNull(bool) && bool !== isToggled || isNull(bool)) $(element).click();
    return TBI.UI.isToggled(element);
}
// Returns whether or not a specified toggleable element is toggled or not.
TBI.UI.isToggled = function (element) { return isNull(element.checked)?element.className.search(" on") != -1:element.checked; }
TBI.UI.getRadioInput = function (name) {
    var inputs = document.querySelectorAll("input[type='radio'][name='"+name+"']");
    for (var i=0;i<inputs.length;i++)
        if (inputs[i].checked) return inputs[i].value;
    return null;
}
// Sorts a specific table element according to the column and direction specified.
TBI.UI.sortTable = function (table, colIndex, direction) {
    if (!(table instanceof HTMLTableElement)) return null; // checks if the table is an element
    var records = table.querySelectorAll("tbody tr"), // all the rows in the table body
        refs = {}, // references to the rows using the text content as the key and the row number as the value
        fields = [], // an array of the text content inside of the specified column of the table (that can be sorted)
        numbers = true; // whether or not to use the custom number-focused sort() algorithm or use the inbuilt .sort() for text values
    if (colIndex != -1) for (var i=0;i<records.length;i++) { // this loop checks whether or not the table uses all numerical values
        var list = records[i].querySelectorAll("td");
        var item = list[colIndex].innerText;
        if (numbers && isNaN(parseFloat(item))) numbers = false;
    }
    for (var i=0;i<records.length;i++) { // this loop places the items into the fields array and adds the row reference to refs
        var list = records[i].querySelectorAll("td");
        if (colIndex != -1) {
            var item = list[colIndex].innerText.toLowerCase();
            if (numbers) item = parseFloat(item);
        } else var item = parseFloat(records[i].className.match(/ torder-[0-9]+/)[0].match(/[0-9]+/)[0]);
        fields.push(item);
        refs[item] = i;
    }
    if (numbers) fields = sort(fields); // sorting algorithms
    else fields.sort();
    if (direction) fields.reverse(); // whether or not to reverse the order
    $(table.getElementsByTagName("tbody")[0]).empty(); // empty the table body (too bad if anything other than <tr>s are inside of it)
    for (var i=0;i<fields.length;i++) table.getElementsByTagName("tbody")[0].appendChild(records[refs[fields[i]]]);
    // and add in the rows in the right order
}
// Generates a desktop notification outside of the regular environment.
TBI.UI.Note = function (img, title, desc, link) {
    if (isNull(window.Notification)) return null;
    var note = {title:title,body:desc,icon:img,lang:"en"};
    if (!isNull(link))
        note.onclick = function () {
            window.open(link);
            note.close();
        }
    new Notification(title, note);
}

// Designates outgoing links.
TBI.UI.updateLinks = function () {
    for (var i = 0; i < $("a[href]").length; i++) {
        if ($("a[href]:nth("+i+")").attr("href").search(/((http|https|mailto|news):|\/\/)/) == 0) {
            $("a[href]:nth("+i+")").attr("target", "_blank");
            if ($("a[href]:nth("+i+")")[0].className.search(" external") == -1)
                $("a[href]:nth("+i+")")[0].className += " external";
        }
    }
    $("#top a").click(function () {
        var url = new URL(this.href),
            hash = url.hash;
        if (path.isEqual(url.pathname.split('/')) && !isNull(hash) && !isNull($(hash))) {
            $(document).scrollTop(parseInt($(hash).offset().top - 64));
            return false;
        }
    });
}

}
