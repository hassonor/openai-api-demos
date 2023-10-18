import axios from "axios";

export const getWeather = async (parsed_function_arguments) => {
    try {
        const response = await axios.get(
            'http://api.weatherapi.com/v1/current.json',
            {params: {q: parsed_function_arguments.location, key: process.env.WEATHER_API_KEY}}
        );

        const weather = response.data;
        const {condition, temp_c, temp_f} = weather.current;
        const unit = parsed_function_arguments.unit !== 'fahrenheit' ? 'celsius' : 'fahrenheit';
        const temperature = unit === 'celsius' ? temp_c : temp_f;

        return {temperature, unit, description: condition.text};
    } catch (error) {
        console.error(error);
    }
}