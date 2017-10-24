var states;

$(function() {
  $('#nav-analytics').addClass('active');

  getStudentList();
  displayStudentStatistics();
  getQuestionsAnsweredVsClass();
  getAccuracyVsClass();
  getPointsVsClass();
  getRatingVsClass();

  var studentList = {};
  for (var s in states) {
    studentList[states[s]] = null;
  }
  $('#autocomplete-input').autocomplete({
    data: studentList,
    limit: 20,
    onAutocomplete: function(val) {
      alert(val);
    },
    minLength: 1,
  });
});

var getStudentList = function() {
  $.ajax({
    type: 'GET',
    async: false,
    url: '/studentsListofIds',
    success: function(data) {
      states = data;
    },
    error: function(data){
      states = ['Error'];
    }
  });
}



$('#option-class').click(function(evt) {
    displayClassStatistics();
});

$('#option-student').click(function(evt) {
    displayStudentStatistics();
});

var displayClassStatistics = function() {
    // Card visibilty
    $('#student-analytics-card').addClass('hidden');
    $('#class-analytics-card').removeClass('hidden');
}

var displayStudentStatistics = function() {
    // Card visibilty
    $('#student-analytics-card').removeClass('hidden');
    $('#class-analytics-card').addClass('hidden');
}

var getQuestionsAnsweredVsClass = function() {
  $.ajax({
    type: 'GET',
    url: '/studentAnalytics',
    data: {
      type: 'QuestionsAnsweredVsClass'
    },
    success: function(data) {
      new Chart($("#questionsAnsweredVsClass"), {
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
            text: 'Your Answered Questions VS. The Class'
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
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      }
    }
  });
}

var getAccuracyVsClass = function() {
  $.ajax({
    type: 'GET',
    url: '/studentAnalytics',
    data: {
      type: 'AccuracyVsClass'
    },
    success: function(data) {
      new Chart($("#accuracyVsClass"), {
        type: 'doughnut',
        data: {
          datasets: [{
            data: data,
            backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
          }],
          labels: ['Your Accuracy', "The Class Accuracy"]
        },
        options: {
          legend:{
            display: false
          },
          responsive: true,
          title: {
            display: true,
            text: 'Your Accuracy VS. The Class Accuracy'
          }
        }
      });
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      }
    }
  });
}

var getPointsVsClass = function() {
  $.ajax({
    type: 'GET',
    url: '/studentAnalytics',
    data: {
      type: 'PointsVsClass'
    },
    success: function(data) {
      new Chart($("#pointsVsClass"), {
        type: 'doughnut',
        data: {
          datasets: [{
            data: data,
            backgroundColor: ["#ff4444", "#00C851"],
            label: 'Dataset 1'
          }],
          labels: ["CANCELLED", "COMPLETED"]
        },
        options: {
          responsive: true,
          legend:{
            display: false
          },
          title: {
            display: true,
            text: 'Points Vs Class'
          }
        }
      });
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      }
    }
  });
}

var getRatingVsClass = function() {
  $.ajax({
    type: 'GET',
    url: '/studentAnalytics',
    data: {
      type: 'RatingVsClass'
    },
    success: function(data) {
      new Chart($("#ratingVsClass"), {
        type: 'doughnut',
        data: {
          datasets: [{
            data: data,
            backgroundColor: ["#ff4444", "#00C851"],
            label: 'Dataset 1'
          }],
          labels: ["CANCELLED", "COMPLETED"]
        },
        options: {
          responsive: true,
          legend:{
            display: false
          },
          title: {
            display: true,
            text: 'Rating Vs Class'
          }
        }
      });
    },
    error: function(data) {
      if (data['status'] === 401) {
        window.location.href = '/';
      }
    }
  });
}















var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

// var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
//   'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
//   'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
//   'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
//   'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
//   'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
//   'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
//   'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
//   'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
// ];
