$(document).ready(function() {
    $("*").fadeTo(0, 0.0);
    $("*").fadeTo(1500, 1.0);

    // $("#content").mouseenter(function() {
    //     $("#content").fadeTo(500, 0.0);
    // })
    // $("#content").mouseleave(function() {
    //     $("#content").fadeTo(500, 0.6);
    // })
    $("p").mouseenter(function() {
        $(this).animate({"font-size":"1.4em"}, 800);
    })
    $("p").mouseleave(function() {
        $(this).animate({"font-size":"1.2em"}, 800);
    })

    $("a").mouseenter(function() {
        $(this).animate({"font-size":"1.6em"}, 800);
    })
    $("a").mouseleave(function() {
        $(this).animate({"font-size":"1.2em"}, 800);
    })
});