//* Variable para la BD
let DB

//* Campos del formulario
const mascotaInput = document.querySelector('#mascota')
const propietarioInput = document.querySelector('#propietario')
const telefonoInput = document.querySelector('#telefono')
const fechaInput = document.querySelector('#fecha')
const horaInput = document.querySelector('#hora')
const sintomasInput = document.querySelector('#sintomas')

//* UI
const formulario = document.querySelector('#nueva-cita') // Formulario de nuevas citas
const contenedorCitas = document.querySelector('#citas') // Contenedor para las citas

const heading = document.querySelector('#administra')

let editando = false




//* Definiendo clases
class Citas {
    constructor(){
        this.citas = []
    }

    agregarCita( cita ) {
        // Se agrega una copia del arreglo anterior y la nueva cita
        this.citas = [ ...this.citas, cita ]
        console.log(this.citas)
    }

    editarCita( citaActualizada ) {
        // Asignando el valor
        // Si corresponde al id se sobreescribe sobre ese registro, sino retorna la cita actual para mantener las que se tengan
        this.citas = this.citas.map( cita => cita.id === citaActualizada.id ? citaActualizada : cita )
    }
}


class UI {

    // Desestructurando del objeto que se recibe
    constructor({ citas }){
        this.textoHeading(citas)        
    }

    //* Se definen funciones globales de la clase     
    mostrarAlerta( mensaje, tipo ){
        // Creando div 
        const divMensaje = document.createElement('div')
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12')

        // Agregar clase en base al tipo de mensaje
        if ( tipo === 'error' ){
            divMensaje.classList.add('alert-danger')
        } else {
            divMensaje.classList.add('alert-success')
        }

        // Mensaje de error
        divMensaje.textContent = mensaje

        // Agregar al DOM
        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'))

        // Quitar alerta después de 5 segundos
        setTimeout(() => {
            divMensaje.remove()
        }, 2000);
    }


    //* Muestra las citas en el HTML
    imprimirCitas() {

        this.limpiarHTML()
        
        // this.textoHeading(citas)

        //* Leer el contenido de la base de datos - especificando la bd y el objectStore
        const objectStore = DB.transaction('citas').objectStore('citas')
        const fntTextoHeading = this.textoHeading
        const total = objectStore.count()

        // Obteniendo el result, es necesario hacerlo por medio de la función
        total.onsuccess = function () {
            fntTextoHeading(total.result)    
        }
        
        // Recorriendo todos los valores de la DB con openCursor
        objectStore.openCursor().onsuccess = (e) => {
            const cursor = e.target.result
            
            if ( cursor ){
                const { id, mascota, propietario, telefono, fecha, hora, sintomas } = cursor.value

                const divCita = document.createElement('div')
                divCita.classList.add('cita', 'p-3')
                // Atributo personalizado
                divCita.dataset.id = id 
    
                //? Scripting de los elementos de la cita
                // - Mascota
                const mascotaParrafo = document.createElement('h2')
                mascotaParrafo.classList.add('card-title', 'font-weight-bolder')
                mascotaParrafo.textContent = mascota
    
                // - Propietario
                const PropietarioParrafo = document.createElement('p')
                PropietarioParrafo.innerHTML = `<span class="font-weight-bolder">Propietario: </span> ${propietario}`
    
                // - Teléfono
                const TelefonoParrafo = document.createElement('p')
                TelefonoParrafo.innerHTML = `<span class="font-weight-bolder">Telefono: </span> ${telefono}`
                
                // - Fecha
                const FechaParrafo = document.createElement('p')
                FechaParrafo.innerHTML = `<span class="font-weight-bolder">Fecha: </span> ${fecha}`
        
                // - Hora
                const HoraParrafo = document.createElement('p')
                HoraParrafo.innerHTML = `<span class="font-weight-bolder">Hora: </span> ${hora}`
                
                // - Sintomas
                const SintomasParrafo = document.createElement('p')
                SintomasParrafo.innerHTML = `<span class="font-weight-bolder">Sintomas: </span> ${sintomas}`
    
    
                //? Botón para eliminar 
                const btnEliminar = document.createElement('button')
                btnEliminar.onclick = () => eliminarCita(id)
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2')
                btnEliminar.innerHTML = `Eliminar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`
    
    
                //? Añade botón para editar
                const btnEditar = document.createElement('button')
                
                //? Obteniendo el valor del registro de IndexedDB
                const cita = cursor.value 
                btnEditar.onclick = () => cargarEdicion(cita)
                
                btnEditar.classList.add('btn', 'btn-info')
                btnEditar.innerHTML = `Editar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>`
    
    
                //? Agregar los párrafos al divCita 
                divCita.appendChild(mascotaParrafo)
                divCita.appendChild(PropietarioParrafo)
                divCita.appendChild(TelefonoParrafo)
                divCita.appendChild(FechaParrafo)
                divCita.appendChild(HoraParrafo)
                divCita.appendChild(SintomasParrafo)
                divCita.appendChild(btnEliminar)
                divCita.appendChild(btnEditar)
    
                //? Agregar citas (con los elementos agregados anteriormente) al HTML
                contenedorCitas.appendChild(divCita)

                //? Ir al siguiente elemento
                cursor.continue()
            }
        }

    }

