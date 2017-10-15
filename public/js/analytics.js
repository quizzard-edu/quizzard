$(function() {
  getQuestionsAnsweredVsClass();
  getAccuracyVsClass();
  getPointsVsClass();
  getRatingVsClass();
});

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
          display: false
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
          display: false
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
          display: false
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
          display: false
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
