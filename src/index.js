import { Chart } from 'chart.js'
import './tailwind.css'
import './index.css'

const loader = document.getElementById("loader")

const smhiUrl = (lon, lat) => `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`

const cities = [
  { color: "#9b5de5", name: "Uppsala", lat: 59.86, lon: 17.64 },
  { color: "#f15bb5", name: "Umeå", lat: 63.8, lon: 20.26 },
  { color: "#edd330", name: "Stockholm", lat: 59.33,lon: 18.06 },
  { color: "#00bbf9", name: "Lund", lat: 55.7,lon: 13.12 },
  { color: "#00f5d4", name: "Kiruna", lat: 67.967, lon: 20.309 },
]

const ctx = document.getElementById('weather-chart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [],  // Initial dataset empty, fetch asynchronously from SMHI
  },
  options: {
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 30,
        right: 50,
        top: 10,
        bottom: 50
      }
    },
    tooltips: {
      mode: 'index',
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          unit: 'day'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Temperature (C)'
        }
      }]
    },
  }
})

// Fetch datasets from SMHI and create time series data
const datasetPromises = cities.map( async (city) => {
  const url = smhiUrl(city.lon, city.lat)
  const response = await fetch(url)

  if (response.ok) {
    const data = await response.json()

    // A city's dataset
    const dataset = {
      label: city.name,
      fill: false,
      borderColor: city.color,
      backgroundColor: city.color,
      data: data.timeSeries.map(
        (time) => {
          const temperature = time.parameters.find( p => p.name == "t" )
          // Sample value of dataset
          return {
            x: new Date(time.validTime),    // (x-axis) Current time in timeseries
            y: temperature?.values[0]       // (y-axis) Current temperature
          }
        }
      ),
    }
    chart.data.datasets.push(dataset)
    chart.update()
    return 
  }
})

// Hide loader when all data fetches loaded
Promise
  .all(datasetPromises)
  .then( () => loader.classList.add('hidden') )
