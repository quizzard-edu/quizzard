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

    var path = studentId ? '/studentAnalytics?studentId=' + studentId : '/studentAnalytics';

    // Request statistics
    getQuestionsAnsweredVsClass(path);
    getAccuracyVsClass(path);
    getPointsVsClass(path);
    getRatingVsClass(path);
}

var getQuestionsAnsweredVsClass = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'QuestionsAnsweredVsClass'
    },
    success: function(data) {
      $('#questionsAnsweredVsClass').removeClass('hidden');

      if (data[0] === 0 && data[1] === 0) {
        new Chart($('#questionsAnsweredVsClass'), {
          options: {
            title: {
              display: true,
              text: 'No Data for Answered Questions'
            }
          }
        });
      } else {
        new Chart($('#questionsAnsweredVsClass'), {
          type: 'bar',
          data: {
            datasets: [{
              data: [data[0]],
              backgroundColor: 'rgba(43, 244, 33, 0.5)',
              borderColor: 'rgba(43, 163, 0, 1)',
              borderWidth: '3',
              label: 'Your Questions Answered'
            },
            {
              data: [data[1]],
              backgroundColor: 'rgba(243, 13, 20, 0.5)',
              borderColor: 'rgba(243, 13, 20, 1)',
              borderWidth: '3',
              label: 'Class Questions Answered'
            }],
          },
          options: {
            responsive: true,
            title: {
              display: true,
              text: 'Answered Questions'
            },
            scales: {
              yAxes: [{
                ticks: {
                  suggestedMin: 0
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Number of Answered Questions'
                },
              }]
            }
          }
        });
      }
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#questionsAnsweredVsClass').addClass('hidden');
      }
    }
  });
}

var getAccuracyVsClass = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'AccuracyVsClass'
    },
    success: function(data) {
      $('#accuracyVsClass').removeClass('hidden');

      if (data[0] === 0 && data[1] === 0) {
        new Chart($('#accuracyVsClass'), {
          options: {
            title: {
              display: true,
              text: 'No Data for Accuracy'
            }
          }
        });
      } else {
        new Chart($('#accuracyVsClass'), {
          type: 'doughnut',
          data: {
            datasets: [{
              data: data,
              backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
            }],
            labels: ['Your Accuracy', 'Average Class Accuracy']
          },
          options: {
            legend:{
              display: false
            },
            responsive: true,
            title: {
              display: true,
              text: 'Accuracy'
            }
          }
        });
      }
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#accuracyVsClass').addClass('hidden');
      }
    }
  });
}

var getPointsVsClass = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'PointsVsClass'
    },
    success: function(data) {
      $('#pointsVsClass').removeClass('hidden');

      if (data[0] === 0 && data[1] === 0) {
        new Chart($('#pointsVsClass'), {
          options: {
            title: {
              display: true,
              text: 'No Data for Points'
            }
          }
        });
      } else {
        new Chart($('#pointsVsClass'), {
          type: 'doughnut',
          data: {
            datasets: [{
              data: data,
              backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
            }],
            labels: ['Your Points', 'Average Class Points']
          },
          options: {
            legend:{
              display: false
            },
            responsive: true,
            title: {
              display: true,
              text: 'Points'
            }
          }
        });
      }
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#pointsVsClass').addClass('hidden');
      }
    }
  });
}

var getRatingVsClass = function(path) {
  $.ajax({
    type: 'GET',
    url: path,
    data: {
      type: 'RatingVsClass'
    },
    success: function(data) {
      $('#ratingVsClass').removeClass('hidden');

      if (data[0] === 0 && data[1] === 0) {
        new Chart($('#ratingVsClass'), {
          options: {
            title: {
              display: true,
              text: 'No Data for Average Rating'
            }
          }
        });
      } else {
        new Chart($('#ratingVsClass'), {
          type: 'doughnut',
          data: {
            datasets: [{
              data: data,
              backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
              label: 'Dataset 1'
            }],
            labels: ['Your Average Rating', 'Average Class Rating']
          },
          options: {
            legend:{
              display: false
            },
            responsive: true,
            title: {
              display: true,
              text: 'Average Rating'
            }
          }
        });
      }
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      } else if (data['status'] === 500) {
        $('#ratingVsClass').addClass('hidden');
      }
    }
  });
}
