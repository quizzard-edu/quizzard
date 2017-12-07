/*
Copyright (C) 2016
Developed at University of Toronto

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var rating = -1;

/**
 Highlights the stars based on the rating `selectedStar` given
*/
function highlight(selectedStar) {
  // Clear star colours
  for (i = 0; i <= 4; i++) {
    for (j = 0; j <= 4; j++) {
      $('#rate' + i).removeClass('icon-' + j);
    }
  }

  // Set selected stars
  for (i = 0; i <= parseInt(selectedStar); i++) {
    $('#rate' + i).html('star');
    $('#rate' + i).addClass('icon-' + selectedStar);
  }

  // Clear unselected stars
  for (i = parseInt(selectedStar) + 1; i <= 4; i++) {
    $('#rate' + i).html('star_border');
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
