document.addEventListener('DOMContentLoaded', function() {
  data = {
    datasets: [{
        data: [10, 20, 30]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        'Red',
        'Yellow',
        'Blue'
    ]
};

  var myDoughnutChart = new Chart($('#myChart'), {
  type: 'doughnut',
  data: data,
  options: options
});

}, false);
