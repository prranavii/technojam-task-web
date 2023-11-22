import axios from "axios";

export function getWeather(lat, lon, tz) {
  return axios
    .get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lon,
        current: "temperature_2m,wind_speed_10m",
        hourly:
          "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,wind_speed_10m_max",
        timeformat: "unixtime",
        timezone: tz,
      },
    })
    .then(({ data }) => {
      console.log(data)
      return {
        current: parseCurrentWeather(data),
        daily: parseDailyWeather(data),
        hourly: parseHourlyWeather(data),
      };
    });
}



function parseCurrentWeather({ current, daily }) {
  const { temperature_2m, wind_speed_10m } = current;
  const {
    weather_code,
    apparent_temperature_max,
    temperature_2m_max,
    temperature_2m_min,
    apparent_temperature_min,
    precipitation_sum,
  } = daily;
  return {
    currentTemp: temperature_2m,
    highTemp: temperature_2m_max[0],
    lowTemp: temperature_2m_min[0],
    highFL: apparent_temperature_max[0],
    lowFL: apparent_temperature_min[0],
    windSpeed: wind_speed_10m,
    precip: precipitation_sum[0],
    iconCode: weather_code[0],
  };
}

function parseDailyWeather({ daily }) {
    return daily.time.map((time,index)=>{
        return {
            timestamp:time*1000,
            iconCode:daily.weather_code[index],
            temperature:Math.round(daily.temperature_2m_max[index])
        }
    })
}


function parseHourlyWeather({hourly,current}) {
  return hourly.time.map((time,index)=>{
    return { timestamp:time*1000,
            iconCode:hourly.weather_code[index],
            temperature:Math.round(hourly.temperature_2m[index]),
            feelslike:Math.round(hourly.apparent_temperature[index]),
            windSpeed:Math.round(hourly.wind_speed_10m[index]),
            precipitation:Math.round(hourly.precipitation[index]),
          }       
  }).filter(({timestamp})=> timestamp >= current.time * 1000)
}
  