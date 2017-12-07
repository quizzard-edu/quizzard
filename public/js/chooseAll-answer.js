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

var chooseAllMCAnswerCount = 4; // default number of options

/**
* Adds an option to the choose all that apply
*/
var addChooseAllMCAnswers = function(type){
    chooseAllMCAnswerCount++;
    var inputdiv = "<div class='row'><div class='input-field col s1'><input type='{1}' name='radbutton' value='option{0}' id='option{0}'><label for='option{0}'></label></div><div class='input-field col s10'><input class='form-control' type='text' name='option{0}' placeholder='Enter Answer Here' required='required'></div><div class='input-field col s1'><a class='btn-floating btn-tiny waves-effect waves-light red' onclick='$(this).parent().parent().remove()'><i class='tiny material-icons'>close</i></a></div></div>";
    $('#qAnswer > div.form-group.col.s12').append(inputdiv.format([chooseAllMCAnswerCount,type]));
}
