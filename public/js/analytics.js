var students;
var studentList;

$(function() {
  $('#nav-analytics').addClass('active');

  // Loads the Student statistics by default
  displayStudentStatistics(null);

  // Loads the list of students so that the instructor can select one
  getStudentList();
  studentList = {};
  for (var s in students) {
    studentList[students[s]] = null;
  }

  // Setting up the autocomplete search for the student IDs
  $('#autocomplete-input').autocomplete({
    data: studentList,
    limit: 20,
    onAutocomplete: function(val) {
      $('#student-analytics-card-content').removeClass('hidden');
      displayStudentStatistics(val);
    },
    minLength: 1,
  });

  // Showing the analytics automatically
  $('#autocomplete-input').keyup(function() {
    const autocompleteValue = $('#autocomplete-input').val();

    for (var s in studentList) {
      if (s === autocompleteValue) {
        $('#student-analytics-card-content').removeClass('hidden');
        displayStudentStatistics(autocompleteValue);
        return;
      }
    }

    $('#student-analytics-card-content').addClass('hidden');
  });
});

/**
* Gets the list of student IDs
*/
var getStudentList = function() {
  $.ajax({
    type: 'GET',
    async: false,
    url: '/studentsListofIds',
    success: function(data) {
      students = data;
    },
    error: function(data){
      students = ['Error'];
    }
  });
}

/**
* Switching to class statistics tab
*/
$('#option-class').click(function(evt) {
    displayClassStatistics();
});

/**
* Switching to student statistics tab
*/
$('#option-student').click(function(evt) {
    displayStudentStatistics(null);
});

/**
* Class statistics
* Sets up the card visibility
* Calls requested charts to update
*/
var displayClassStatistics = function() {
    // Card visibilty
    $('#student-analytics-card').addClass('hidden');
    $('#class-analytics-card').removeClass('hidden');

    $('#studentAnalyticsHeadr').addClass('hidden');
    $('#classAnalyticsHeadr').addClass('hidden');
}

/**
* Student statistics
* Sets up the card visibility
* Calls requested charts to update
*/
var displayStudentStatistics = function(studentId) {
    // Card visibilty
    $('#student-analytics-card').removeClass('hidden');
    $('#class-analytics-card').addClass('hidden');

    $('#studentAnalyticsHeadr').removeClass('hidden');
    $('#classAnalyticsHeadr').removeClass('hidden');

    var path = studentId ? '/studentAnalytics?studentId=' + studentId : '/studentAnalytics';

    // Request statistics

    // Student Ratings
    getQuestionsAnsweredStudent(path);
    getAccuracyStudent(path);
    getPointsStudent(path);
    getRatingStudent(path);

    // Class Ratings
    getQuestionsAnsweredClass(path);
    getAccuracyClass(path);
    getPointsClass(path);
    getRatingClass(path);
}

var getQuestionsAnsweredClass = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'QuestionsAnsweredVsClass'
    },
    success: function(data) {
      $('#classAnswered').html(data[1]);
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#classAnswered').html('No Data');
      }
    }
  });
}

var getAccuracyClass = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'AccuracyVsClass'
    },
    success: function(data) {
      $('#classAccuracy').html(data[1]);
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#classAccuracy').html('No Data');
      }
    }
  });
}

var getPointsClass = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'PointsVsClass'
    },
    success: function(data) {
      $('#classPoints').html(data[1]);
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#classPoints').html('No Data');
      }
    }
  });
}

var getRatingClass = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'RatingVsClass'
    },
    success: function(data) {
      $('#classRating').html(data[1]);
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#classRating').html('No Data');
      }
    }
  });
}

var getQuestionsAnsweredStudent = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'QuestionsAnsweredVsClass'
    },
    success: function(data) {
      $('#studentAnswered').html(data[0]);
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#studentAnswered').html('No Data');
      }
    }
  });
}

var getAccuracyStudent = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'AccuracyVsClass'
    },
    success: function(data) {
      $('#studentAccuracy').html(data[0]);
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#studentAccuracy').html('No Data');
      }
    }
  });
}

var getPointsStudent = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'PointsVsClass'
    },
    success: function(data) {
      $('#studentPoints').html(data[0]);
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#studentPoints').html('No Data');
      }
    }
  });
}

var getRatingStudent = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'RatingVsClass'
    },
    success: function(data) {
      $('#studentRating').html(data[0]);
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#studentRating').html('No Data');
      }
    }
  });
}
