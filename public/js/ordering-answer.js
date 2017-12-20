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

/*Initializes the movability of sort*/
$(function(){
    $('#sortable').sortable({
        revert:true,
        start: function(event,ui) {
            $('#icon1',ui.item).hide();
            $('#icon2',ui.item).show();
        },
        stop: function(event,ui) {
            $('#icon2',ui.item).hide();
            $('#icon1',ui.item).show();
        }
    });
});

/*Default value of question options*/
var orderAnswerCount = 4;
var addOrderingAnswer = function(){
    orderAnswerCount++;
    var inputdiv = "<div class='row'><li class='input-field col s10'><i class='material-icons prefix' id='icon1'>swap_vert</i><i class='material-icons prefix' id='icon2'>swap_vertical_circle</i><input class='validate' id='icon_prefix' type='text' name='orderItem{0}' placeholder='Enter Answer Here' required='required'></li><div class='input-field col s2'><a class='btn-floating btn-tiny waves-effect waves-light red' onclick='$(this).parent().parent().remove()'><i class='tiny material-icons'>close</i></a></div></div>";
    $('#sortable').append(inputdiv.format([orderAnswerCount]));
}