    textoHeading( resultado ){
        if ( resultado > 0) {
            heading.textContent = 'Administra tus citas'
        } else {
            heading.textContent = 'No hay citas que mostrar'
        }
    }

    //* Remueve lo que contenga el contenedor para mostrar solo la cita agredada y no duplicar otra
    limpiarHTML() {
        while( contenedorCitas.firstChild ){
            // Eliminando cada uno de los hijos
            contenedorCitas.removeChild( contenedorCitas.firstChild )
        }
    } 

}



//* Instancia de la clase
const administrarCitas = new Citas()
const ui = new UI(administrarCitas)


//* Objeto principal con la información de la cita
const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '', 
    hora: '',
    sintomas: ''
}

//* Registrar eventos
const eventListeners = () => {
    // Escuchadores de los input del formulario
    mascotaInput.addEventListener('input', datosCita)
    propietarioInput.addEventListener('input', datosCita)
    telefonoInput.addEventListener('input', datosCita)
    fechaInput.addEventListener('input', datosCita)
    horaInput.addEventListener('input', datosCita)
    sintomasInput.addEventListener('input', datosCita)

    // Escuchador en el botón de Crear Cita
    formulario.addEventListener('submit', nuevaCita)
}


//* Funciones 
//? Agrega datos escritos en el formulario al objeto de cita
const datosCita = (e) => {
    //* Buscando la propiedad del objeto por medio del name del formulario y asignandole el valor escrito dentro del formulario
    citaObj[e.target.name] = e.target.value
}


//? Valida y agrega nueva cita a la clase de Citas
const nuevaCita = (e) => {

    e.preventDefault()

    // Extraer información del objeto de cita
    const { mascota, propietario, telefono, fecha, hora, sintomas } = citaObj

    // Validar que los inputs tengan información
    if ( mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '' ){
        ui.mostrarAlerta('Todos los campos son obligatorios', 'error')
        return
    }

    //* Validación para identifica si es nueva o actualizar cita
    if ( editando ) {
        //* ===== EDITANDO CITA =====
        // Mensaje de agreado correctamente
        ui.mostrarAlerta('Se editó correctamente la cita')

        // Pasar el objeto de la cita a edición
        administrarCitas.editarCita({ ...citaObj })


        //* Editando el registro en IndexedDB    
        const transaction = DB.transaction(['citas'], 'readwrite')
        const objectStore = transaction.objectStore('citas')
        objectStore.put(citaObj) // Actualizando


        // Si hace correctamente se ejecuta
        transaction.oncomplete = () => {
            
            ui.mostrarAlerta('Se agregó correctamente la cita')

            // Regresando el texto del botón a su título original
            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita'
            
            // Quitar modo edición
            editando = false
        }

        // En caso de error
        transaction.onerror = () => {
            console.log("Ha ocurrido un error al actualizar el registro")
        }

        
    } else {
        //* ===== NUEVO REGISTRO ===== 
        // Generar id
        citaObj.id = Date.now()
    
        /**
         * Creando nueva cita por medio de la función que tiene la instancia la Clase Citas
         * Pasando una copia del objeto y no todo porque se agrega el último la cantidad de registros que tuviera
         */
        administrarCitas.agregarCita({ ...citaObj })

        //* Insertar Registro en IndexedDB
        const transaction = DB.transaction(['citas'], 'readwrite')
        // Habilitando objectStore
        const objectStore = transaction.objectStore('citas')
        // Insertando en DB
        objectStore.add(citaObj)

        // Si hace correctamente se ejecuta
        transaction.oncomplete = () => {
            console.log('Cita agregada en DB')

            // Mensaje de agreado correctamente
            ui.mostrarAlerta('Se agregó correctamente la cita')
        }

    }


    // Reiniciar el objeto para la validación
    reiniciarObj()

    // Reiniciar formulario
    formulario.reset()

    /**
     * Mostrar HTML de la cita creada
     * Se le pasa el arreglo de las citas 
     */
    ui.imprimirCitas()

}


