$(function() {
  $('#nav-analytics').addClass('active');

  displayClassStatistics();
  getQuestionsAnsweredVsClass();
  getAccuracyVsClass();
  getPointsVsClass();
  getRatingVsClass();
});

$('#option-class').click(function(evt) {
    displayClassStatistics();
});

$('#option-student').click(function(evt) {
    displayStudentStatistics();
});

var displayClassStatistics = function() {
    // Card visibilty
    $('#student-analytics-card').addClass('hidden');
    $('#instructor-analytics-card').removeClass('hidden');
}

var displayStudentStatistics = function() {
    // Card visibilty
    $('#student-analytics-card').removeClass('hidden');
    $('#instructor-analytics-card').addClass('hidden');
}

var getQuestionsAnsweredVsClass = function() {
  $.ajax({
    type: 'GET',
    url: '/getAnalytics',
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
    url: '/getAnalytics',
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
    url: '/getAnalytics',
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
    url: '/getAnalytics',
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
