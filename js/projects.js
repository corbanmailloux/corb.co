function filter() {
    var tagsToInclude = $("#filter-form").serializeArray().map(function(item) {
        return item.name;
    });

    var all_projects = $(".project");

    // all_projects.hide();
    all_projects.addClass("hidden-xs-up");

    all_projects.filter(function() {
        var projectTags = $(this).attr('data-tags').split("|"); // Get the project's tags

        // Check if the project has any of the chosen tags.
        return projectTags.some(function(value) {
            return tagsToInclude.indexOf(value) >= 0;
        });
    }).removeClass("hidden-xs-up");
}

$(document).ready(function () {

    $(":checkbox").change(function() {
        filter();
    });

    $("#select-all").click(function() {
        $(":checkbox").prop("checked", true);
        $(":checkbox").first().change(); // Force an update.
    });

    
    $("#select-none").click(function() {
        $(":checkbox").prop("checked", false);
        $(":checkbox").first().change(); // Force an update.
    });
});