//?  Reinicia valores del formulario 
const reiniciarObj = () => {
    citaObj.mascota = ''
    citaObj.propietario = ''
    citaObj.telefono = ''
    citaObj.fecha = ''
    citaObj.hora = ''
    citaObj.sintomas = ''
}


//? Eliminar cita
const eliminarCita = (id) => {

    const transaction = DB.transaction(['citas'], 'readwrite')
    const objectStore = transaction.objectStore('citas')
    // Eliminar registro
    objectStore.delete(id)

    //* Al completarse correctamente 
    transaction.oncomplete = () => {
        console.log(`Cita ${id} eliminada`)
        
        // Limpiar formulario
        formulario.reset()
    
        // Muestra un mensaje
        ui.mostrarAlerta('La cita se eliminó correctamente')
    
        // Refresca las citas
        ui.imprimirCitas()
    }

    //* En caso de ocurrir un error
    transaction.onerror = () => {
        console.log("Ocurrió un error al eliminar cita")
    }


}


//? Cargar los datos y el modo edición
const cargarEdicion = ( cita ) => {
    // Extrayendo las propiedades del objeto
    const { mascota, propietario, telefono, fecha, hora, sintomas } = cita

    // Llenar los inputs
    mascotaInput.value = mascota
    propietarioInput.value = propietario
    telefonoInput.value = telefono
    fechaInput.value = fecha
    horaInput.value = hora
    sintomasInput.value = sintomas

    // Llenar valores en el objeto
    citaObj.mascota = mascota
    citaObj.propietario = propietario
    citaObj.telefono = telefono
    citaObj.fecha = fecha
    citaObj.hora = hora
    citaObj.sintomas = sintomas


    // Cambiar el texto del botón cuando se quiera editar
    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios'

    editando = true

}




//? Creando base de datos usando IndexedDB
const createDB = () => {

    //* Crear la base de datos en versión 1.0
    const crearDB = window.indexedDB.open('citas', 1)

    // En caso de haber un error 
    crearDB.onerror = () => {
        console.log('Ha ocurrido un error')
    }

    // Si todo está correcto
    crearDB.onsuccess = () => {
        console.log('Se crea la DB')

        // Se asigna el resultado 
        DB = crearDB.result

        // Mostrar citas al cargar (con IndexedDB cargado)
        ui.imprimirCitas()
    }

    
    //* Definición del esquema 
    crearDB.onupgradeneeded = (e) => {
        const db = e.target.result

        //* Se define que se usará el id como identificador único 
        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncrement: true
        })

        //* Definir todas las columnas 
        /**
         * nombre de columna y key path (referencia)
         */
        objectStore.createIndex('mascota', 'mascota', { unique: false })
        objectStore.createIndex('propietario', 'propietario', { unique: false })
        objectStore.createIndex('telefono', 'telefono', { unique: false })
        objectStore.createIndex('fecha', 'fecha', { unique: false })
        objectStore.createIndex('hora', 'hora', { unique: false })
        objectStore.createIndex('sintomas', 'sintomas', { unique: false })
        objectStore.createIndex('id', 'id', { unique: true })

        console.log('DB creada correctamente')
    }
}




//? Ejecutando los eventos al iniciar el document
window.onload = () => {
    eventListeners()
    createDB()
}




