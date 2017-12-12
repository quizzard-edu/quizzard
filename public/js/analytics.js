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

var students;
var studentList;
var isAdmin;

$(function () {
  $('#nav-analytics').addClass('active');

  $.ajax({
    type: 'GET',
    async: false,
    url: '/isAdmin',
    success: function (data) {
      isAdmin = true;
    },
    error: function (data) {
      isAdmin = false;
    }
  });

  // Loads the Student statistics by default
  if (isAdmin) {
    $('#class-analytics-card').removeClass('hidden');
    displayClassStatistics();
  } else {
    $('#student-analytics-card').removeClass('hidden');
    $('#student-analytics-data-cards').removeClass('hidden');
    if (!isAdmin) {
      displayStudentStatistics(null);
    }
  }

  // Loads the list of students so that the instructor can select one
  getStudentList();
  studentList = {};
  for (var s in students) {
    studentList[students[s]] = null;
  }

  initAutoComplete();
});

/**
 * init autocomplete
 */
var initAutoComplete = function () {
  // Setting up the autocomplete search for the student IDs
  $('#autocomplete-input').autocomplete({
    data: studentList,
    limit: 20,
    onAutocomplete: function (val) {
      $('#student-analytics-data-cards').removeClass('hidden');
      displayStudentStatistics(val.split(' ')[0]);
    },
    minLength: 1,
  });

  // Showing the analytics automatically
  $('#autocomplete-input').keyup(function () {
    const autocompleteValue = $('#autocomplete-input').val();

    for (var s in studentList) {
      if (s.split(' ')[0].toLowerCase() === autocompleteValue.split(' ')[0].toLowerCase()) {
        $('#student-analytics-data-cards').removeClass('hidden');
        displayStudentStatistics(autocompleteValue.split(' ')[0]);
        return;
      }
    }

    $('#student-analytics-data-cards').addClass('hidden');
  });

  const autocompleteValue = $('#autocomplete-input').val();

  for (var s in studentList) {
    if (s.split(' ')[0].toLowerCase() === autocompleteValue.split(' ')[0].toLowerCase()) {
      $('#student-analytics-data-cards').removeClass('hidden');
      displayStudentStatistics(autocompleteValue.split(' ')[0]);
      return;
    }
  }

  $('#student-analytics-data-cards').addClass('hidden');
}

/**
* Gets the list of student IDs
*/
var getStudentList = function () {
  $.ajax({
    type: 'GET',
    async: false,
    url: '/studentsListofIdsNames',
    success: function (data) {
      students = data;
    },
    error: function (data) {
      students = ['Error'];
    }
  });
}

/**
* Switching to class statistics tab
*/
$('#option-class').click(function (evt) {
  $('#student-analytics-card').addClass('hidden');
  $('#class-analytics-card').removeClass('hidden');

  displayClassStatistics();
});

/**
* Switching to student statistics tab
*/
$('#option-student').click(function (evt) {
  $('#student-analytics-card').removeClass('hidden');
  $('#class-analytics-card').addClass('hidden');

  initAutoComplete();
});

/**
* Class statistics
* Sets up the card visibility
* Calls requested charts to update
*/
var displayClassStatistics = function () {
  var path = '/adminAnalytics';

  // Class Statistics
  getClassAnswered(path);
  getClassAccuracy(path);
  getClassPoints(path);
  getClassPointsPerAttempt(path);
  getClassOverall(path);

  getClassAnsweredOverTime(path);
  getClassPointsPerAttemptOverTime(path);
  getClassOverallOverTime(path);
  getClassAccuracyOverTime(path);
  getClassPointsOverTime(path);

  getClassPointsPerTopicVsClass(path);
  getClassAccuracyPerTopicVsClass(path);
  getClassRatingPerTopicVsClass(path);
  getClassPointsPerTypeVsClass(path);
  getClassAccuracyPerTypeVsClass(path);
  getClassRatingPerTypeVsClass(path);
}

