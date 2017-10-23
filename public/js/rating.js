var rating = -1;

/**
 Highlights the stars based on the rating `selectedStar` given
*/
function highlight(selectedStar) {
  // Clear star colours
  for (i = 0; i <= 4; i++) {
    for (j = 0; j <= 4; j++) {
      $('#' + i).removeClass('icon-' + j);
    }
  }

  // Set selected stars
  for (i = 0; i <= parseInt(selectedStar); i++) {
    $('#' + i).html('star');
    $('#' + i).addClass('icon-' + selectedStar);
  }

  // Clear unselected stars
  for (i = parseInt(selectedStar) + 1; i <= 4; i++) {
    $('#' + i).html('star_border');
  }
}

/**
 Gets the rating selected
*/
function getRating() {
  return rating + 1
}

/**
 Sets the rating
*/
function setRating(newRating) {
  rating = newRating - 1;
  highlight(rating);
}
