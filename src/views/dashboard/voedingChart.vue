<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: ["chartdata"],
  watch: {
    chartdata() {
      this.render();
    },
  },
  methods: {
    render: function () {
      for (let i in this.chartdata.labels) {
        this.chartdata.labels[i] = this.chartdata.labels[i].substr(0, 10);
      }
      this.renderChart(this.chartdata, {
        responsive: true,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      });
    },
  },
  mounted() {
    this.render();
  },
};
</script>

<style></style>
