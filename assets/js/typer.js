var Typer = {};

Typer.type = function (element, text, duration, onCompletion) {
    if (onCompletion == undefined) onCompletion = function () { };
    setTimeout(function (text) { return function () {
        element.innerHTML += text[0];

        if (text.length != 1)
            Typer.type(element, text.substring(1, text.length), duration, onCompletion);
        else onCompletion(element);

    }; }(text), Math.random()*duration);
}
