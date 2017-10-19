$(function() {
  $.ajax({
    type: 'GET',
    url: '/getAnalytics',
    success: function(data) {
      var config = {
        type: 'pie',
        data: {
          datasets: [{
            data: data,
            backgroundColor: [
              "#4B515D",
              "#4285F4",
              "#ff4444",
              "#00C851"
            ],
            label: 'Dataset 1'
          }],
          labels: [
            "ON-HOLD",
            "IN-DEVELOPMENT",
            "CANCELLED",
            "COMPLETED"
          ]
        },
        options: {
          responsive: true
        }
      };
      var ctx = $("#questionsAnsweredVsClass");
      new Chart(ctx, config);
      var ctx = $("#accuracyVsClass");
      new Chart(ctx, config);
      var ctx = $("#pointsVsClass");
      new Chart(ctx, config);
      var ctx = $("#ratingVsClass");
      new Chart(ctx, config);
    },
    error: function(data) {
      $('#invalid').html(failedLogin);
    }
  });
});
