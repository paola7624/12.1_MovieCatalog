document.addEventListener("DOMContentLoaded", () => {
    let movies = [];

    // Obtener listado de películas al cargar la página
    const apiURL = "https://japceibal.github.io/japflix_api/movies-data.json";
    fetch(apiURL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            movies = data;
        })
        .catch(error => {
            console.error("Hubo un problema al obtener los datos: ", error);
        });

    // Función para generar estrellas a partir del vote_average
    function addStars(voteAverage) {
        const stars = (voteAverage / 2);  // Convierte a escala de 5
        let starsShowed = '';
        
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(stars)) {
                starsShowed += '<i class="fa fa-star text-warning"></i>'; // Estrella llena
            } else if (i === Math.ceil(stars) && stars % 1 !== 0) {
                starsShowed += '<i class="fa fa-star-half-o text-warning"></i>'; // Media estrella
            } else {
                starsShowed += '<i class="fa fa-star-o"></i>'; // Estrella vacía
            }
        }
        return starsShowed;
    }

    // Función para mostrar los resultados de la búsqueda
    function showResults(moviesFiltered) {
        const list = document.getElementById('lista');
        list.innerHTML = ''; // Limpiar lista

        moviesFiltered.forEach(movie => {
            const item = document.createElement('li');
            item.classList.add('list-group-item', 'bg-dark', 'text-white');
            item.innerHTML = `
                <div id="movie-${movie.id}" class="movie-item">
                    <h5>${movie.title}</h5>
                    <p>${movie.tagline}</p>
                    <div>Valoración: ${addStars(movie.vote_average)}</div>
                </div>
            `;

            // Añadir el event listener para abrir el offcanvas al hacer clic
            item.addEventListener('click', () => {
                addCanva(movie);  // Llama a la función pasando la película seleccionada
            });

            list.appendChild(item);
        });
    }

    // Agregar funcionalidad al botón buscar para que ejecute la búsqueda
    document.getElementById('btnBuscar').addEventListener('click', () => {
        const inputBuscar = document.getElementById('inputBuscar').value.toLowerCase();
        if (inputBuscar) {
            // Filtrar las películas según el título, tagline, género o overview
            const moviesFiltered = movies.filter(movie => 
                movie.title.toLowerCase().includes(inputBuscar) ||
                movie.tagline.toLowerCase().includes(inputBuscar) ||
                movie.genres.join(', ').toLowerCase().includes(inputBuscar) ||
                movie.overview.toLowerCase().includes(inputBuscar)
            );
            showResults(moviesFiltered);
        }
    });

    // Función para mostrar la información de la película en el Offcanvas
    function addCanva(movie) {
        let existingCanva = document.getElementById('movie-offcanvas');
        
        // Elimina cualquier Offcanvas existente
        if (existingCanva) {
            existingCanva.remove(); 
        }

        // Crear nuevo Offcanvas
        const item = document.createElement('div');
        item.id = 'movie-offcanvas';
        item.classList.add('offcanvas', 'offcanvas-top', 'bg-dark', 'text-white');
        item.tabIndex = "-1"; // Para hacer accesible el canvas
        item.setAttribute("data-bs-scroll", "true");
        item.setAttribute("data-bs-backdrop", "false");  // Ajustes del offcanvas

        // Asegúrate de que el CSS no establezca altura fija
        item.style.overflow = 'visible'; // Evitar scroll

        // Convertimos la fecha de lanzamiento solo al año
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Desconocido';

        item.innerHTML = `
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvasLabel">${movie.title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <hr class="my-3" style="border-top: 1px solid #444;">
            <div class="offcanvas-body">
                <div>
                    <img id="poster-${movie.id}" class="img-fluid mb-3" alt="Póster de ${movie.title}">
                    <p>${movie.overview}</p>
                    <p>${movie.genres.map(genre => genre.name).join(' - ')}</p>
                </div>
                <div class="dropdown-center mt-3">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    More
                    </button>
                    <ul class="dropdown-menu">
                    <li><strong>Año de lanzamiento:</strong> ${releaseYear}</li>
                    <li><strong>Duración:</strong> ${movie.runtime ? movie.runtime + ' minutos' : 'Desconocido'}</li>
                    <li><strong>Presupuesto:</strong> $${movie.budget.toLocaleString()}</li>
                    <li><strong>Ganancias:</strong> $${movie.revenue.toLocaleString()}</li>
                </ul>
                </div>
            </div>
        `;

        // Agregamos el offcanvas al body
        document.body.appendChild(item);

        // Usamos Bootstrap para inicializar el Offcanvas
        let offcanvasElement = new bootstrap.Offcanvas(item);
        offcanvasElement.show();
    }



    // Función para obtener el póster de la película usando TMDb
    function getMoviePoster(movie) {
        const apiKey = '';
        const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movie.title)}`;

        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                // Tomamos el primer resultado y obtenemos el poster_path
                const posterPath = data.results[0].poster_path;
                const posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;

                // Añadir el póster al DOM (dentro del Offcanvas)
                document.getElementById(`poster-${movie.id}`).src = posterUrl;
            } else {
                console.log('No se encontró un póster para la película:', movie.title);
            }
        })
        .catch(error => console.error('Error al obtener el póster:', error));
}

});