/**
* Student statistics
* Sets up the card visibility
* Calls requested charts to update
*/
var displayStudentStatistics = function (studentId) {
  var path = studentId ? '/studentAnalytics?studentId=' + studentId : '/studentAnalytics';

  // questions answered analytics
  getQuestionsAnsweredStudentAndClass(path);
  getCorrectAttemptsOverTime(path);
  getCorrectAttemptRankOverTime(path);

  // accuracy analytics
  getAccuracyStudentAndClass(path);
  getAccuracyOverTime(path);
  getAccuracyRankOverTime(path);

  // points analytics
  getPointsStudentAndClass(path);
  getPointsOverTime(path);
  getPointsRankOverTime(path);

  // overall score analytics
  getOverallVsClass(path);
  getOverallOverTime(path);
  getOverallRankOverTime(path);

  // points per attempt analytics
  getPointsPerAttemptVsClass(path);
  getPointsPerAttemptsOverTime(path);
  getPointsPerAttemptRankOverTime(path);

  // by topic analytics
  getPointsPerTopicVsClass(path);
  getAccuracyPerTopicVsClass(path);

  // by type analytics
  getPointsPerTypeVsClass(path);
  getAccuracyPerTypeVsClass(path);
}

// questions answered analytics

var getQuestionsAnsweredStudentAndClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'QuestionsAnsweredVsClass'
    },
    success: function (data) {
      $('#studentAnswered').html(data[0]);
      $('#classAnswered').html(data[1]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#studentAnswered').html('No Data');
        $('#classAnswered').html('No Data');
      }
    }
  });
}

var getCorrectAttemptsOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'correctAttemptsOverTime'
    },
    success: function (data) {
      data.id = '#correctAttemptsOverTime';
      data.col = colours.cyan;
      data.colLight = colours.cyanLight;
      data.colBack = colours.cyanLightO;
      createLineChart(data);
      createTable('#correctAttemptsOverTimeTable', ['Date', 'Me', 'Class'], [data.dates, data.studentData, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#correctAttemptsOverTime');
      }
    }
  });
}

var getCorrectAttemptRankOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'correctAttemptRankOverTime'
    },
    success: function (data) {
      data.id = '#correctAttemptRankOverTime';
      data.col = colours.cyan;
      data.colLight = colours.cyanLight;
      data.colBack = colours.cyanLightO;
      createRankChart(data);
      createTable('#correctAttemptRankOverTimeTable', ['Date', 'Me'], [data.dates, data.studentData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#correctAttemptRankOverTime');
      }
    }
  });
}

// accuracy analytics

var getAccuracyStudentAndClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'AccuracyVsClass'
    },
    success: function (data) {
      $('#studentAccuracy').html(`${data[0]}%`);
      $('#classAccuracy').html(`${data[1]}%`);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#studentAccuracy').html('No Data');
        $('#classAccuracy').html('No Data');
      }
    }
  });
}

var getAccuracyOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'accuracyOverTime'
    },
    success: function (data) {
      data.id = '#accuracyOverTime';
      data.col = colours.teal;
      data.colLight = colours.tealLight;
      data.colBack = colours.tealLightO;
      createLineChart(data);
      createTable('#accuracyOverTimeTable', ['Date', 'Me', 'Class'], [data.dates, data.studentData, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#accuracyOverTime');
      }
    }
  });
}

var getAccuracyRankOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'accuracyRankOverTime'
    },
    success: function (data) {
      data.id = '#accuracyRankOverTime';
      data.col = colours.teal;
      data.colLight = colours.tealLight;
      data.colBack = colours.tealLightO;
      createRankChart(data);
      createTable('#accuracyRankOverTimeTable', ['Date', 'Me'], [data.dates, data.studentData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#accuracyRankOverTime');
      }
    }
  });
}

// points analytics

var getPointsStudentAndClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'PointsVsClass'
    },
    success: function (data) {
      $('#studentPoints').html(data[0]);
      $('#classPoints').html(data[1]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#studentPoints').html('No Data');
        $('#classPoints').html('No Data');
      }
    }
  });
}

var getPointsOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'pointsOverTime'
    },
    success: function (data) {
      data.id = '#pointsOverTime';
      data.col = colours.orange;
      data.colLight = colours.orangeLight;
      data.colBack = colours.orangeLightO;
      createLineChart(data);
      createTable('#pointsOverTimeTable', ['Date', 'Me', 'Class'], [data.dates, data.studentData, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#pointsOverTime');
      }
    }
  });
}

var getPointsRankOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'pointsRankOverTime'
    },
    success: function (data) {
      data.id = '#pointsRankOverTime';
      data.col = colours.orange;
      data.colLight = colours.orangeLight;
      data.colBack = colours.orangeLightO;
      createRankChart(data);
      createTable('#pointsRankOverTimeTable', ['Date', 'Me'], [data.dates, data.studentData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#pointsRankOverTime');
      }
    }
  });
}

// overall score analytics

var getOverallVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'overallVsClass'
    },
    success: function (data) {
      $('#studentOverall').html(data[0]);
      $('#classOverall').html(data[1]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#studentOverall').html('No Data');
        $('#classOverall').html('No Data');
      }
    }
  });
}

var getOverallOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'overallOverTime'
    },
    success: function (data) {
      data.id = '#overallOverTime';
      data.col = colours.lime;
      data.colLight = colours.limeLight;
      data.colBack = colours.limeLightO;
      createLineChart(data);
      createTable('#overallOverTimeTable', ['Date', 'Me', 'Class'], [data.dates, data.studentData, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#overallOverTime');
      }
    }
  });
}

var getOverallRankOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'overallRankOverTime'
    },
    success: function (data) {
      data.id = '#overallRankOverTime';
      data.col = colours.lime;
      data.colLight = colours.limeLight;
      data.colBack = colours.limeLightO;
      createRankChart(data);
      createTable('#overallRankOverTimeTable', ['Date', 'Me'], [data.dates, data.studentData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#overallRankOverTime');
      }
    }
  });
}

// points per attempt analytics

var getPointsPerAttemptVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'pointsPerAttemptVsClass'
    },
    success: function (data) {
      $('#studentperAttempt').html(data[0]);
      $('#classPerAttempt').html(data[1]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#studentperAttempt').html('No Data');
        $('#classPerAttempt').html('No Data');
      }
    }
  });
}

var getPointsPerAttemptsOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'pointsPerAttemptsOverTime'
    },
    success: function (data) {
      data.id = '#pointsPerAttemptsOverTime';
      data.col = colours.purple;
      data.colLight = colours.purpleLight;
      data.colBack = colours.purpleLightO;
      createLineChart(data);
      createTable('#pointsPerAttemptsOverTimeTable', ['Date', 'Me', 'Class'], [data.dates, data.studentData, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#pointsPerAttemptsOverTime');
      }
    }
  });
}

var getPointsPerAttemptRankOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'attemptRankOverTime'
    },
    success: function (data) {
      data.id = '#pointsPerAttemptRankOverTime';
      data.col = colours.purple;
      data.colLight = colours.purpleLight;
      data.colBack = colours.purpleLightO;
      createRankChart(data);
      createTable('#pointsPerAttemptRankOverTimeTable', ['Date', 'Me'], [data.dates, data.studentData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#pointsPerAttemptRankOverTime');
      }
    }
  });
}

// by topic analytics


var getPointsPerTopicVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'pointsPerTopicVsClass'
    },
    success: function (data) {
      data.id = '#pointsPerTopicVsClass';
      createRadarChart(data);
      createTable('#pointsPerTopicVsClassTable', ['Topic', 'Me', 'Class'], [data.labels, data.studentData, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#pointsPerTopicVsClass');
      }
    }
  });
}

var getAccuracyPerTopicVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'accuracyPerTopicVsClass'
    },
    success: function (data) {
      data.id = '#accuracyPerTopicVsClass';
      createRadarChart(data);
      createTable('#accuracyPerTopicVsClassTable', ['Topic', 'Me', 'Class'], [data.labels, data.studentData, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#accuracyPerTopicVsClass');
      }
    }
  });
}

// by type analytics

var getPointsPerTypeVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'pointsPerTypeVsClass'
    },
    success: function (data) {
      data.id = '#pointsPerTypeVsClass';
      data.labels = data.labels.map(item => {
        return questionTypes[item].value;
      });
      createRadarChart(data);
      createTable('#pointsPerTypeVsClassTable', ['Type', 'Me', 'Class'], [data.labels, data.studentData, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#pointsPerTypeVsClass');
      }
    }
  });
}

var getAccuracyPerTypeVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'accuracyPerTypeVsClass'
    },
    success: function (data) {
      data.id = '#accuracyPerTypeVsClass';
      data.labels = data.labels.map(item => {
        return questionTypes[item].value;
      });
      createRadarChart(data);
      createTable('#accuracyPerTypeVsClassTable', ['Type', 'Me', 'Class'], [data.labels, data.studentData, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#accuracyPerTypeVsClass');
      }
    }
  });
}

// Class statistics

var getClassAnswered = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classAnswered'
    },
    success: function (data) {
      $('#classAnsweredI').html(data[0]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#classAnsweredI').html('No Data');
      }
    }
  });
}

var getClassAccuracy = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classAccuracy'
    },
    success: function (data) {
      $('#classAccuracyI').html(data[0]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#classAccuracyI').html('No Data');
      }
    }
  });
}

