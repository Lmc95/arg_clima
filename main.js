// Obtener clima por ubicacion actual. 
// Obtener clima por ciudad ingresada. (si tiene espacio, colocar '+' en lugar del espacio)
/*
Mostrar informacion de:
Temperatura celcius.
Estado del día (soleado, lluvia etc...).
Viento.
Humedad.
Fecha.
ICONOS Dependiendo el clima.
*/

// import config from './config.js';
window.addEventListener('load', () => {

    const buscarCiudad = document.getElementById('buscar');
    const btnBuscar = document.getElementById('btn_buscar');

    // VARIABLES A CARGAR DESDE API
    const imgClima = document.getElementById('img_dia');
    const estadoClima = document.getElementById('estado_dia');
    const temp = document.getElementById('temp_actual');
    // const tempMaxMin = document.getElementById('max_min');
    const sensTermica = document.getElementById('sens_termica');
    const humedad = document.getElementById('humedad');
    const viento = document.getElementById('viento');
    const ubicacionCiudad = document.getElementById('ciudad');
    const fechaUbi = document.getElementById('fecha');

    // Importa el paquete dotenv y carga las variables de entorno

    // APIKEY OpenWeatherMap.
    let apiKey = apiKeyNetlify;
    console.log(`Api desde netlify: ${apiKey}`);

    let ciudadIngresada = '';
    // SE TOMA EL VALOR EN TIEMPO REAL DEL INPUT
    buscarCiudad.addEventListener('input', (e) => {
        console.log(e.target.value);
    })

    // SE ENVIA LO QUE EL USUARIO INGRESO EN EL INPUT Y
    // SE DEVUELVE EL CLIMA DE LA CIUDAD INGRESADA SI ES VÁLIDA
    btnBuscar.addEventListener('click', () => {
        inputUsuario();
    });
    buscarCiudad.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            inputUsuario();
        }
    })

    const inputUsuario = () => {
        ciudadIngresada = buscarCiudad.value.toLowerCase();
        buscarCiudad.value = '';
        let palabra = ciudadIngresada.replace(/ /g, '+'); // Cambia los 'Espacios' por '+'
        console.log(`RESULTADO: ${palabra}`);

        const urlCiudad = `https://api.openweathermap.org/data/2.5/weather?q=${palabra},ar&appid=${apiKey}&units=metric`;
        console.log(`MOSTRANDO CLIMA POR BUSQUEDA DEL USUARIO.`)
        llamadaClima(urlCiudad);

        // Hay que mostrar en la condicion los datos del clima solo si es valido lo ingresado
        if (ciudadIngresada != '') {
            console.log(`LA CIUDAD INGRESADA ES: ${ciudadIngresada}`);
            listaCiudades();
        } else {
            console.log('Ingresa una ciudad válida!');
        }
        // PALABRA = CIUDAD LISTA PARA IMPLEMENTAR EN EL LINK DE LA API
    }

    // OBTENEMOS LA LISTA DE CIUDADES DISPONIBLES EN LA API 'OPENWEATHERMAP'.
    const listaCiudades = () => {
        fetch('city.list.json')
            .then(res => res.json())
            .then(data => {
                const ciudades = data;
                // Filtramos las ciudades que sean de "AR - Argentina"
                const ciudadesArg = ciudades.filter(ciudad => ciudad.country === 'AR');
                console.log(`Hay ${ciudadesArg.length} ciudades argentina disponibles para consultar.`)
                ciudadesArg.forEach(ciudad => {
                    // AQUI PODEMOS REALIZAR EL FILTRO DE LAS CIUDADES QUE TIENEN EL MISMO NOMBRE
                    // console.log(`${ciudad.name}, ${ciudad.country}`)
                });
                console.log('SE EJECUTO LISTA CIUDADES')
            })
    }

    // MUESTRA DATOS DE CLIMA SI ES ACEPTADO MOSTRAR POR UBICACIÓN
    let lat;
    let lon;
    const climaCordenadas = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;

                const urlUbicacion = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                console.log(`MOSTRANDO CLIMA POR UBICACIÓN.`);
                llamadaClima(urlUbicacion);

            }
            )
        }
    }

    const llamadaClima = (url) => {
        fetch(url)
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                // Cargamos los datos al DOM
                // tempMaxMin.textContent = `MAX. ${Math.round(data.main.temp_max)}°c - MIN. ${Math.round(data.main.temp_min)}°c`

                temp.textContent = `${Math.round(data.main.temp)}°c`
                sensTermica.innerHTML = `St: <span>${Math.round(data.main.feels_like)}°c </span>`
                humedad.innerHTML = `Humedad: <span>${Math.round(data.main.humidity)}%</span>`
                const vientoKmh = data.wind.speed * 3.6;
                viento.innerHTML = `Viento: <span>${Math.round(vientoKmh)} km/h</span>`;
                ubicacionCiudad.textContent = `${data.name}, ${data.sys.country}`;

                // Obtenemos hora de amanecer y atardecer
                let amanecer = data.sys.sunrise;
                let atardecer = data.sys.sunset;
                // Obtenemos la fecha del dia actual.
                let tiempoUnix = data.dt;
                let zonaHoraria = data.timezone;

                // Verificamos si es día o noche
                if (tiempoUnix > amanecer && tiempoUnix < atardecer) {
                    // console.log('DÍA')
                    icoClimaDia(data, estadoClima);
                } else {
                    // console.log('NOCHE')
                    icoClimaNoche(data, estadoClima)
                }

                // Fecha
                const fecha = new Date(tiempoUnix * 1000).toLocaleDateString();
                // console.log(fecha)

                // Hora --------------------
                const convertirHora = (unix, timezone) => {
                    // Convertimos el timestamp UNIX a milisegundos
                    const horaUtc = new Date(unix * 1000);
                    // Creamos la hora local ajustando la zona horaria del servidor
                    const horaLocal = new Date(horaUtc.getTime() + timezone * 1000);
                    return horaLocal;
                }
                const horaLocal = convertirHora(tiempoUnix, zonaHoraria);

                // Convertir la hora local a formato legible
                const opciones = { timeZone: 'UTC', timeZoneName: 'short' };
                const horaLocalLegible = horaLocal.toLocaleString('es-ES', opciones);

                const formatearFecha = () => {
                    const dia = new Date(horaLocalLegible).getDate();
                    const mes = new Date(horaLocalLegible).getMonth() + 1;
                    const anio = new Date(horaLocalLegible).getFullYear();
                    const hora = new Date(horaLocalLegible).getUTCHours();

                    let formatearDia;
                    let formatearMes;

                    if (dia < 10) {
                        formatearDia = '0' + dia;
                    } else {
                        formatearDia = dia;
                    }

                    if (mes < 10) {
                        formatearMes = '0' + mes;
                    } else {
                        formatearMes = mes;
                    }

                    // console.log('FORMATEANDO FECHA:')
                    return `${formatearDia}/${formatearMes}/${anio} - ${hora}:00`
                }
                fechaUbi.textContent = `${formatearFecha()}`
                // console.log(formatearFecha())
                // ----------------------//
            })
            .catch(error => {
                console.error('ERROR', error);
            });
    }

    climaCordenadas();
    // MUESTRAN LA IMAGEN DEL ESTADO DE CLIMA DEPENDIENDO SI ES DÍA O NOCHE AL IGUAL QUE LA INFO DEL ESTADO DEL DÍA/NOCHE
    const icoClimaDia = (datos, estado) => {
        switch (datos.weather[0].description) {
            // ESTADO DEL CLIMA (DÍA)
            case 'clear sky': // DESPEJADO
                // console.log('ok');
                estado.textContent = 'DESPEJADO'
                imgClima.src = 'assets/img_clima/animated/day.svg'
                break;
            case 'few clouds': // NUBES DISPERSAS
                // console.log('ok')
                estado.textContent = 'NUBES DISPERSAS'
                imgClima.src = 'assets/img_clima/animated/cloudy-day-2.svg'
                break;
            case 'scattered clouds' || 'broken clouds': // NUBLADO
                // console.log('ok');
                estado.textContent = 'NUBLADO'
                imgClima.src = 'assets/img_clima/animated/cloudy.svg'
                break;
            case 'shower rain' || 'rain': // LLUVIA SIN SOL (intensa)
                // console.log('ok');
                estado.textContent = 'LLUVIA'
                imgClima.src = 'assets/img_clima/animated/rainy-4.svg'
                break;
            case 'thunderstorm': // TORMENTA ELECTRICA
                // console.log('ok');
                estado.textContent = 'TORMENTA'
                imgClima.src = 'assets/img_clima/animated/thunder.svg'
                break;
            case 'snow': // NIEVE
                // console.log('ok');
                estado.textContent = 'NEVANDO'
                imgClima.src = 'assets/img_clima/animated/snowy-4.svg'
                break;
            default:
                console.log('Error en el clima!')
                break;
        }
    }
    const icoClimaNoche = (datos, estado) => {
        switch (datos.weather[0].description) {
            // ESTADO DEL CLIMA (DÍA)
            case 'clear sky': // DESPEJADO
                // console.log('ok');
                estado.textContent = 'DESPEJADO'
                imgClima.src = 'assets/img_clima/animated/night.svg'
                break;
            case 'few clouds': // NUBES DISPERSAS
                // console.log('ok')
                estado.textContent = 'NUBES DISPERSAS'
                imgClima.src = 'assets/img_clima/animated/cloudy-night-2.svg'
                break;
            case 'scattered clouds' || 'broken clouds': // NUBLADO
                // console.log('ok');
                estado.textContent = 'NUBLADO'
                imgClima.src = 'assets/img_clima/animated/cloudy.svg'
                break;
            case 'shower rain' || 'rain': // LLUVIA SIN SOL (intensa)
                // console.log('ok');
                estado.textContent = 'LLUVIA'
                imgClima.src = 'assets/img_clima/animated/rainy-4.svg'
                break;
            case 'thunderstorm': // TORMENTA ELECTRICA
                // console.log('ok');
                estado.textContent = 'TORMENTA'
                imgClima.src = 'assets/img_clima/animated/thunder.svg'
                break;
            case 'snow': // NIEVE
                // console.log('ok');
                estado.textContent = 'NEVANDO'
                imgClima.src = 'assets/img_clima/animated/snowy-4.svg'
                break;
            default:
                console.log('Error en el clima!')
                break;
        }
    }
})



