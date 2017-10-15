document.addEventListener('DOMContentLoaded', function() {
  var config = {
    type: 'pie',
    data: {
      datasets: [{
        data: [14, 10, 5, 30],
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
  var ctx = $("#myChart");
  new Chart(ctx, config);

}, false);
