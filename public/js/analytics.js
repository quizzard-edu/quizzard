$(function() {
  $('#nav-analytics').addClass('active');

  //getStudentList();
  displayClassStatistics();
  getQuestionsAnsweredVsClass();
  getAccuracyVsClass();
  getPointsVsClass();
  getRatingVsClass();
});

var getStudentList = function() {
  $.ajax({
    type: 'GET',
    url: '/studentsListofIds',
    success: function(data) {
      return data;
    },
    error: function(data){
      return ['Error'];
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
            text: 'Answered Vs Class'
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
            text: 'Accuracy Vs Class'
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

var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
  'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

$(function() {
  $('#the-basics .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'states',
    source: substringMatcher(states)
  });
});
