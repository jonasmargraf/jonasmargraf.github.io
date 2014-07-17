$(document).ready(function() {
    $("h2").mouseenter(function() {
        $("h2").animate({"font-size":"4em"}, 1500);
    })
    $("h2").mouseleave(function() {
        $("h2").animate({"font-size":"2em"}, 1500);
    })
});