var getClassPointsPerAttempt = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classPointsPerAttempt'
    },
    success: function (data) {
      $('#classPointsPerAttemptI').html(data[0]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#classPointsPerAttemptI').html('No Data');
      }
    }
  });
}

var getClassOverall = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classOverall'
    },
    success: function (data) {
      $('#classOverallI').html(data[0]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#classOverallI').html('No Data');
      }
    }
  });
}

var getClassPoints = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classPoints'
    },
    success: function (data) {
      $('#classPointsI').html(data[0]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        $('#classPointsI').html('No Data');
      }
    }
  });
}

var getClassAnsweredOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classAnsweredOverTime'
    },
    success: function (data) {
      data.id = '#classAnsweredOverTime';
      data.col = colours.cyan;
      data.colLight = colours.cyanLight;
      data.colBack = colours.cyanLightO;
      createClassLineChart(data);
      createTable('#classAnsweredOverTimeTable', ['Date', 'Class'], [data.dates, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classAnsweredOverTime');
      }
    }
  });
}

var getClassPointsPerAttemptOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classPointsPerAttemptOverTime'
    },
    success: function (data) {
      data.id = '#classPointsPerAttemptOverTime';
      data.col = colours.purple;
      data.colLight = colours.purpleLight;
      data.colBack = colours.purpleLightO;
      createClassLineChart(data);
      createTable('#classPointsPerAttemptOverTimeTable', ['Date', 'Class'], [data.dates, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classPointsPerAttemptOverTime');
      }
    }
  });
}

var getClassPointsPerTopicVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classPointsPerTopicVsClass'
    },
    success: function (data) {
      data.id = '#classPointsPerTopicVsClass';
      createClassRadarChart(data);
      createTable('#classPointsPerTopicVsClassTable', ['Topic', 'Class'], [data.labels, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classPointsPerTopicVsClass');
      }
    }
  });
}

var getClassAccuracyPerTopicVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classAccuracyPerTopicVsClass'
    },
    success: function (data) {
      data.id = '#classAccuracyPerTopicVsClass';
      createClassRadarChart(data);
      createTable('#classAccuracyPerTopicVsClassTable', ['Topic', 'Class'], [data.labels, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classAccuracyPerTopicVsClass');
      }
    }
  });
}

var getClassRatingPerTopicVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classRatingPerTopicVsClass'
    },
    success: function (data) {
      data.id = '#classRatingPerTopicVsClass';
      createRatingRadarChart(data);
      createTable('#classRatingPerTopicVsClassTable', ['Topic', 'Me', 'Class'], [data.labels, data.adminsData, data.studentsData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classRatingPerTopicVsClass');
      }
    }
  });
}

var getClassPointsPerTypeVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classPointsPerTypeVsClass'
    },
    success: function (data) {
      data.id = '#classPointsPerTypeVsClass';
      data.labels = data.labels.map(item => {
        return questionTypes[item].value;
      });
      createClassRadarChart(data);
      createTable('#classPointsPerTypeVsClassTable', ['Type', 'Class'], [data.labels, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classPointsPerTypeVsClass');
      }
    }
  });
}

var getClassAccuracyPerTypeVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classAccuracyPerTypeVsClass'
    },
    success: function (data) {
      data.id = '#classAccuracyPerTypeVsClass';
      data.labels = data.labels.map(item => {
        return questionTypes[item].value;
      });
      createClassRadarChart(data);
      createTable('#classAccuracyPerTypeVsClassTable', ['Type', 'Class'], [data.labels, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classAccuracyPerTypeVsClass');
      }
    }
  });
}

var getClassRatingPerTypeVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classRatingPerTypeVsClass'
    },
    success: function (data) {
      data.id = '#classRatingPerTypeVsClass';
      data.labels = data.labels.map(item => {
        return questionTypes[item].value;
      });
      createRatingRadarChart(data);
      createTable('#classRatingPerTypeVsClassTable', ['Type', 'Me', 'Class'], [data.labels, data.adminsData, data.studentsData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classRatingPerTypeVsClass');
      }
    }
  });
}

var getClassOverallOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classOverallOverTime'
    },
    success: function (data) {
      data.id = '#classOverallOverTime';
      data.col = colours.lime;
      data.colLight = colours.limeLight;
      data.colBack = colours.limeLightO;
      createClassLineChart(data);
      createTable('#classOverallOverTimeTable', ['Date', 'Class'], [data.dates, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classOverallOverTime');
      }
    }
  });
}

var getClassAccuracyOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classAccuracyOverTime'
    },
    success: function (data) {
      data.id = '#classAccuracyOverTime';
      data.col = colours.teal;
      data.colLight = colours.tealLight;
      data.colBack = colours.tealLightO;
      createClassLineChart(data);
      createTable('#classAccuracyOverTimeTable', ['Date', 'Class'], [data.dates, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classAccuracyOverTime');
      }
    }
  });
}

var getClassPointsOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classPointsOverTime'
    },
    success: function (data) {
      data.id = '#classPointsOverTime';
      data.col = colours.orange;
      data.colLight = colours.orangeLight;
      data.colBack = colours.orangeLightO;
      createClassLineChart(data);
      createTable('#classPointsOverTimeTable', ['Date', 'Class'], [data.dates, data.classData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#classPointsOverTime');
      }
    }
  });
}

var getPointsRankOverTime = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'pointsRankOverTime'
    },
    success: function (data) {
      data.id = '#pointsRankOverTime';
      data.col = colours.orange;
      data.colLight = colours.orangeLight;
      data.colBack = colours.orangeLightO;
      createRankChart(data);
      createTable('#pointsRankOverTimeTable', ['Date', 'Me'], [data.dates, data.studentData]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 404) {
        window.location.href = '/page-not-found';
      } else {
        noDataCanvas('#pointsRankOverTime');
      }
    }
  });
}

// Helper functions to create tables and charts

var createLineChart = function (data) {
  var ctx = $(data.id);
  ctx[0].width = ctx[0].width;
  var config2 = {
    type: 'line',
    data: {
      datasets: [
        {
          data: data.studentData,
          backgroundColor: data.colBack,
          borderColor: data.col,
          label: 'Me',
          borderWidth: 4,
          pointBorderWidth: 1,
          pointHoverBackgroundColor: colours.white,
          pointHoverBorderColor: data.col,
          pointRadius: 4,
          pointBackgroundColor: data.colLight
        },
        {
          data: data.classData,
          backgroundColor: colours.grayDarkO,
          borderColor: colours.grayDark,
          label: 'Class',
          borderWidth: 4,
          pointBorderWidth: 1,
          pointHoverBackgroundColor: colours.white,
          pointHoverBorderColor: colours.grayDark,
          pointRadius: 4,
          pointBackgroundColor: colours.grayDark
        }
      ],
      labels: data.dates
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: maximum(data)
          }
        }],
        xAxes: [{
          display: false
        }]
      },
      layout: {
        padding: {
          left: 10,
          right: 20,
          bottom: 20
        }
      }
    }
  };
  new Chart(ctx, config2);
}

var createClassLineChart = function (data) {
  var ctx = $(data.id);
  ctx[0].width = ctx[0].width;
  var config2 = {
    type: 'line',
    data: {
      datasets: [
        {
          data: data.classData,
          backgroundColor: data.colBack,
          borderColor: data.col,
          borderWidth: 4,
          pointBorderWidth: 1,
          pointHoverBackgroundColor: colours.white,
          pointHoverBorderColor: data.col,
          pointRadius: 4,
          pointBackgroundColor: data.colLight
        },
      ],
      labels: data.dates
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            min: 0
          }
        }],
        xAxes: [{
          display: false
        }]
      },
      layout: {
        padding: {
          left: 10,
          right: 20,
          bottom: 20
        }
      },
      legend: {
        display: false
      }
    }
  };
  new Chart(ctx, config2);
}

var createRankChart = function (data) {
  var ctx = $(data.id);
  ctx[0].width = ctx[0].width;
  var config2 = {
    type: 'line',
    data: {
      datasets: [
        {
          data: data.studentData,
          backgroundColor: colours.transparent,
          borderColor: data.col,
          label: 'Me',
          borderWidth: 4,
          pointBorderWidth: 1,
          pointHoverBackgroundColor: colours.white,
          pointHoverBorderColor: data.col,
          pointRadius: 4,
          pointBackgroundColor: data.colLight
        }
      ],
      labels: data.dates
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            reverse: true,
            max: data.totalStudentsCount
          }
        }],
        xAxes: [{
          display: false
        }]
      },
      layout: {
        padding: {
          right: 20,
          bottom: 20
        }
      },
      legend: {
        display: false
      }
    }
  };
  new Chart(ctx, config2);
}

