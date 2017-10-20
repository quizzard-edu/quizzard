var rating = -1;

/**
 Highlights the stars based on the rating `selectedStar` given
*/
function highlight(selectedStar) {
  for (i = 0; i <= parseInt(selectedStar); i++) {
    $('#' + i).html('star');
  }

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
