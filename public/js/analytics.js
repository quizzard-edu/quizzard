var students;
var studentList;

$(function () {
  $('#nav-analytics').addClass('active');

  // Loads the Student statistics by default
  displayStudentStatistics(null);

  // Loads the list of students so that the instructor can select one
  getStudentList ();
  studentList = {};
  for (var s in students) {
    studentList[students[s]] = null;
  }

  // Setting up the autocomplete search for the student IDs
  $('#autocomplete-input').autocomplete({
    data: studentList,
    limit: 20,
    onAutocomplete: function (val) {
      $('#student-analytics-card').removeClass('hidden');
      displayStudentStatistics(val.split (' ')[0]);
    },
    minLength: 1,
  });

  // Showing the analytics automatically
  $('#autocomplete-input').keyup(function () {
    const autocompleteValue = $('#autocomplete-input').val();

    for (var s in studentList) {
      if (s === autocompleteValue) {
        $('#student-analytics-card').removeClass('hidden');
        displayStudentStatistics(autocompleteValue.split (' ')[0]);
        return;
      }
    }

    $('#student-analytics-card').addClass('hidden');
  });
});

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
    displayClassStatistics();
});

/**
* Switching to student statistics tab
*/
$('#option-student').click(function (evt) {
    displayStudentStatistics(null);
});

/**
* Class statistics
* Sets up the card visibility
* Calls requested charts to update
*/
var displayClassStatistics = function () {
    // Card visibilty
    $('#student-analytics-card').addClass('hidden');
    $('#studentSelector').addClass('hidden');
    $('#class-analytics-card').removeClass('hidden');

    $('#studentAnalyticsHeader').addClass('hidden');

    var path = '/adminAnalytics';

    // Class Statistics
    getClassAnswered(path);
    getClassAccuracy(path);
    getClassPoints(path);
    getClassRating(path);
}

/**
* Student statistics
* Sets up the card visibility
* Calls requested charts to update
*/
var displayStudentStatistics = function (studentId) {
    // Card visibilty
    $('#student-analytics-card').removeClass('hidden');
    $('#studentSelector').removeClass('hidden');
    $('#class-analytics-card').addClass('hidden');

    $('#studentAnalyticsHeader').removeClass('hidden');

    var path = studentId ? '/studentAnalytics?studentId=' + studentId : '/studentAnalytics';

    // Request statistics

    // Student and Class Statistics
    getQuestionsAnsweredStudentAndClass(path);
    getAccuracyStudentAndClass(path);
    getPointsStudentAndClass(path);
    getRatingStudentAndClass(path);
    getCorrectAttemptsOverTime(path);
    getAccuracyOverTime(path);
    getPointsOverTime(path);
}

// Student statistics

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
      } else if (data['status'] === 500) {
        $('#studentAnswered').html('No Data');
        $('#classAnswered').html('No Data');
      }
    }
  });
}

var getAccuracyStudentAndClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'AccuracyVsClass'
    },
    success: function (data) {
      $('#studentAccuracy').html(data[0]);
      $('#classAccuracy').html(data[1]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#studentAccuracy').html('No Data');
        $('#classAccuracy').html('No Data');
      }
    }
  });
}

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
      } else if (data['status'] === 500) {
        $('#studentPoints').html('No Data');
        $('#classPoints').html('No Data');
      }
    }
  });
}

var getRatingStudentAndClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'RatingVsClass'
    },
    success: function (data) {
      $('#studentRating').html(data[0]);
      $('#classRating').html(data[1]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#studentRating').html('No Data');
        $('#classRating').html('No Data');
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
      } else if (data['status'] === 500) {
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
      } else if (data['status'] === 500) {
        $('#classAccuracyI').html('No Data');
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
      } else if (data['status'] === 500) {
        $('#classPointsI').html('No Data');
      }
    }
  });
}

var getClassRating = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'classRating'
    },
    success: function (data) {
      $('#classRatingI').html(data[0]);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#classRatingI').html('No Data');
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
      data.id = '#testingCanvas1';
      createLineChart (data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        failSnackbar('Graph data not match');
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
      data.id = '#testingCanvas2';
      createLineChart (data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        failSnackbar('Graph data not match');
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
      data.id = '#testingCanvas3';
      createLineChart (data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        failSnackbar('Graph data not match');
      }
    }
  });
}

var createLineChart = function (data) {
  var canvas = document.getElementById('testingCanvas1');
  var ctxx = canvas.getContext('2d');

  gradient = ctxx.createLinearGradient(0, 0, 0, 450)
  gradient2 = ctxx.createLinearGradient(0, 0, 0, 450)

  gradient.addColorStop(0, 'rgba(255, 0,0, 0.5)')
  gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

  gradient2.addColorStop(0, 'rgba(0, 231, 255, 0.9)')
  gradient2.addColorStop(0.5, 'rgba(0, 231, 255, 0.25)');
  gradient2.addColorStop(1, 'rgba(0, 231, 255, 0)');

  var ctx = $(data.id);
  var config2 = {
    type: 'line',
    data: {
      datasets: [
        {
          data: data.studentData,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          label: 'Me',
          pointBackgroundColor: '#00bcd4',
          borderWidth: 2,
          pointBorderWidth: 4,
          pointBorderColor: 'rgba(255, 255, 255, 0.5)',
        },
        {
          data: data.classData,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.4)',
          label: 'Class',
          pointBackgroundColor: '#00bcd4',
          borderWidth: 2,
          pointBorderWidth: 4,
          pointBorderColor: 'rgba(255, 255, 255, 0.4)',
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
            beginAtZero: true
          }
        }],
        xAxes: [{
            display : false
        }]
      },
      layout: {
        padding: {
          right: 10,
          bottom: 10
        }
      }
    }
  };
  new Chart (ctx, config2);
}