var maximum = function (data) {
  const studentD = data.studentData.reduce(function (a, b) {
    return Math.max(a, b);
  });

  const classD = data.classData.reduce(function (a, b) {
    return Math.max(a, b);
  });

  return Math.max(studentD, classD) + 10;
}

var createRatingRadarChart = function (data) {
  var ctx = $(data.id);
  ctx[0].width = ctx[0].width;
  var config2 = {
    type: 'radar',
    data: {
      datasets: [
        {
          data: data.studentsData,
          backgroundColor: colours.blueBackO,
          borderColor: colours.blueMatt,
          pointBorderColor: colours.blueMatt,
          label: 'Me',
          borderWidth: 4,
          pointHoverBackgroundColor: colours.white,
          pointBackgroundColor: colours.blueBack,
          pointHoverBorderColor: colours.blueMatt,
          pointRadius: 4,
        },
        {
          data: data.adminsData,
          backgroundColor: colours.pinkLightO,
          borderColor: colours.pinkHot,
          pointBorderColor: colours.pinkHot,
          label: 'Class',
          borderWidth: 4,
          pointHoverBackgroundColor: colours.white,
          pointBackgroundColor: colours.pinkLight,
          pointHoverBorderColor: colours.pinkHot,
          pointRadius: 4,
        }
      ],
      labels: data.labels
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [{
          display: false
        }],
        xAxes: [{
          display: false
        }]
      },
      layout: {
        padding: {
          bottom: 20
        }
      }
    }
  };
  new Chart(ctx, config2);
}

var createRadarChart = function (data) {
  var ctx = $(data.id);
  ctx[0].width = ctx[0].width;
  var config2 = {
    type: 'radar',
    data: {
      datasets: [
        {
          data: data.studentData,
          backgroundColor: colours.blueBackO,
          borderColor: colours.blueMatt,
          pointBorderColor: colours.blueMatt,
          label: 'Me',
          borderWidth: 4,
          pointHoverBackgroundColor: colours.white,
          pointBackgroundColor: colours.blueBack,
          pointHoverBorderColor: colours.blueMatt,
          pointRadius: 4,
        },
        {
          data: data.classData,
          backgroundColor: colours.pinkLightO,
          borderColor: colours.pinkHot,
          pointBorderColor: colours.pinkHot,
          label: 'Class',
          borderWidth: 4,
          pointHoverBackgroundColor: colours.white,
          pointBackgroundColor: colours.pinkLight,
          pointHoverBorderColor: colours.pinkHot,
          pointRadius: 4,
        }
      ],
      labels: data.labels
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [{
          display: false
        }],
        xAxes: [{
          display: false
        }]
      },
      layout: {
        padding: {
          bottom: 20
        }
      }
    }
  };
  new Chart(ctx, config2);
}

var createClassRadarChart = function (data) {
  var ctx = $(data.id);
  ctx[0].width = ctx[0].width;
  var config2 = {
    type: 'radar',
    data: {
      datasets: [
        {
          data: data.classData,
          backgroundColor: colours.blueBackO,
          borderColor: colours.blueMatt,
          pointBorderColor: colours.blueMatt,
          borderWidth: 4,
          pointHoverBackgroundColor: colours.white,
          pointBackgroundColor: colours.blueBack,
          pointHoverBorderColor: colours.blueMatt,
          pointRadius: 4,
        }
      ],
      labels: data.labels
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [{
          display: false
        }],
        xAxes: [{
          display: false
        }]
      },
      layout: {
        padding: {
          bottom: 20
        }
      },
      legend: {
        display: false
      }
    }
  };
  new Chart(ctx, config2);
}

var noDataCanvas = function (id) {
  createTable(id + 'Table', [], []);
  var byId = $(id)[0];
  var context = byId.getContext("2d");
  byId.width = byId.width;
  context.translate(70, 50);
  context.font = '25pt Calibri';
  context.textAlign = 'center';
  context.fillStyle = '#000';
  context.fillText('No Data', 0, 0);
}

var createTable = function (id, headers, content) {
  var tableString = '<table>';

  if (content.length > 0) {
    tableString += '<tr>';

    headers.forEach(title => {
      tableString += `<th>${title}</th>`;
    });
    tableString += '</tr>';

    for (i = content[0].length - 1; i >= 0; i--) {
      tableString += '<tr>';
      for (j = 0; j < content.length; j++) {
        tableString += `<td>${content[j][i]}</td>`;
      }
      tableString += '</tr>';
    }
  }

  tableString += '</table>';
  $(id).html(tableString);
}
