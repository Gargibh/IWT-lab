// Wait until the page is ready
$(document).ready(function () {

  var API_URL = "https://openlibrary.org/search.json?q=fiction&limit=10";

  $("#load-books").on("click", function () {

    // 1. Reset the page before the new request
    $("#book-list").empty();
    $("#error").hide();
    $("#empty").hide();

    // 2. Show the loading state
    $("#loading").show();
    $("#load-books").prop("disabled", true);

    // 3. Send the AJAX GET request
    $.ajax({
      url: API_URL,
      method: "GET",
      dataType: "json",

      // Runs when the server replies successfully
      success: function (response) {
        var books = response.docs;

        // No books found
        if (!books || books.length === 0) {
          $("#empty").show();
          return;
        }

        // Loop through each book
        $.each(books, function (index, book) {

          // Title (fallback if missing)
          var title = book.title || "Untitled";

          // Authors (array -> comma-separated text)
          var authors = "Author unknown";
          if (book.author_name && book.author_name.length > 0) {
            authors = book.author_name.join(", ");
          }

          // Year (only shown if available)
          var year = book.first_publish_year;

          // Build the list item safely with .text()
          var $item = $("<li></li>");
          $item.append($("<span class='book-title'></span>").text(title));
          $item.append($("<span class='book-meta'></span>").text("By " + authors));

          if (year) {
            $item.append($("<span class='book-meta'></span>").text("First published: " + year));
          }

          $("#book-list").append($item);
        });
      },

      // Runs if the request fails (no internet, server error, etc.)
      error: function () {
        $("#error").text("Sorry, the books could not be loaded. Please check your connection and try again.").show();
      },

      // Runs after success OR error: reset the loading state
      complete: function () {
        $("#loading").hide();
        $("#load-books").prop("disabled", false);
      }
    });
  });
});
