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
    testRadar('#testingCanvas4');
    testRadar('#testingCanvas5');
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
    // TODO: CARD MISSING
    getOverallOverTime(path);
    getOverallRankOverTime(path);
    
    // points per attempt analytics
    // TODO: CARD MISSING
    getPointsPerAttemptsOverTime(path);
    getPointsPerAttemptRankOverTime(path);

    // by topic analytics
    getPointsPerTopicVsClass(path);
    getAccuracyPerTopicVsClass(path);

    // by type analytics
    getPointsPerTypeVsClass(path);
    getAccuracyPerTypeVsClass(path);
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
      $('#studentAccuracy').html(`${data[0]}%`);
      $('#classAccuracy').html(`${data[1]}%`);
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
      createLineChart (data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      createRankChart (data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      createLineChart (data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      createLineChart (data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      createLineChart (data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      data.col = colours.orangeLight;
      createLineChart (data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      createRankChart(data)
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      data.col = colours.orangeLight;
      createRankChart(data)
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      createRankChart(data)
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      createRankChart(data)
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
      }
    }
  });
}

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
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
      }
    }
  });
}

var getPointsPerTypeVsClass = function (path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'pointsPerTypeVsClass'
    },
    success: function (data) {
      data.id = '#pointsPerTypeVsClass';
      createRadarChart(data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
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
      createRadarChart(data);
    },
    error: function (data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        //failSnackbar('Graph data not match');
      }
    }
  });
}

var createLineChart = function (data) {
  var ctx = $(data.id);
  var config2 = {
    type: 'line',
    data: {
      datasets: [
        {
          data: data.studentData,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: data.col,
          label: 'Me',
          borderWidth: 4,
          pointHoverBackgroundColor: 'white',
          pointHoverBorderColor: data.col,
          pointRadius: 2,
        },
        {
          data: data.classData,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: '#d1d1d1',
          label: 'Class',
          borderWidth: 4,
          pointHoverBackgroundColor: 'white',
          pointHoverBorderColor: '#d1d1d1',
          pointRadius: 2,
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
            display : false
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
  new Chart (ctx, config2);
}


var createRankChart = function (data) {
  var ctx = $(data.id);
  var config2 = {
    type: 'line',
    data: {
      datasets: [
        {
          data: data.studentData,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: data.col,
          borderWidth: 4,
          pointHoverBackgroundColor: 'white',
          pointHoverBorderColor: data.col,
          pointRadius: 2,
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
            display : false
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
  new Chart (ctx, config2);
}


var maximum = function(data) {
  const studentD = data.studentData.reduce(function(a, b) {
    return Math.max(a, b);
  });

  const classD = data.classData.reduce(function(a, b) {
    return Math.max(a, b);
  });

  return Math.max(studentD, classD) + 10;
}

var createRadarChart = function (data) {
  var ctx = $(data.id);
  var config2 = {
    type: 'radar',
    data: {
      datasets: [
        {
          data: data.studentData,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: '#42A5F5',
          pointBorderColor: '#42A5F5',
          label: 'Me',
          borderWidth: 4,
          pointHoverBackgroundColor: 'white',
          pointBackgroundColor: '#90CAF9',
          pointHoverBorderColor: '#42A5F5',
          pointRadius: 4,
        },
        {
          data: data.classData,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: '#F06292',
          pointBorderColor: '#F06292',
          label: 'Class',
          borderWidth: 4,
          pointHoverBackgroundColor: 'white',
          pointBackgroundColor: '#F8BBD0',
          pointHoverBorderColor: '#F06292',
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
            display : false
        }]
      },
      layout: {
        padding: {
          bottom: 20
        }
      }
    }
  };
  new Chart (ctx, config2);
}
