function filter() {
    var tagsToInclude = $("#filter-form").serializeArray().map(function(item) {
        return item.name;
    });

    var all_projects = $(".project");
    var no_visible_projects_message = $("#no-visible-projects")

    all_projects.addClass("hidden-xs-up");
    no_visible_projects_message.addClass("hidden-xs-up");

    var visible_projects = all_projects.filter(function() {
        var projectTags = $(this).attr('data-tags').split("|"); // Get the project's tags

        // Check if the project has any of the chosen tags.
        return projectTags.some(function(value) {
            return tagsToInclude.indexOf(value) >= 0;
        });
    });
    
    // Unhide the matching projects.
    visible_projects.removeClass("hidden-xs-up");

    // Add the warning if there are no matching projects.
    if (visible_projects.length == 0) {
        no_visible_projects_message.removeClass("hidden-xs-up");
    }
}

$(document).ready(function () {

    $(".project-filter-checkbox").change(function() {
        filter();
    });

    $("#select-all").click(function() {
        $(".project-filter-checkbox").prop("checked", true);
        $(".project-filter-checkbox").first().change(); // Force an update.
    });

    
    $("#select-none").click(function() {
        $(".project-filter-checkbox").prop("checked", false);
        $(".project-filter-checkbox").first().change(); // Force an update.
    });
});
